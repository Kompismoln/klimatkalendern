import { Actor, IActor } from './actor';
import { IAddress } from '@/types/address.model';
import { ITag } from '@/types/tag.model';
import { IPicture } from '@/types/picture.model';

export enum EventStatus {
  TENTATIVE = 'TENTATIVE',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum EventVisibility {
  PUBLIC = 'PUBLIC',
  UNLISTED = 'UNLISTED',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export enum EventJoinOptions {
  FREE = 'FREE',
  RESTRICTED = 'RESTRICTED',
  INVITE = 'INVITE',
}

export enum EventVisibilityJoinOptions {
  PUBLIC = 'PUBLIC',
  LINK = 'LINK',
  LIMITED = 'LIMITED',
}

export enum ParticipantRole {
  NOT_APPROVED = 'not_approved',
  PARTICIPANT = 'participant',
  MODERATOR = 'moderator',
  ADMINISTRATOR = 'administrator',
  CREATOR = 'creator',
}

export enum Category {
  BUSINESS = 'business',
  CONFERENCE = 'conference',
  BIRTHDAY = 'birthday',
  DEMONSTRATION = 'demonstration',
  MEETING = 'meeting',
}

export interface IParticipant {
  role: ParticipantRole;
  actor: IActor;
  event: IEvent;
}

export interface IOffer {
  price: number;
  priceCurrency: string;
  url: string;
}

export interface IParticipationCondition {
  title: string;
  content: string;
  url: string;
}

export enum CommentModeration {
    ALLOW_ALL = 'ALLOW_ALL',
    MODERATED = 'MODERATED',
    CLOSED = 'CLOSED',
}

export interface IEvent {
  id?: number;
  uuid: string;
  url: string;
  local: boolean;

  title: string;
  slug: string;
  description: string;
  category: Category | null;

  beginsOn: Date;
  endsOn: Date | null;
  publishAt: Date;

  status: EventStatus;
  visibility: EventVisibility;

  joinOptions: EventJoinOptions;

  picture: IPicture | null;

  organizerActor: IActor;
  attributedTo: IActor;
  participants: IParticipant[];

  relatedEvents: IEvent[];

  onlineAddress?: string;
  phoneAddress?: string;
  physicalAddress?: IAddress;

  tags: ITag[];
  options: IEventOptions;
}

export interface IEventOptions {
  maximumAttendeeCapacity: number;
  remainingAttendeeCapacity: number;
  showRemainingAttendeeCapacity: boolean;
  offers: IOffer[];
  participationConditions: IParticipationCondition[];
  attendees: string[];
  program: string;
  commentModeration: CommentModeration;
  showParticipationPrice: boolean;
}

export class EventOptions implements IEventOptions {
  maximumAttendeeCapacity: number = 0;
  remainingAttendeeCapacity: number = 0;
  showRemainingAttendeeCapacity: boolean = false;
  offers: IOffer[] = [];
  participationConditions: IParticipationCondition[] = [];
  attendees: string[] = [];
  program: string = '';
  commentModeration: CommentModeration = CommentModeration.ALLOW_ALL;
  showParticipationPrice: boolean = false;
}

export class EventModel implements IEvent {
  id?: number;

  beginsOn = new Date();
  endsOn: Date | null = new Date();

  title = '';
  url = '';
  uuid = '';
  slug = '';
  description = '';
  local = true;

  onlineAddress: string | undefined = '';
  phoneAddress: string | undefined = '';
  physicalAddress?: IAddress;

  picture: IPicture | null = null;

  visibility = EventVisibility.PUBLIC;
  category: Category | null = Category.MEETING;
  joinOptions = EventJoinOptions.FREE;
  status = EventStatus.CONFIRMED;

  publishAt = new Date();

  participants: IParticipant[] = [];

  relatedEvents: IEvent[] = [];

  attributedTo = new Actor();
  organizerActor = new Actor();

  tags: ITag[] = [];
  options: IEventOptions = new EventOptions();

  constructor(hash?: IEvent) {
    if (!hash) return;

    this.id = hash.id;
    this.uuid = hash.uuid;
    this.url = hash.url;
    this.local = hash.local;

    this.title = hash.title;
    this.slug = hash.slug;
    this.description = hash.description;
    this.category = hash.category;

    this.beginsOn = new Date(hash.beginsOn);
    if (hash.endsOn) this.endsOn = new Date(hash.endsOn);

    this.publishAt = new Date(hash.publishAt);

    this.status = hash.status;
    this.visibility = hash.visibility;

    this.joinOptions = hash.joinOptions;

    this.picture = hash.picture;

    this.organizerActor = new Actor(hash.organizerActor);
    this.attributedTo = new Actor(hash.attributedTo);
    this.participants = hash.participants;

    this.relatedEvents = hash.relatedEvents;

    this.onlineAddress = hash.onlineAddress;
    this.phoneAddress = hash.phoneAddress;
    this.physicalAddress = hash.physicalAddress;

    this.tags = hash.tags;
    this.options = hash.options;
  }
}
