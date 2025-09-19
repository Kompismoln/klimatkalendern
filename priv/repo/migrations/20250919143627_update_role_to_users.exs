defmodule Mobilizon.Storage.Repo.Migrations.AddModerationToUser do
  use Ecto.Migration

  def change do
    execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pending';")
  end
end
