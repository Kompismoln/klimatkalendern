# Klimatkalendern

Klimatkalendern is an event calendar for all activities in Sweden (or elsewhere)
that aims to promote sustainablility.

This git repo is a detached Mobilizon fork repurposed to serve klimatkalendern.nu.
The fork diverges from Mobilizon 5.1.2 with changes tailored to our specific use case.
As a consequence, this project is currently of limited use outside klimatkalendern.nu.

This README contains instructions for setting up the project locally,
if you want to know more about Klimatkalendern, visit
[klimatkalendern.nu](https://klimatkalendern.nu).

Contributors are much welcome, we could use extra eyes on this.
If you want to restore a state for testing and development, but don't have access
to our storage, email us at info@klimatkalendern.nu.

## Setup
Ensure you have a machine running either linux, macOS or wsl with git installed, then:

**Clone this repo:**
    ```bash
    git clone https://github.com/kompismoln/klimatkalendern
    cd klimatkalendern
    ```

### Install Nix

Nix is used to manage the build and deployment pipeline.
Although not strictly necessary for development, it's highly recommended.
Nix ensures all system dependencies have the correct versions and enables you to test
the production build process, verifying it will work as expected.
If you don't want to use nix for some reason, all system dependencies are specified
in `flake.nix` under `devShell`.

1.  **Install Nix with flake support:**

    We recommend the lix.systems implementation as it allows flakes to be enabled during install.

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
    the shell when switching branches or if `flake.nix` is updated.
    To ensure that the environment is automatically updated when you `cd` into the
    project directory, consider using [nix-direnv](https://github.com/nix-community/nix-direnv).
    Follow its installation instructions to set it up.

### Configure the mobilizon instance

This step will generate `config/runtime.exs` which is used to configure
the local mobilizon instance.

First run:
```
mix deps.get                # Install elixir dependencies
mix mobilizon.instance gen # Generate server configuration
cp config/runtime-klimatkalendern.exs config/runtime.exs
dev-db start
```

**3. Setup database**

You have two options:

1. If you are starting from a clean slate, migrate database and add an admin user:
  ```
  mix ecto.migrate
  mix mobilizon.users.new john.doe@localhost.com --admin
  ```

2. If you're using an existing database dump (e.g. dbdump.sql)
   1. import the dump into the klimatkalendern database and migrate.
    ```bash
    psql -h localhost -U klimatkalendern -d klimatkalendern < path/to/your/downloaded/dbdump.sql
    mix ecto.migrate
    ```

    Make sure to replace path/to/your/downloaded/dbdump.sql with the actual path to the dump
    file you downloaded.

   2. Patch the relay user
    If the dump was taken from an instance running on "klimatkalendern.nu", it will have a relay user with that URL. But when you start locally, mobilizon searches for a relay user for your localhost address instead. This gives you a "Relay user not found" error. Start postgres, connect to the klimatkalendern database, and run:
    ```bash
    sudo -u postgres psql
    ```

    ```sql
    \c klimatkalendern;
    UPDATE actors SET url = 'http://localhost:4000/relay' WHERE url = 'https://klimatkalendern.nu/relay';
    ```

   3. Download user-uploaded media files that match the database dump.
    Unzip this archive into an `./uploads` directory at the root of the cloned project.

**4. Verify Database Setup:**

Connect to the database as the mobilizon user and check that tables exist:
```bash
dev-db enter
```

Inside psql, run:
```sql
\c klimatkalendern
\dt
```

You should see a list of tables. Exit with `\q`.

The database is now installed and configured.

### Install and compile Elixir dependencies
Ensure you are inside the Nix development shell (`nix develop` or via direnv).

Install Elixir Dependencies (again):
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

### Install and Build Frontend Assets:
```bash
pnpm install
pnpm run build
MIX_ENV=prod mix phx.digest
```

Run the Phoenix Server:
```bash
mix phx.server
```

Klimatkalendern should now be available at http://localhost:4000.

Check upstream documentation for more info: https://docs.mobilizon.org/4.%20Contribute/development/

## Resetting Your Environment
If you encounter issues, want to apply a fresh database dump, or need to start with a clean slate,
you can reset your environment.

Warning: This process will delete your local klimatkalendern database, compiled code,
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
rm config/runtime.exs
rm -rf node_modules/
rm -rf priv/static/assets
```

**Reset Database:**

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
-- Terminate any active connections to klimatkalendern before dropping
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'klimatkalendern';
DROP DATABASE IF EXISTS klimatkalendern;
DROP USER IF EXISTS klimatkalendern;
```

Exit psql (type `\q` and press Enter).

To load a new database dump, continue from the "Initial Postgres User and Database Setup" step above in the setup. 

**Nix Environment Refresh:**

If you are using nix develop directly, exit the shell and re-enter it.
If using direnv, you can run `direnv reload` or `touch flake.nix`.
in the project directory to force a refresh of the environment.

Your environment is now reset and you can follow the setup guide from
step 2 under Postgresql ("Initial Postgres User and Database setup").


## Following upstream mobilizon

Keeping up to date with the latest [upstream changes](https://framagit.org/kaihuri/mobilizon) is useful for many reasons: it saves us time making improvements or solving bugs that upstream developers have already resolved. It also reduces our security exposure, since it means running more up to date versions of dependencies. 
We use a rebase-onto-upstream approach, which allows us to treat new upstream changes as a black box, and just apply our set of changes on top of those. Once we rebase onto a new upstream release, we force push that new tip as the new main. As long as our team and our set of changes is relatively small, we expect this to work relatively well. The procedure is:

1. Create a new branch to bookmark the old main tip, e.g. `git checkout main; git checkout -b main-as-of-2026-01-01;`.
2. Pull new changes from upstream.
3. Interactively rebase the tip of main onto the new latest release branch from upstream, e.g. assuming `5.2.4` is the remote release branch:
```bash
git checkout main;
git checkout -b rebasing-onto-5.2.4;
git rebase -i 5.2.4;
``` 
4. Perform the rebase until you are satisfied. Feel free to prune/revise the change history to make it cleaner.
5. Push the new tip and create a pull request against main to allow for discussion and quality assurance, **although the PR is not intended to be merged.**
6. Instead, once satisfied, close the PR and force push that branch to become the new "main", making sure to inform all developers to update their repos.

## Announcement banner

To show temporary announcements, there is code for it in "src/components/NavBar.vue", see the commented out code.
