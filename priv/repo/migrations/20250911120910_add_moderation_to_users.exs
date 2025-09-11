defmodule Mobilizon.Storage.Repo.Migrations.AddModerationToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add(:moderation, :string, default: "")
    end
  end
end
