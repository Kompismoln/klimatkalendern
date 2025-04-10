defmodule Mobilizon.GraphQL.Resolvers.Post do
  @moduledoc """
  Handles the posts-related GraphQL calls
  """

  import Mobilizon.Users.Guards
  alias Mobilizon.{Actors, Posts}
  alias Mobilizon.Actors.Actor
  alias Mobilizon.Federation.ActivityPub.{Actions, Permission, Utils}
  alias Mobilizon.Posts.Post
  alias Mobilizon.Storage.Page
  alias Mobilizon.Users.User
  use Gettext, backend: Mobilizon.Web.Gettext

  require Logger

  @public_accessible_visibilities [:public, :unlisted]

  @doc """
  Find posts for group.

  Returns only if actor requesting is a member of the group
  """
  @spec find_posts_for_group(Actor.t(), map(), Absinthe.Resolution.t()) :: {:ok, Page.t(Post.t())}
  def find_posts_for_group(
        %Actor{id: group_id} = group,
        %{page: page, limit: limit} = args,
        %{
          context: %{
            current_user: %User{role: user_role},
            current_actor: %Actor{id: actor_id}
          }
        } = _resolution
      ) do
    if Actors.member?(actor_id, group_id) or is_moderator(user_role) do
      %Page{} = page = Posts.get_posts_for_group(group, page, limit)
      {:ok, page}
    else
      find_posts_for_group(group, args, nil)
    end
  end

  def find_posts_for_group(
        %Actor{} = group,
        %{page: page, limit: limit},
        _resolution
      ) do
    %Page{} = page = Posts.get_public_posts_for_group(group, page, limit)
    {:ok, page}
  end

  def find_posts_for_group(
        _group,
        _args,
        _resolution
      ) do
    {:ok, %Page{total: 0, elements: []}}
  end

  @spec get_post(any(), map(), Absinthe.Resolution.t()) ::
          {:ok, Post.t()} | {:error, :post_not_found}
  def get_post(
        parent,
        %{slug: slug},
        %{
          context: %{
            current_user: %User{role: user_role},
            current_actor: %Actor{} = current_profile
          }
        } = _resolution
      ) do
    with {:post, %Post{attributed_to: %Actor{}} = post} <-
           {:post, Posts.get_post_by_slug_with_preloads(slug)},
         {:member, true} <-
           {:member,
            Permission.can_access_group_object?(current_profile, post) or is_moderator(user_role)} do
      {:ok, post}
    else
      {:member, false} -> get_post(parent, %{slug: slug}, nil)
      {:post, _} -> {:error, :post_not_found}
    end
  end

  def get_post(
        _parent,
        %{slug: slug},
        _resolution
      ) do
    case {:post, Posts.get_post_by_slug_with_preloads(slug)} do
      {:post, %Post{visibility: visibility, draft: false} = post}
      when visibility in @public_accessible_visibilities ->
        {:ok, post}

      {:post, _} ->
        {:error, :post_not_found}
    end
  end

  def get_post(_parent, _args, _resolution) do
    {:error, :post_not_found}
  end

  @spec create_post(any(), map(), Absinthe.Resolution.t()) ::
          {:ok, Post.t()} | {:error, String.t()}
  def create_post(
        _parent,
        %{attributed_to_id: group_id} = args,
        %{
          context: %{
            current_actor: %Actor{id: actor_id}
          }
        } = _resolution
      ) do
    with {:member, true} <- {:member, Actors.member?(actor_id, group_id)},
         %Actor{} = group <- Actors.get_actor(group_id),
         args <-
           Map.update(args, :picture, nil, fn picture ->
             process_picture(picture, group)
           end),
         args <- extract_pictures_from_post_body(args, actor_id),
         {:ok, _, %Post{} = post} <-
           Actions.Create.create(
             :post,
             args
             |> Map.put(:author_id, actor_id)
             |> Map.put(:attributed_to_id, group_id),
             true,
             %{}
           ) do
      {:ok, post}
    else
      {:member, _} ->
        {:error, dgettext("errors", "Profile is not member of group")}

      {:error, error} ->
        {:error, error}
    end
  end

  def create_post(_parent, _args, _resolution) do
    {:error, dgettext("errors", "You need to be logged-in to create posts")}
  end

  @spec update_post(any(), map(), Absinthe.Resolution.t()) ::
          {:ok, Post.t()} | {:error, String.t()}
  def update_post(
        _parent,
        %{id: id} = args,
        %{
          context: %{
            current_actor: %Actor{id: actor_id, url: actor_url}
          }
        } = _resolution
      ) do
    with {:uuid, {:ok, _uuid}} <- {:uuid, Ecto.UUID.cast(id)},
         {:post, %Post{attributed_to: %Actor{id: group_id} = group} = post} <-
           {:post, Posts.get_post_with_preloads(id)},
         args <-
           Map.update(args, :picture, nil, fn picture ->
             process_picture(picture, group)
           end),
         args <- extract_pictures_from_post_body(args, actor_id),
         {:member, true} <- {:member, Actors.member?(actor_id, group_id)},
         {:ok, _, %Post{} = post} <-
           Actions.Update.update(post, args, true, %{"actor" => actor_url}) do
      {:ok, post}
    else
      {:uuid, :error} ->
        {:error, dgettext("errors", "Post ID is not a valid ID")}

      {:post, _} ->
        {:error, dgettext("errors", "Post doesn't exist")}

      {:member, _} ->
        {:error, dgettext("errors", "Profile is not member of group")}
    end
  end

  def update_post(_parent, _args, _resolution) do
    {:error, dgettext("errors", "You need to be logged-in to update posts")}
  end

  @spec delete_post(any(), map(), Absinthe.Resolution.t()) ::
          {:ok, Post.t()} | {:error, String.t()}
  def delete_post(
        _parent,
        %{id: post_id},
        %{
          context: %{
            current_actor: %Actor{id: actor_id} = actor
          }
        } = _resolution
      ) do
    with {:uuid, {:ok, _uuid}} <- {:uuid, Ecto.UUID.cast(post_id)},
         {:post, %Post{attributed_to: %Actor{id: group_id}} = post} <-
           {:post, Posts.get_post_with_preloads(post_id)},
         {:member, true} <- {:member, Actors.member?(actor_id, group_id)},
         {:ok, _, %Post{} = post} <-
           Actions.Delete.delete(post, actor) do
      {:ok, post}
    else
      {:uuid, :error} ->
        {:error, dgettext("errors", "Post ID is not a valid ID")}

      {:post, _} ->
        {:error, dgettext("errors", "Post doesn't exist")}

      {:member, _} ->
        {:error, dgettext("errors", "Profile is not member of group")}
    end
  end

  def delete_post(_parent, _args, _resolution) do
    {:error, dgettext("errors", "You need to be logged-in to delete posts")}
  end

  @spec process_picture(map() | nil, Actor.t()) :: nil | map()
  defp process_picture(nil, _), do: nil
  defp process_picture(%{media_id: _picture_id} = args, _), do: args

  defp process_picture(%{media: media}, %Actor{id: actor_id}) do
    with uploaded when is_map(uploaded) <-
           media
           |> Map.get(:file)
           |> Utils.make_media_data(description: Map.get(media, :name)) do
      %{
        file: Map.take(uploaded, [:url, :name, :content_type, :size]),
        metadata: Map.take(uploaded, [:width, :height, :blurhash]),
        actor_id: actor_id
      }
    end
  end

  @spec extract_pictures_from_post_body(map(), String.t()) :: map()
  defp extract_pictures_from_post_body(%{body: body} = args, actor_id) do
    pictures = Mobilizon.GraphQL.API.Utils.extract_pictures_from_body(body, actor_id)
    Map.put(args, :media, pictures)
  end

  defp extract_pictures_from_post_body(args, _actor_id), do: args
end
