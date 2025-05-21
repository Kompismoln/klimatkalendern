defmodule Mobilizon.GraphQL.Schema.MediaType do
  @moduledoc """
  Schema representation for Medias
  """
  use Absinthe.Schema.Notation

  alias Mobilizon.GraphQL.Resolvers.Media

  @env Application.compile_env(:mobilizon, :env)
  @media_rate_limiting 60

  @desc "A media"
  object :media do
    meta(:authorize, :all)
    field(:uuid, :uuid, description: "The media's UUID")
    field(:alt, :string, description: "The media's alternative text")
    field(:name, :string, description: "The media's name")
    field(:url, :string, description: "The media's full URL")
    field(:content_type, :string, description: "The media's detected content type")
    field(:size, :integer, description: "The media's size")
    field(:metadata, :media_metadata, description: "The media's metadata")
  end

  @desc """
  A paginated list of medias
  """
  object :paginated_media_list do
    meta(:authorize, :all)
    field(:elements, list_of(:media), description: "The list of medias")
    field(:total, :integer, description: "The total number of medias in the list")
  end

  @desc """
  Some metadata associated with a media
  """
  object :media_metadata do
    meta(:authorize, :all)
    field(:width, :integer, description: "The media width (if a picture)")
    field(:height, :integer, description: "The media width (if a height)")
    field(:blurhash, :string, description: "The media blurhash (if a picture")
  end

  @desc "An attached media or a link to a media"
  input_object :media_input do
    # Either a full media object
    field(:media, :media_input_object, description: "A full media attached")
    # Or directly the UUID of an existing media
    field(:media_uuid, :uuid, description: "The UUID of an existing media")
  end

  @desc "An attached media"
  input_object :media_input_object do
    field(:name, non_null(:string), description: "The media's name")
    field(:alt, :string, description: "The media's alternative text")
    field(:file, :upload, description: "The media file")
    field(:actor_id, :id, description: "The media owner")
    field(:url, :string, description: "The media URL")
  end

  object :media_queries do
    @desc "Get a media by uuid"
    field :media, :media do
      arg(:uuid, non_null(:uuid), description: "The media UUID")
      middleware(Rajska.QueryAuthorization, permit: :all)
      resolve(&Media.get_media_by_uuid/3)
    end
  end

  object :media_mutations do
    @desc "Upload a media"
    field :upload_media, :media do
      arg(:name, non_null(:string), description: "The media's name")
      arg(:alt, :string, description: "The media's alternative text")
      arg(:file, non_null(:upload), description: "The media file")
      arg(:actor_id, :id, description: "The actor that uploads the media")

      middleware(Rajska.QueryAuthorization,
        permit: :user,
        scope: Mobilizon.Medias.Media,
        rule: :"write:media:upload",
        args: %{}
      )

      middleware(Rajska.RateLimiter, limit: media_rate_limiting(@env))

      resolve(&Media.upload_media/3)
    end

    @desc """
    Remove a media
    """
    field :remove_media, :deleted_object_by_uuid do
      arg(:uuid, non_null(:uuid), description: "The media's UUID")

      middleware(Rajska.QueryAuthorization,
        permit: :user,
        scope: Mobilizon.Medias.Media,
        rule: :"write:media:remove",
        args: :uuid
      )

      resolve(&Media.remove_media_by_uuid/3)
    end
  end

  defp media_rate_limiting(:test), do: @media_rate_limiting * 1000
  defp media_rate_limiting(_), do: @media_rate_limiting
end
