defmodule Mobilizon.Web.FeedController do
  @moduledoc """
  Controller to serve RSS, ATOM and iCal Feeds
  """
  use Mobilizon.Web, :controller
  plug(:put_layout, false)
  action_fallback(Mobilizon.Web.FallbackController)
  alias Mobilizon.Config
  alias Mobilizon.GraphQL.API.Search
  alias Mobilizon.Service.Export.Feed
  alias Mobilizon.Service.Export.ICalendar
  require Logger

  @spec instance(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def instance(conn, %{"format" => format}) do
    if Config.get([:instance, :enable_instance_feeds], false) do
      return_data(conn, format, "instance", Config.instance_name())
    else
      send_resp(conn, 401, "Instance feeds are not enabled.")
    end
  end

  @spec search(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def search(conn, %{"format" => format}) do
    if Config.get([:instance, :enable_search_feeds], false) do
      args = build_search_args(conn)

      data =
        args
        |> Search.search_events(1, 100)
        |> case do
          {:ok, page} -> page.elements
          _ -> {:error, "Failed to fetch events"}
        end

      case format do
        "ics" ->
          {:ok, events} = ICalendar.export_events(data)

          conn
          |> put_resp_content_type("text/calendar")
          |> put_resp_header(
            "content-disposition",
            "attachment; filename=\"search.ics\""
          )
          |> send_resp(200, events)

        "atom" ->
          feed_title =
            gettext("Custom search on %{instance}",
              instance: Config.instance_name()
            )

          events = Feed.export_events(data, Phoenix.Controller.current_url(conn), feed_title)

          conn
          |> put_resp_content_type("application/atom+xml")
          |> put_resp_header(
            "content-disposition",
            "attachment; filename=\"search.atom\""
          )
          |> send_resp(200, events)

        _ ->
          send_resp(conn, 401, "Only 'ics' or 'atom' methods are supported.")
      end
    else
      send_resp(conn, 401, "Search feeds are not enabled.")
    end
  end

  defp build_search_args(conn) do
    %{
      term: param_string(conn.params, "term"),
      tags: param_string(conn.params, "tags"),
      location: param_string(conn.params, "location"),
      category: param_string(conn.params, "category"),
      bbox: param_string(conn.params, "bbox"),
      category_one_of: param_list_of_strings(conn.params, "category_one_of"),
      language_one_of: param_list_of_strings(conn.params, "language_one_of"),
      boost_languages: param_list_of_strings(conn.params, "boost_languages"),
      radius: param_float(conn.params, "radius", 50.0),
      long_events: param_boolean(conn.params, "long_events", nil),
      zoom: param_integer(conn.params, "zoom", nil),
      status_one_of: param_status_one_of(conn.params, "status_one_of", nil),
      search_target: param_search_target(conn.params, "search_target", :internal),
      type: param_type(conn.params, "type", nil),
      sort_by: :start_time_asc
    }
  end

  defp param_string(params, key) do
    Map.get(params, key, "")
  end

  defp param_list_of_strings(params, key) do
    params
    |> param_string(key)
    |> String.split(",", trim: true)
    |> Enum.map(&String.trim/1)
  end

  defp param_float(params, key, default) do
    params
    |> param_string(key)
    |> String.replace(",", ".")
    |> Float.parse()
    |> case do
      {float, ""} -> float
      _ -> default
    end
  end

  defp param_integer(params, key, default) do
    params
    |> param_string(key)
    |> Integer.parse()
    |> case do
      {int, ""} -> int
      _ -> default
    end
  end

  defp param_boolean(params, key, default) do
    params
    |> param_string(key)
    |> String.downcase()
    |> case do
      "true" -> true
      "1" -> true
      "false" -> false
      "0" -> false
      _ -> default
    end
  end

  defp param_status_one_of(params, key, default) do
    params
    |> param_list_of_strings(key)
    |> Enum.map(fn status ->
      status
      |> String.downcase()
      |> case do
        "confirmed" -> :confirmed
        "tentative" -> :tentative
        "cancelled" -> :cancelled
        _ -> default
      end
    end)
  end

  defp param_search_target(params, key, default) do
    params
    |> param_list_of_strings(key)
    |> Enum.map(fn search ->
      search
      |> String.downcase()
      |> case do
        "internal" -> :internal
        "self" -> :self
        "global" -> :global
        _ -> default
      end
    end)
  end

  defp param_type(params, key, default) do
    params
    |> param_list_of_strings(key)
    |> Enum.map(fn type ->
      type
      |> String.downcase()
      |> case do
        "in_person" -> :in_person
        "online" -> :online
        _ -> default
      end
    end)
  end

  @spec actor(Plug.Conn.t(), map()) :: Plug.Conn.t() | {:error, :not_found}
  def actor(conn, %{"format" => format, "name" => name}) do
    return_data(conn, format, "actor_" <> name, name)
  end

  def actor(_conn, _) do
    {:error, :not_found}
  end

  @spec event(Plug.Conn.t(), map()) :: Plug.Conn.t() | {:error, :not_found}
  def event(conn, %{"uuid" => uuid, "format" => "ics"}) do
    return_data(conn, "ics", "event_" <> uuid, "event")
  end

  def event(_conn, _) do
    {:error, :not_found}
  end

  @spec going(Plug.Conn.t(), map()) :: Plug.Conn.t() | {:error, :not_found}
  def going(conn, %{"token" => token, "format" => format}) do
    return_data(conn, format, "token_" <> token, "events")
  end

  def going(_conn, _) do
    {:error, :not_found}
  end

  @spec return_data(Plug.Conn.t(), String.t(), String.t(), String.t()) ::
          Plug.Conn.t() | {:error, :not_found}
  defp return_data(conn, "atom", key, filename) do
    case Cachex.fetch(:feed, key) do
      {status, data} when status in [:commit, :ok] ->
        conn
        |> put_resp_content_type("application/atom+xml")
        |> put_resp_header(
          "content-disposition",
          "attachment; filename=\"#{filename}.atom\""
        )
        |> send_resp(200, data)

      # No need to log these two
      {:ignore, :actor_not_found} ->
        {:error, :not_found}

      {:ignore, :actor_not_public} ->
        {:error, :not_found}

      err ->
        Logger.warning("Unable to find feed data cached for key #{key}, returned #{inspect(err)}")
        {:error, :not_found}
    end
  end

  defp return_data(conn, "ics", key, filename) do
    case Cachex.fetch(:ics, key) do
      {status, data} when status in [:commit, :ok] ->
        conn
        |> put_resp_content_type("text/calendar")
        |> put_resp_header(
          "content-disposition",
          "attachment; filename=\"#{filename}.ics\""
        )
        |> send_resp(200, data)

      # No need to log these two
      {:ignore, :actor_not_found} ->
        {:error, :not_found}

      {:ignore, :actor_not_public} ->
        {:error, :not_found}

      err ->
        Logger.warning("Unable to find feed data cached for key #{key}, returned #{inspect(err)}")
        {:error, :not_found}
    end
  end

  defp return_data(_conn, _, _, _) do
    {:error, :not_found}
  end
end
