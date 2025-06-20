import gql from "graphql-tag";

export const CONFIG = gql`
  query FullConfig {
    config {
      name
      description
      slogan
      contact
      languages
      version
      federating
      registrationsOpen
      registrationsAllowlist
      demoMode
      longEvents
      durationOfLongEvent
      countryCode
      languages
      primaryColor
      secondaryColor
      instanceLogo {
        url
      }
      defaultPicture {
        uuid
        url
        name
        metadata {
          width
          height
          blurhash
        }
      }
      eventCategories {
        id
        label
      }
      anonymous {
        participation {
          allowed
          validation {
            email {
              enabled
              confirmationRequired
            }
            captcha {
              enabled
            }
          }
        }
        eventCreation {
          allowed
          validation {
            email {
              enabled
              confirmationRequired
            }
            captcha {
              enabled
            }
          }
        }
        reports {
          allowed
        }
        actorId
      }
      location {
        latitude
        longitude
        # accuracyRadius
      }
      maps {
        tiles {
          endpoint
          attribution
        }
        routing {
          type
        }
      }
      geocoding {
        provider
        autocomplete
      }
      resourceProviders {
        type
        endpoint
        software
      }
      features {
        groups
        eventCreation
        eventExternal
        antispam
      }
      restrictions {
        onlyAdminCanCreateGroups
        onlyGroupsCanCreateEvents
      }
      auth {
        ldap
        databaseLogin
        oauthProviders {
          id
          label
        }
      }
      uploadLimits {
        default
        avatar
        banner
      }
      instanceFeeds {
        enabled
      }
      webPush {
        enabled
        publicKey
      }
      analytics {
        id
        enabled
        configuration {
          key
          value
          type
        }
      }
      search {
        global {
          isEnabled
          isDefault
        }
      }
      exportFormats {
        eventParticipants
      }
    }
  }
`;

// To avoid redundancy, this GraphQL query should ideally be
// split into two separate queries:
// - CONFIG
// - TIMEZONES
export const CONFIG_EDIT_EVENT = gql`
  query EditEventConfig {
    config {
      timezones
      features {
        groups
      }
      eventCategories {
        id
        label
      }
      anonymous {
        participation {
          allowed
          validation {
            email {
              enabled
              confirmationRequired
            }
            captcha {
              enabled
            }
          }
        }
      }
    }
  }
`;

// TERMS details are not requested in FullConfig
// because they need the locale variable, so keep them in a separate request
export const TERMS = gql`
  query Terms($locale: String) {
    config {
      terms(locale: $locale) {
        type
        url
        bodyHtml
      }
    }
  }
`;

// ABOUT details are not requested in FullConfig
// because longDescription can be heavy, so keep them in a separate request
//
// To avoid redundancy, this GraphQL query should ideally be
// split into two separate queries:
// - ABOUT with only longDescription request
// - CONFIG
export const ABOUT = gql`
  query About {
    config {
      name
      description
      longDescription
      slogan
      contact
      languages
      registrationsOpen
      registrationsAllowlist
      anonymous {
        participation {
          allowed
        }
      }
      version
      federating
      instanceFeeds {
        enabled
      }
    }
  }
`;

// RULES details are not requested in FullConfig
// because rules can be heavy, so keep them in a separate request
export const RULES = gql`
  query Rules {
    config {
      rules
    }
  }
`;

// PRIVACY details are not requested in FullConfig
// because they need the locale variable, so keep them in a separate request
export const PRIVACY = gql`
  query Privacy($locale: String) {
    config {
      privacy(locale: $locale) {
        type
        url
        bodyHtml
      }
    }
  }
`;

// TIMEZONES details are not requested in FullConfig
// because timezones are heavy, so keep them in a separate request
export const TIMEZONES = gql`
  query Timezones {
    config {
      timezones
    }
  }
`;
