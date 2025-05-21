defmodule Mobilizon.Storage.Repo.Migrations.AddUuidToMedia do
  use Ecto.Migration

  def change do
    # Create the new uuid for medias
    alter table(:medias) do
      add :uuid, :uuid, default: fragment("gen_random_uuid()"), null: false
    end

    create(unique_index(:medias, [:uuid]))
  end
end
