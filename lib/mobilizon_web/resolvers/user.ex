defmodule MobilizonWeb.Resolvers.User do
  alias Mobilizon.Actors.{User, Actor}
  alias Mobilizon.Actors

  @doc """
  Find an user by it's ID
  """
  def find_user(_parent, %{id: id}, _resolution) do
    Actors.get_user_with_actors(id)
  end

  @doc """
  Return current logged-in user
  """
  def get_current_user(_parent, _args, %{context: %{current_user: user}}) do
    {:ok, user}
  end

  def get_current_user(_parent, _args, _resolution) do
    {:error, "You need to be logged-in to view current user"}
  end

  @doc """
  Login an user. Returns a token and the user
  """
  def login_user(_parent, %{email: email, password: password}, _resolution) do
    with {:ok, %User{} = user} <- Actors.get_user_by_email(email, true),
         {:ok, token, _} <- Actors.authenticate(%{user: user, password: password}),
         %Actor{} = actor <- Actors.get_actor_for_user(user) do
      {:ok, %{token: token, user: user, actor: actor}}
    else
      {:error, :user_not_found} ->
        {:error, "User with email not found"}

      {:error, :unauthorized} ->
        {:error, "Impossible to authenticate"}
    end
  end

  @doc """
  Register an user :
    - create the user
    - create the actor
    - set the user's default_actor to the newly created actor
    - send a validation email to the user
  """
  @spec create_user_actor(any(), map(), any()) :: tuple()
  def create_user_actor(_parent, args, _resolution) do
    with {:ok, %Actor{user: user} = actor} <- Actors.register(args) do
      Mobilizon.Actors.Service.Activation.send_confirmation_email(user)
      {:ok, actor}
    end
  end

  @doc """
  Validate an user, get it's actor and a token
  """
  def validate_user(_parent, %{token: token}, _resolution) do
    with {:ok, %User{} = user} <-
           Mobilizon.Actors.Service.Activation.check_confirmation_token(token),
         %Actor{} = actor <- Actors.get_actor_for_user(user),
         {:ok, token, _} <- MobilizonWeb.Guardian.encode_and_sign(user) do
      {:ok, %{token: token, user: user, person: actor}}
    end
  end

  @doc """
  Send the confirmation email again.
  We only do this to accounts unconfirmed
  """
  def resend_confirmation_email(_parent, %{email: email, locale: locale}, _resolution) do
    with {:ok, user} <- Actors.get_user_by_email(email, false),
         {:ok, email} <-
           Mobilizon.Actors.Service.Activation.resend_confirmation_email(user, locale) do
      {:ok, email}
    else
      {:error, :user_not_found} ->
        {:error, "No user to validate with this email was found"}

      {:error, :email_too_soon} ->
        {:error, "You requested again a confirmation email too soon"}
    end
  end

  @doc """
  Send an email to reset the password from an user
  """
  def send_reset_password(_parent, %{email: email, locale: locale}, _resolution) do
    with {:ok, user} <- Actors.get_user_by_email(email, false),
         {:ok, %Bamboo.Email{} = _email_html} <-
           Mobilizon.Actors.Service.ResetPassword.send_password_reset_email(user, locale) do
      {:ok, email}
    else
      {:error, :user_not_found} ->
        # TODO : implement rate limits for this endpoint
        {:error, "No user with this email was found"}

      {:error, :email_too_soon} ->
        {:error, "You requested again a confirmation email too soon"}
    end
  end

  @doc """
  Reset the password from an user
  """
  def reset_password(_parent, %{password: password, token: token}, _resolution) do
    with {:ok, %User{} = user} <-
           Mobilizon.Actors.Service.ResetPassword.check_reset_password_token(password, token),
         %Actor{} = actor <- Actors.get_actor_for_user(user),
         {:ok, token, _} <- MobilizonWeb.Guardian.encode_and_sign(user) do
      {:ok, %{token: token, user: user, actor: actor}}
    end
  end

  @doc "Change an user default actor"
  def change_default_actor(_parent, %{preferred_username: username}, %{
        context: %{current_user: user}
      }) do
    with %Actor{id: id} <- Actors.get_local_actor_by_name(username) do
      Actors.update_user(user, %{default_actor_id: id})
    end
  end
end
