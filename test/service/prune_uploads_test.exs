defmodule Mobilizon.Service.PruneUploadsTest do
  use Mobilizon.DataCase
  use Mobilizon.Tests.Helpers

  import Mobilizon.Factory

  alias Mobilizon.Medias
  alias Mobilizon.Service.PruneUploads
  alias Mobilizon.Web.Upload.Uploader.Local

  @moduletag :tmp_dir
  @old System.os_time(:second) - 3 * 24 * 3600

  setup %{tmp_dir: dir} do
    clear_config([Local, :uploads], dir)
    clear_config([:exports, :path], Path.join(dir, "exports"))
    clear_config([:instance, :orphan_upload_grace_period_hours], 48)

    insert(:actor, avatar: %{url: url("avatar.png"), name: "avatar"})

    insert(:actor,
      domain: "remote.example",
      user: nil,
      banner: %{url: url("banner.png"), name: "b"}
    )

    insert(:event, picture: insert(:media, file: file("event%20picture.png")))
    insert(:event, description: ~s(<p><img src="#{url("linked.png")}"></p>))
    unattached = insert(:media, file: file("unattached.png"))
    shared = insert(:media, file: file("shared.png"))
    insert(:post, picture: insert(:media, file: file("shared.png")))

    for path <- [
          "avatar.png",
          "banner.png",
          "event picture.png",
          "linked.png",
          "unattached.png",
          "shared.png",
          "nobody.png",
          "a1b2/old style.png",
          "exports/participants.csv"
        ] do
      write(dir, path, @old)
    end

    write(dir, "recent.png", System.os_time(:second))

    %{unattached: unattached, shared: shared}
  end

  test "deletes the files nothing uses, with their unattached media", %{
    tmp_dir: dir,
    unattached: unattached,
    shared: shared
  } do
    assert {:ok, pruned} = PruneUploads.prune()

    assert pruned |> Enum.map(& &1.path) |> Enum.sort() ==
             ["a1b2/old style.png", "nobody.png", "unattached.png"]

    unattached_id = unattached.id
    assert %{media_ids: [^unattached_id]} = Enum.find(pruned, &(&1.path == "unattached.png"))

    # Fact: the :file factory stores a picture in the uploads directory for each event too.
    left = files(dir)

    for path <- [
          "avatar.png",
          "banner.png",
          "event picture.png",
          "exports/participants.csv",
          "linked.png",
          "recent.png",
          "shared.png"
        ] do
      assert path in left
    end

    for %{path: path} <- pruned, do: refute(path in left)
    refute File.exists?(Path.join(dir, "a1b2"))
    assert Medias.get_media(unattached.id) == nil
    # Fact: shared.png has an unattached media row too, but a post's picture uses the file.
    assert Medias.get_media(shared.id)
  end

  test "deletes nothing on a dry run", %{tmp_dir: dir, unattached: unattached} do
    before = files(dir)
    assert {:ok, [_, _, _]} = PruneUploads.prune(dry_run: true)
    assert files(dir) == before
    assert Medias.get_media(unattached.id)
  end

  test "keeps the files younger than the grace period", %{tmp_dir: dir} do
    assert {:ok, []} = PruneUploads.prune(grace_period: 4 * 24)
    assert "nobody.png" in files(dir)
  end

  test "refuses an uploader other than the local one" do
    clear_config([Mobilizon.Web.Upload, :uploader], SomeOtherUploader)
    assert {:error, :uploader_not_local} = PruneUploads.prune()
  end

  defp url(path), do: "http://mobilizon.test/media/#{path}?name=#{path}"

  defp file(path),
    do: %Mobilizon.Medias.File{url: url(path), name: path, content_type: "image/png", size: 1}

  defp write(dir, path, mtime) do
    full_path = Path.join(dir, path)
    File.mkdir_p!(Path.dirname(full_path))
    File.write!(full_path, path)
    File.touch!(full_path, mtime)
  end

  defp files(dir) do
    dir
    |> Path.join("**")
    |> Path.wildcard()
    |> Enum.filter(&File.regular?/1)
    |> Enum.map(&Path.relative_to(&1, dir))
    |> Enum.sort()
  end
end
