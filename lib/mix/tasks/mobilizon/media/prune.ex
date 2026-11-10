defmodule Mix.Tasks.Mobilizon.Media.Prune do
  @moduledoc """
  Task to delete the uploaded files nothing uses

  See `Mobilizon.Service.PruneUploads` for what counts as used.

  ## Options
    * `--dry-run` - list the files that would be deleted, deleting nothing
    * `--days`, `-d` - how old in days a file must be to be deleted (default: the
      `orphan_upload_grace_period_hours` instance setting, 48 hours)
    * `--verbose`, `-v` - list the files deleted
  """
  use Mix.Task
  import Mix.Tasks.Mobilizon.Common
  alias Mobilizon.Service.PruneUploads

  @shortdoc "Delete the uploaded files nothing uses"

  @impl Mix.Task
  def run(options) do
    {options, [], []} =
      OptionParser.parse(
        options,
        strict: [dry_run: :boolean, days: :integer, verbose: :boolean],
        aliases: [d: :days, v: :verbose]
      )

    dry_run = Keyword.get(options, :dry_run, false)

    prune_options =
      case Keyword.get(options, :days) do
        nil -> [dry_run: dry_run]
        days -> [dry_run: dry_run, grace_period: days * 24]
      end

    start_mobilizon()

    case PruneUploads.prune(prune_options) do
      {:ok, files} ->
        if dry_run or Keyword.get(options, :verbose, false), do: details(files, dry_run)
        result(files, dry_run)

      {:error, :uploader_not_local} ->
        shell_error("Only the local uploader (Mobilizon.Web.Upload.Uploader.Local) can be pruned")
    end
  end

  defp details([], _dry_run), do: :ok

  defp details(files, dry_run) do
    shell_info(
      if dry_run,
        do: "Files that would have been deleted:",
        else: "Files that have been deleted:"
    )

    Enum.each(files, fn %{path: path, size: size, media_ids: media_ids} ->
      shell_info(
        "#{path} (#{size} bytes, unattached media rows: [#{Enum.join(media_ids, ", ")}])"
      )
    end)
  end

  defp result(files, dry_run) do
    count = length(files)
    bytes = files |> Enum.map(& &1.size) |> Enum.sum()
    mb = Float.round(bytes / 1_000_000, 1)

    shell_info(
      case {count, dry_run} do
        {0, true} -> "No files would have been deleted"
        {0, false} -> "No files were deleted"
        {_, true} -> "#{count} files (#{mb} MB) would have been deleted"
        {_, false} -> "#{count} files (#{mb} MB) have been deleted"
      end
    )
  end
end
