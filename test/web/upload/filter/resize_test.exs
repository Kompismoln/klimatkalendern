defmodule Mobilizon.Web.Upload.Filter.ResizeTest do
  use Mobilizon.DataCase, async: true
  alias Mobilizon.Web.Upload
  alias Mobilizon.Web.Upload.Filter.{AnalyzeMetadata, Resize}

  test "does not resize if dimensions are ok" do
    assert {100, 150} == Resize.limit_sizes({100, 150})
  end

  test "does resize only width if needed" do
    assert {1_920, 960} == Resize.limit_sizes({2_000, 1_000})
  end

  test "does resize only height if needed" do
    assert {540, 1_080} == Resize.limit_sizes({1_000, 2_000})
  end

  test "does resize if dimentions are really big, and keeps ratio" do
    assert {724, 1080} == Resize.limit_sizes({10_050, 15_000})
  end

  describe "filter/1" do
    @describetag :tmp_dir

    defp resize_copy(fixture, dir, name, content_type) do
      tempfile = Path.join(dir, name)
      File.cp!(fixture, tempfile)
      upload = %Upload{name: name, tempfile: tempfile, content_type: content_type}
      {:ok, :filtered, upload} = AnalyzeMetadata.filter(upload)
      {:ok, :filtered, _} = Resize.filter(upload)
      tempfile
    end

    # Fact: Dedupe names a file after its hash, so a picture stored twice must come out the same,
    # whatever ImageMagick would stamp it with (date:create, date:modify, to the second).
    test "gives the same bytes for the same picture", %{tmp_dir: dir} do
      first = resize_copy("test/fixtures/picture.png", dir, "first.png", "image/png")
      Process.sleep(1_100)
      second = resize_copy("test/fixtures/picture.png", dir, "second.png", "image/png")

      assert File.read!(first) == File.read!(second)
    end

    test "strips EXIF data, GPS included", %{tmp_dir: dir} do
      {gps, 0} = System.cmd("identify", ["-format", "%[EXIF:GPS*]", "test/fixtures/DSCN0010.jpg"])
      assert gps =~ "GPSLatitude"

      resized = resize_copy("test/fixtures/DSCN0010.jpg", dir, "resized.jpg", "image/jpeg")
      {gps, 0} = System.cmd("identify", ["-format", "%[EXIF:GPS*]", resized])
      assert gps == ""
    end
  end
end
