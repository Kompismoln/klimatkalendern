defmodule Mobilizon.Discussions.Discussion.TitleSlug do
  @moduledoc """
  Module to generate the slug for discussions
  """
  use EctoAutoslugField.Slug, from: [:title, :id], to: :slug

  @spec build_slug([String.t()], Ecto.Changeset.t()) :: String.t()
  def build_slug([title, id], %Ecto.Changeset{valid?: true}) do
    [title, ShortUUID.encode!(id)]
    |> Enum.join("-")
    |> Slugger.slugify()
  end

  def build_slug(_sources, %Ecto.Changeset{valid?: false}), do: ""
end

defmodule Mobilizon.Discussions.Discussion do
  @moduledoc """
  Represents a discussion
  """

  use Ecto.Schema

  import Ecto.Changeset

  alias Mobilizon.Actors
  alias Mobilizon.Actors.Actor
  alias Mobilizon.Discussions.Comment
  alias Mobilizon.Discussions.Discussion.TitleSlug
  use Mobilizon.Web, :verified_routes
  use Gettext, backend: Mobilizon.Web.Gettext

  @type t :: %__MODULE__{
          id: String.t(),
          creator: Actor.t(),
          actor: Actor.t(),
          title: String.t(),
          url: String.t(),
          slug: String.t(),
          last_comment: Comment.t(),
          comments: list(Comment.t())
        }

  @required_attrs [:actor_id, :creator_id, :title, :last_comment_id, :url, :id]
  @optional_attrs []
  @attrs @required_attrs ++ @optional_attrs

  @primary_key {:id, Ecto.UUID, autogenerate: true}

  schema "discussions" do
    field(:title, :string)
    field(:slug, TitleSlug.Type)
    field(:url, :string)
    belongs_to(:creator, Actor)
    belongs_to(:actor, Actor)
    belongs_to(:last_comment, Comment)
    has_many(:comments, Comment, foreign_key: :discussion_id)

    timestamps(type: :utc_datetime)
  end

  @doc false
  @spec changeset(t | Ecto.Schema.t(), map) :: Ecto.Changeset.t()
  def changeset(%__MODULE__{} = discussion, attrs) do
    discussion
    |> cast(attrs, @attrs)
    |> maybe_generate_id()
    |> validate_required([:title, :id], message: dgettext("errors", "can't be blank"))
    |> TitleSlug.maybe_generate_slug()
    |> TitleSlug.unique_constraint()
    |> maybe_generate_url()
    |> validate_required(@required_attrs)
  end

  defp maybe_generate_id(%Ecto.Changeset{} = changeset) do
    case fetch_field(changeset, :id) do
      res when res in [:error, {:data, nil}] ->
        put_change(changeset, :id, Ecto.UUID.generate())

      _ ->
        changeset
    end
  end

  @spec maybe_generate_url(Ecto.Changeset.t()) :: Ecto.Changeset.t()
  defp maybe_generate_url(%Ecto.Changeset{} = changeset) do
    with res when res in [:error, {:data, nil}] <- fetch_field(changeset, :url),
         {changes, slug} when changes in [:changes, :data] <-
           fetch_field(changeset, :slug),
         {_changes, actor_id} <-
           fetch_field(changeset, :actor_id),
         %Actor{preferred_username: preferred_username} <-
           Actors.get_actor(actor_id),
         url <- generate_url(preferred_username, slug) do
      put_change(changeset, :url, url)
    else
      _ -> changeset
    end
  end

  @spec generate_url(String.t(), String.t()) :: String.t()
  defp generate_url(preferred_username, slug),
    do: url(~p"/@:#{preferred_username}/c/#{slug}")
end
