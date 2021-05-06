import Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with brunch.io to recompile .js and .css sources.
config :mobilizon, Mobilizon.Web.Endpoint,
  http: [
    ip: {127, 0, 0, 1},
    port: 4000
  ],
  url: [
    host: System.get_env("MOBILIZON_INSTANCE_HOST", "mobilizon.local"),
    port: 80,
    scheme: "http"
  ],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    node: [
      "node_modules/webpack/bin/webpack.js",
      "--mode",
      "development",
      "--watch",
      "--watch-options-stdin",
      "--config",
      "node_modules/@vue/cli-service/webpack.config.js",
      cd: Path.expand("../js", __DIR__)
    ]
  ]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# command from your terminal:
#
#     openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" -keyout priv/server.key -out priv/server.pem
#
# The `http:` config above can be replaced with:
#
#     https: [port: 4000, keyfile: "priv/server.key", certfile: "priv/server.pem"],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :mobilizon, Mobilizon.Web.Endpoint,
  live_reload: [
    patterns: [
      ~r{priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$},
      ~r{priv/gettext/.*(po)$},
      ~r{lib/web/(live|views)/.*(ex)$},
      ~r{lib/web/templates/.*(eex)$}
    ]
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n", level: :debug

config :mobilizon, Mobilizon.Service.Geospatial, service: Mobilizon.Service.Geospatial.Nominatim

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :mobilizon, Mobilizon.Web.Email.Mailer, adapter: Bamboo.LocalAdapter

# Configure your database
config :mobilizon, Mobilizon.Storage.Repo,
  username: System.get_env("MOBILIZON_DATABASE_USERNAME", "mobilizon"),
  password: System.get_env("MOBILIZON_DATABASE_PASSWORD", "mobilizon"),
  database: System.get_env("MOBILIZON_DATABASE_DBNAME", "mobilizon_dev"),
  hostname: System.get_env("MOBILIZON_DATABASE_HOST", "localhost"),
  port: System.get_env("MOBILIZON_DATABASE_PORT", "5432"),
  pool_size: 10,
  show_sensitive_data_on_connection_error: true

config :mobilizon, :instance,
  name: System.get_env("MOBILIZON_INSTANCE_NAME", "Mobilizon"),
  hostname: System.get_env("MOBILIZON_INSTANCE_HOST", "Mobilizon"),
  email_from: System.get_env("MOBILIZON_INSTANCE_EMAIL"),
  email_reply_to: System.get_env("MOBILIZON_INSTANCE_EMAIL"),
  registrations_open: System.get_env("MOBILIZON_INSTANCE_REGISTRATIONS_OPEN") == "true",
  groups: true

# config :mobilizon, :activitypub, sign_object_fetches: false

config :mobilizon, Mobilizon.Web.Upload.Uploader.Local, uploads: "uploads"

config :mobilizon, :anonymous,
  reports: [
    allowed: true
  ]
