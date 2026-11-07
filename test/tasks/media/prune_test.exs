defmodule Mix.Tasks.Mobilizon.Media.PruneTest do
  use Mobilizon.DataCase
  import Mock

  alias Mix.Tasks.Mobilizon.Media.Prune
  alias Mobilizon.Service.PruneUploads

  Mix.shell(Mix.Shell.Process)

  @files [
    %{path: "a.png", size: 1_500_000, media_ids: []},
    %{path: "b.png", size: 500_000, media_ids: [7]}
  ]

  test "reports the files deleted" do
    with_mock PruneUploads, prune: fn [dry_run: false] -> {:ok, @files} end do
      Prune.run([])
      assert_received {:mix_shell, :info, ["2 files (2.0 MB) have been deleted"]}
    end
  end

  test "lists the files a dry run would delete" do
    with_mock PruneUploads, prune: fn [dry_run: true, grace_period: 72] -> {:ok, @files} end do
      Prune.run(["--dry-run", "--days", "3"])
      assert_received {:mix_shell, :info, ["Files that would have been deleted:"]}

      assert_received {:mix_shell, :info, ["b.png (500000 bytes, unattached media rows: [7])"]}

      assert_received {:mix_shell, :info, ["2 files (2.0 MB) would have been deleted"]}
    end
  end

  test "says so when nothing is to be deleted" do
    with_mock PruneUploads, prune: fn [dry_run: false] -> {:ok, []} end do
      Prune.run([])
      assert_received {:mix_shell, :info, ["No files were deleted"]}
    end
  end

  test "refuses an uploader other than the local one" do
    with_mock PruneUploads, prune: fn _ -> {:error, :uploader_not_local} end do
      Prune.run([])
      assert_received {:mix_shell, :error, [message]}
      assert message =~ "Only the local uploader"
    end
  end
end
