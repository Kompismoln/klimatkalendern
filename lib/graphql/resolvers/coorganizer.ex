defmodule Mobilizon.GraphQL.Resolvers.Coorganizer do
  @moduledoc """
  Handles the participation-related GraphQL calls.
  """
  alias Mobilizon.Actors.Actor
  alias Mobilizon.Events.{Coorganizer, Event, Participant}
  import Mobilizon.GraphQL.Resolvers.Event.Utils

  @spec find_coorganizer(any(), map(), Absinthe.Resolution.t()) ::
          {:ok, Event.t()} | {:error, :event_not_found}
  def find_coorganizer(parent, %{id: id} = args, %{context: context} = resolution) do
    {:ok, Coorganizer.get_coorganizer_by_id(id)}
  end

end
