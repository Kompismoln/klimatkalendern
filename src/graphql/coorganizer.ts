import gql from "graphql-tag";
import { ACTOR_FRAGMENT } from "./actor";

export const COORGANIZER_QUERY_FRAGMENT = gql`
  fragment ParticipantQuery on Participant {
    role
    id
    coorganizer {
      ...ActorFragment
    }
    event {
      id
      uuid
    }
  }
  ${ACTOR_FRAGMENT}
`;

