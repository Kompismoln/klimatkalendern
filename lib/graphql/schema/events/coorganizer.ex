defmodule Mobilizon.GraphQL.Schema.Events.CoorganizerType do
  @moduledoc """
  Schema representation for Coorganizer.
  """

  use Absinthe.Schema.Notation

  import Absinthe.Resolution.Helpers, only: [dataloader: 1]

  alias Mobilizon.{Actors, Events}
  alias Mobilizon.GraphQL.Resolvers.Coorganizer

  @desc "Represents a coorganizer to an event"
  object :coorganizer do
    meta(:authorize, :all)
    field(:id, :id, description: "The coorganizer entry ID")

    field(
      :event,
      :event,
      resolve: dataloader(Events),
      description: "The event which the actor coorganizes in"
    )

    field(
      :coorganizer,
      :actor,
      resolve: dataloader(Actors),
      description: "The actor that coorganizes the event"
    )
  end

  @desc """
  A list of coorganizers
  """
  object :coorganizers_list do
    meta(:authorize, :user)
    field(:elements, list_of(:coorganizer), description: "A list of coorganizers")
  end
end
