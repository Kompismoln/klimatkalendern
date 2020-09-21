defmodule Mobilizon.Service.Geospatial.Addok do
  @moduledoc """
  [Addok](https://github.com/addok/addok) backend.
  """

  alias Mobilizon.Addresses.Address
  alias Mobilizon.Service.Geospatial.Provider
  alias Mobilizon.Service.HTTP.GeospatialClient

  require Logger

  @behaviour Provider

  @endpoint Application.get_env(:mobilizon, __MODULE__) |> get_in([:endpoint])
  @default_country Application.get_env(:mobilizon, __MODULE__) |> get_in([:default_country]) ||
                     "France"

  @impl Provider
  @doc """
  Addok implementation for `c:Mobilizon.Service.Geospatial.Provider.geocode/3`.
  """
  @spec geocode(String.t(), keyword()) :: list(Address.t())
  def geocode(lon, lat, options \\ []) do
    :geocode
    |> build_url(%{lon: lon, lat: lat}, options)
    |> fetch_features
  end

  @impl Provider
  @doc """
  Addok implementation for `c:Mobilizon.Service.Geospatial.Provider.search/2`.
  """
  @spec search(String.t(), keyword()) :: list(Address.t())
  def search(q, options \\ []) do
    :search
    |> build_url(%{q: q}, options)
    |> fetch_features
  end

  @spec build_url(atom(), map(), list()) :: String.t()
  defp build_url(method, args, options) do
    limit = Keyword.get(options, :limit, 10)
    coords = Keyword.get(options, :coords, nil)
    endpoint = Keyword.get(options, :endpoint, @endpoint)

    case method do
      :geocode ->
        "#{endpoint}/reverse/?lon=#{args.lon}&lat=#{args.lat}&limit=#{limit}"

      :search ->
        url = "#{endpoint}/search/?q=#{URI.encode(args.q)}&limit=#{limit}"
        if is_nil(coords), do: url, else: url <> "&lat=#{coords.lat}&lon=#{coords.lon}"
    end
  end

  @spec fetch_features(String.t()) :: list(Address.t())
  defp fetch_features(url) do
    Logger.debug("Asking addok with #{url}")

    with {:ok, %{status: 200, body: body}} <- GeospatialClient.get(url),
         %{"features" => features} <- body do
      process_data(features)
    else
      _ ->
        Logger.error("Asking addok with #{url}")
        []
    end
  end

  defp process_data(features) do
    features
    |> Enum.map(fn %{"geometry" => geometry, "properties" => properties} ->
      %Address{
        country: Map.get(properties, "country", @default_country),
        locality: Map.get(properties, "city"),
        region: Map.get(properties, "context"),
        description: Map.get(properties, "name") || street_address(properties),
        geom: geometry |> Map.get("coordinates") |> Provider.coordinates(),
        postal_code: Map.get(properties, "postcode"),
        street: properties |> street_address()
      }
    end)
  end

  defp street_address(properties) do
    if Map.has_key?(properties, "housenumber") do
      Map.get(properties, "housenumber") <> " " <> Map.get(properties, "street")
    else
      Map.get(properties, "street")
    end
  end
end
