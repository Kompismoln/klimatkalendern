defmodule Mobilizon.Storage.Repo.Migrations.AddAllowToGroup do
  use Ecto.Migration

  def change do
    alter table("actors") do
      add(:allow_see_participants, :boolean, default: false, null: false)
    end
  end
end
