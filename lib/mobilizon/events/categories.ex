defmodule Mobilizon.Events.Categories do
  @moduledoc """
  Module that handles event categories
  """
  use Gettext, backend: Mobilizon.Web.Gettext

  @default "MEETING"

  @spec default :: String.t()
  def default do
    @default
  end

  @spec list :: [%{id: atom(), label: String.t()}]
  def list do
    build_in_categories() ++ extra_categories()
  end

  @spec get_category(String.t() | nil) :: String.t()
  def get_category(category) do
    if category in Enum.map(list(), &String.upcase(to_string(&1.id))) do
      category
    else
      default()
    end
  end

  defp build_in_categories do
    [
      %{
        id: :lecture,
        label: gettext("Lecture")
      },
      %{
        id: :training,
        label: gettext("Training")
      },
      %{
        id: :fundraising,
        label: gettext("Fundraising")
      },
      %{
        id: :workshop,
        label: gettext("Workshop")
      },
      %{
        id: :social,
        label: gettext("Social")
      },
      %{
        id: :demonstration,
        label: gettext("Demonstration")
      },
      %{
        id: :protest,
        label: gettext("Protest")
      },
      %{
        id: :action,
        label: gettext("Action")
      },
      # Legacy default value
      %{
        id: :meeting,
        label: gettext("Meeting")
      }
    ]
  end

  @spec extra_categories :: [%{id: atom(), label: String.t()}]
  defp extra_categories do
    :mobilizon
    |> Application.get_env(:instance)
    |> Keyword.get(:extra_categories, [])
  end
end
