defmodule Mobilizon.Federation.ActivityPub.FetcherTest do
  use Mobilizon.DataCase

  import Mox

  alias Mobilizon.Federation.ActivityPub.Fetcher
  alias Mobilizon.Service.HTTP.ActivityPub.Mock

  setup :verify_on_exit!

  describe "fetch/2" do
    test "follows a redirect to another host" do
      url = "https://old.example/users/alice"
      target = "https://new.example/users/alice"
      data = %{"id" => target, "type" => "Person"}

      Mock
      |> expect(:call, 2, fn
        %{method: :get, url: ^url}, _opts ->
          {:ok, %Tesla.Env{status: 301, headers: [{"location", target}]}}

        %{method: :get, url: ^target}, _opts ->
          {:ok, %Tesla.Env{status: 200, body: data}}
      end)

      assert {:ok, ^data} = Fetcher.fetch(url)
    end
  end
end
