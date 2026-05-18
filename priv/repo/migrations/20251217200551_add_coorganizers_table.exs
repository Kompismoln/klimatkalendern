defmodule Mobilizon.Storage.Repo.Migrations.AddCoorganizersTable do
  use Ecto.Migration

  def change do
    create table("event_coorganizers") do
      add(:event_id, references(:events, on_delete: :delete_all), null: false)
      add(:coorganizer_id, references(:actors, on_delete: :delete_all), null: false)
    end
  end
end
