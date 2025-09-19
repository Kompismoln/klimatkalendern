defmodule Mobilizon.Storage.Repo.Migrations.AddModerationToUser do
  use Ecto.Migration

  alias Mobilizon.Users.UserRole

  def change do
    alter table(:users) do
      add(:moderation, :string, default: "")
    end

    UserRole.create_type()
  end
end
