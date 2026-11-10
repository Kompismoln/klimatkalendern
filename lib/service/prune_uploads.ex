defmodule Mobilizon.Service.PruneUploads do
  @moduledoc """
  Prunes the local uploads directory of the files nothing uses.

  A file is used when an actor, local or remote, has it as avatar or banner; when a media row that
  is attached (an event's or post's picture, in an event, post or comment, an admin setting) has
  it; or when an event's, post's, comment's or actor's text links to it. Unattached media rows of
  a pruned file go with it. The exports directory is left alone.
  """

  import Ecto.Query
  alias Mobilizon.Config
  alias Mobilizon.Medias.Media
  alias Mobilizon.Storage.Repo
  alias Mobilizon.Web.Upload
  alias Mobilizon.Web.Upload.Uploader.Local

  @type pruned :: %{path: String.t(), size: non_neg_integer(), media_ids: [integer()]}

  @attached """
  EXISTS (SELECT 1 FROM events WHERE events.picture_id = m.id)
  OR EXISTS (SELECT 1 FROM events_medias WHERE events_medias.media_id = m.id)
  OR EXISTS (SELECT 1 FROM posts WHERE posts.picture_id = m.id)
  OR EXISTS (SELECT 1 FROM posts_medias WHERE posts_medias.media_id = m.id)
  OR EXISTS (SELECT 1 FROM comments_medias WHERE comments_medias.media_id = m.id)
  OR EXISTS (SELECT 1 FROM admin_settings_medias WHERE admin_settings_medias.media_id = m.id)
  """

  @linked_in_text """
  SELECT (regexp_matches(t, '/media/([^"''<>\\s?#)]+)', 'g'))[1]
  FROM (
    SELECT description FROM events WHERE description LIKE '%/media/%'
    UNION ALL SELECT body FROM posts WHERE body LIKE '%/media/%'
    UNION ALL SELECT text FROM comments WHERE text LIKE '%/media/%'
    UNION ALL SELECT summary FROM actors WHERE summary LIKE '%/media/%'
  ) AS texts(t)
  """

  @doc """
  Deletes the files of the uploads directory that nothing uses and that are older than the grace
  period, with their unattached media rows, and returns them.

  Reads every actor's pictures, every media row and every text that links to /media/, and walks
  the uploads directory.

  Options:
   * `grace_period` how old in hours a file must be to be deleted, by its modification time
     (default: `[:instance, :orphan_upload_grace_period_hours]`)
   * `dry_run` returns the files that would be deleted, deleting nothing
  """
  @spec prune(Keyword.t()) :: {:ok, [pruned()]} | {:error, :uploader_not_local}
  def prune(opts \\ []) do
    if Config.get([Upload, :uploader]) == Local do
      do_prune(opts)
    else
      {:error, :uploader_not_local}
    end
  end

  defp do_prune(opts) do
    grace_period =
      Keyword.get_lazy(opts, :grace_period, fn ->
        Config.get([:instance, :orphan_upload_grace_period_hours], 48)
      end)

    dir = Path.expand(Config.get!([Local, :uploads]))
    cutoff = System.os_time(:second) - grace_period * 3600
    {used, unattached} = references(cutoff)

    pruned =
      dir
      |> list_files(excluded_dirs(dir))
      |> Enum.reject(fn {path, _stat} -> MapSet.member?(used, path) end)
      |> Enum.filter(fn {_path, %File.Stat{mtime: mtime}} -> mtime < cutoff end)
      |> Enum.map(fn {path, %File.Stat{size: size}} ->
        %{path: path, size: size, media_ids: Map.get(unattached, path, [])}
      end)

    unless Keyword.get(opts, :dry_run, false), do: Enum.each(pruned, &delete(&1, dir))

    {:ok, pruned}
  end

  # Returns the paths in use, and the ids of the unattached media rows by their path.
  @spec references(integer()) :: {MapSet.t(String.t()), %{String.t() => [integer()]}}
  defp references(cutoff) do
    %{rows: pictures} =
      Repo.query!("""
      SELECT avatar ->> 'url' FROM actors WHERE avatar ->> 'url' IS NOT NULL
      UNION ALL SELECT banner ->> 'url' FROM actors WHERE banner ->> 'url' IS NOT NULL
      """)

    # Fact: Dedupe stores a picture that's there already by leaving the file, and its mtime, as it
    # is, so a media row younger than the grace period keeps its file whatever the file's age.
    %{rows: medias} =
      Repo.query!(
        "SELECT m.id, m.file ->> 'url', (#{@attached}) OR m.inserted_at >= to_timestamp($1) FROM medias m",
        [cutoff]
      )

    %{rows: links} = Repo.query!(@linked_in_text)

    used =
      Enum.map(pictures, fn [url] -> url_path(url) end) ++
        for([_id, url, true] <- medias, do: url_path(url)) ++
        Enum.map(links, fn [path] -> URI.decode(path) end)

    unattached =
      medias
      |> Enum.flat_map(fn
        [id, url, false] -> [{url_path(url), id}]
        _ -> []
      end)
      |> Enum.reject(fn {path, _id} -> is_nil(path) end)
      |> Enum.group_by(fn {path, _id} -> path end, fn {_path, id} -> id end)

    {used |> Enum.reject(&is_nil/1) |> MapSet.new(), unattached}
  end

  # Fact: Upload.url_from_spec/3 makes a file's URL of the base URL, "media" and its URI-encoded
  # path, with ?name=... when link_name is set.
  @spec url_path(String.t() | nil) :: String.t() | nil
  defp url_path(url) when is_binary(url) do
    case String.split(url, "/media/", parts: 2) do
      [_, path] -> path |> String.split(["?", "#"], parts: 2) |> hd() |> URI.decode()
      _ -> nil
    end
  end

  defp url_path(_), do: nil

  defp excluded_dirs(dir) do
    case Config.get([:exports, :path]) do
      nil -> []
      exports -> [Path.relative_to(Path.expand(exports), dir)]
    end
  end

  @spec list_files(String.t(), [String.t()]) :: [{String.t(), File.Stat.t()}]
  defp list_files(dir, excluded) do
    dir
    |> Path.join("**")
    |> Path.wildcard()
    |> Enum.map(&{Path.relative_to(&1, dir), File.stat!(&1, time: :posix)})
    |> Enum.filter(fn {path, %File.Stat{type: type}} ->
      type == :regular and
        not Enum.any?(excluded, &(path == &1 or String.starts_with?(path, &1 <> "/")))
    end)
  end

  defp delete(%{path: path, media_ids: media_ids}, dir) do
    Repo.delete_all(from(m in Media, where: m.id in ^media_ids))
    full_path = Path.join(dir, path)
    File.rm(full_path)

    # Accommodating for uploads without Dedupe, which go to "<id>/<name>": the emptied folder goes.
    parent = Path.dirname(full_path)
    if parent != dir, do: File.rmdir(parent)
  end
end
