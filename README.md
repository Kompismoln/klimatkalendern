# Klimatkalendern

This is a Mobilizon fork repurposed to serve klimatkalendern.nu.
The fork diverges from Mobilizon 5.1.2 with changes tailored to our specific use case.
As a consequence, this project is currently of limited use outside klimatkalendern.nu.
We welcome initiatives to make Mobilizon more customizable in general.

This README contains instructions for setting up the project locally,
if you want to know more about Klimatkalendern, visit [klimatkalendern.nu].

## Setup

1.  **Clone this repo:**
    ```bash
    git clone https://github.com/kompismoln/klimatkalendern
    cd klimatkalendern
    ```

2.  **Download Uploads:**
    Download the latest archive of user-uploaded media files.
    Unzip this archive into an `uploads` directory at the root of the cloned project.
    This directory should be `./uploads`.

### Nix

This project uses Nix for managing its development environment.

1.  **Install Nix:**
    Install Nix with flake support. We recommend the [lix](https://lix.systems/)
    implementation since flake can be enabled during install.

    Follow the instructions on their respective websites.
    * Nix: [https://nixos.org/download.html](https://nixos.org/download.html)
    * Lix: [https://lix.systems/](https://lix.systems/)

2.  **Enter Development Environment:**
    Within the cloned repository, run:
    ```bash
    nix develop
    ```
    This command sets up an environment with all the necessary dependencies.

    *Note on `nix develop` vs `nix-direnv`*:
    Using `nix develop` works, but it's not always convenient as you'll need to exit and re-enter
    the shell every time the environment changes (e.g., when switching branches or if `flake.nix`
    is updated). To ensure that the environment is automatically updated when you `cd` into the
    project directory, consider using [nix-direnv](https://github.com/nix-community/nix-direnv).
    Follow its installation instructions to set it up.

### Postgres

You'll need a PostgreSQL database with the PostGIS extension.
This setup assumes PostgreSQL is managed at the OS level.

**1. Install PostgreSQL and PostGIS:**

* **For Debian-based Linux (e.g., Ubuntu):**
    ```bash
    sudo apt update
    sudo apt install postgresql postgresql-contrib postgis
    # On some systems, PostGIS might be versioned, e.g., postgresql-15-postgis-3
    # You may also need client libraries: sudo apt install libpq-dev
    ```
    PostgreSQL service usually starts automatically after installation.

* **For macOS (using Homebrew):**
    If you don't have Homebrew, install it first from [brew.sh](https://brew.sh).
    ```bash
    brew install postgresql@15 # Or your preferred supported version, e.g., postgresql@16
    brew install postgis

    # To have launchd start postgresql now and restart at login:
    brew services start postgresql@15
    # Or, if you don't want/need a background service, you can manage it manually:
    # pg_ctl -D /usr/local/var/postgres start # (path might vary based on version)
    ```
    *Note: Homebrew might install a specific version (e.g., `postgresql@15`).
    Ensure your `PATH` is updated as per Homebrew's instructions if you install a versioned formula,
    or link it.*

**2. Initial Postgres User and Database Setup:**

Access `psql` as a PostgreSQL administrative user.

* **On Linux:**
    ```bash
    sudo -u postgres psql
    ```
* **On macOS:**
    Depending on your installation (especially with Homebrew), you might be able to run
    `psql postgres` directly. If not, try:
    ```bash
    psql -U postgres -d template1 # Or your macOS username if you initialized the cluster as such
    ```

Now, within the `psql` prompt, create the `mobilizon` user and `mobilizon_dev` database:
```sql
CREATE USER mobilizon WITH PASSWORD 'mobilizon';
CREATE DATABASE mobilizon_dev OWNER mobilizon;

-- Connect to the new database to enable extensions within it
\c mobilizon_dev;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- You can verify extensions with \dx
-- Exit psql
\q
```
**3. Import Database Dump:**
Download the latest database dump (e.g., klimatkalendern_dump_YYYYMMDD.sql).
Then, import it into mobilizon_dev (ensure you are not inside the psql console for this command;
run it from your regular terminal shell):
```bash
psql -h localhost -U mobilizon -d mobilizon_dev < path/to/your/downloaded/dbdump.sql
```

Make sure to replace path/to/your/downloaded/dbdump.sql with the actual path to the dump
file you downloaded.

**4. Verify Database Setup:**
Connect to the database as the mobilizon user
and check that tables exist:
```bash
psql -h localhost -U mobilizon -d mobilizon_dev
```

Inside psql, run:
```sql
\dt
```

You should see a list of tables. Exit with `\q`.

The database is now installed and configured.

## Compile and Run
Ensure you are inside the Nix development shell (`nix develop` or via direnv).

Install Elixir Dependencies:
```bash
mix deps.get
```

If prompted to install `rebar3`, answer y (yes).

**Compile the Application:**
According to upstream documentation, some commands are run with `MIX_ENV=prod`
the reason for this is unkown, we just do it because they do it.

```bash
MIX_ENV=prod mix compile
```

## Install and Build Frontend Assets:
```bash
npm install
npm run build
MIX_ENV=prod mix phx.digest
```

Run the Phoenix Server:
```bash
mix phx.server
```

Klimatkalendern should now be available at http://localhost:4000.

## Resetting Your Environment
If you encounter issues, want to apply a fresh database dump, or need to start with a clean slate,
you can reset your environment.

Warning: This process will delete your local mobilizon_dev database, compiled code,
and local dependencies.

**Stop the Phoenix Server:**
If mix phx.server is running, stop it (usually Ctrl+C twice in the terminal).

**Clean Project Artifacts:**
Ensure you are in the project's root directory.
```bash
# Clean Elixir build artifacts and compiled dependencies
mix clean
mix deps.clean --all

# Clean frontend dependencies and build artifacts
rm -rf node_modules/
rm -rf priv/static/assets
```

Reset Database:
Connect to psql as a PostgreSQL superuser (e.g., postgres on Linux, or your admin user on macOS):

Linux:
```bash
sudo -u postgres psql
```
macOS:
```bash
psql -U postgres -d template1 (or similar, see setup)
```

Then execute the following SQL commands:
```sql
-- Terminate any active connections to mobilizon_dev before dropping
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'mobilizon_dev';
DROP DATABASE IF EXISTS mobilizon_dev;
DROP USER IF EXISTS mobilizon;
```

Exit psql (type `\q` and press Enter).

(Optional) Nix Environment Refresh:
If you are using nix develop directly, exit the shell and re-enter it.
If using direnv, you can run `direnv reload` or `touch flake.nix`.
in the project directory to force a refresh of the environment.

Your environment is now reset and you can follow the setup guide from
step 2 ("Initial postgres and user setup").
>>>>>>> Stashed changes
