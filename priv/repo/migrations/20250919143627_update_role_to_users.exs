defmodule Mobilizon.Storage.Repo.Migrations.UpdateRoleToUser do
  use Ecto.Migration

  def change do
    execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pending';")
  end
end
