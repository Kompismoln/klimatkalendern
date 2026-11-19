# Mobilizon instance configuration

import Config

config :mobilizon, Mobilizon.Web.Endpoint,
  server: true,
  url: [host: "localhost"],
  http: [
    ip: {127, 0, 0, 1},
    port: 4000
  ],
  secret_key_base: "E+0hELWWIky2iRLONRDu1vJ7/SMxDQ5cmyhyCGQ+xPWQ5U+zUSEo11x1mQDynpVK"

config :mobilizon, Mobilizon.Web.Auth.Guardian,
  secret_key: "YFdSas4CX1ddAlxf42fet//blHAudWzFnJCCWXnw1Tw7SnYaR7UXucqiT5KLakuQ"

config :mobilizon, :instance,
  name: "klimatkalendern",
  description: "Change this to a proper description of your instance",
  hostname: "localhost",
  registrations_open: false,
  demo: false,
  allow_relay: true,
  federating: true,
  email_from: "noreply@localhost",
  email_reply_to: "noreply@localhost"

config :mobilizon, Mobilizon.Storage.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "klimatkalendern",
  password: "klimatkalendern",
  database: "klimatkalendern",
  hostname: "localhost",
  port: "5432",
  pool_size: 10
