defmodule Mobilizon.Events.Coorganizer do
  @moduledoc """
  Represents a coorganizer, an actor also organizing an event.
  """

  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Mobilizon.Actors.Actor
  alias Mobilizon.Events
  alias Mobilizon.Events.{Event, Coorganizer}
  alias Mobilizon.Storage.Repo

  @type t :: %__MODULE__{
          id: Integer.t(),
          event: Event.t(),
          coorganizer: Actor.t()
        }

  @required_attrs [:event_id, :actor_id]
  @attrs @required_attrs

  #@primary_key {:id, :integer}
  schema "event_coorganizers" do
    belongs_to(:event, Event, primary_key: true)
    belongs_to(:coorganizer, Actor, primary_key: true)
  end

  def changeset(%__MODULE__{} = participant, attrs) do
    participant
    |> cast(attrs, @attrs)
    |> validate_required(@required_attrs)
  end



  @doc """
get a coorganizer by id
  """
  @spec get_coorganizer_by_id(String.t()) :: Coorganizer.t() | nil
  def get_coorganizer_by_id(id) do
    id
    |> coorganizer_by_id_query()
    |> Repo.one()
  end

  @spec coorganizer_by_id_query(String.t()) :: Ecto.Query.t()
  defp coorganizer_by_id_query(id) do
# ^id
    from(c in Coorganizer)
#, where: c.id == <<3>>)
  end
end
