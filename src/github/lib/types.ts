import type { EventPayloadMap, WebhookEventName } from "@octokit/webhooks-types";

/** Type names of possible GitHub users */
export enum UserTypes {
	USER = "User"
}

/** Types of possible GitHub actions */
export enum ActionTypes {
	CREATED = "created",
	DELETED = "deleted",
	EDITED = "edited",
	COMPLETED = "completed",
	REQUESTED_ACTION = "requested_action",
	REREQUESTED = "rerequested",
	APPEARED_IN_BRANCH = "appeared_in_branch",
	CLOSED_BY_USER = "closed_by_user",
	CLOSED = "closed",
	FIXED = "fixed",
	ASSIGNED = "assigned",
	UNASSIGNED = "unassigned",
	OPENED = "opened",
	REOPENED = "reopened",
	REOPENED_BY_USER = "reopened_by_user"
}

export const EMBED_COLORS = {
	SUCESS: "#3bf77a",
	FAILED: "#e72525",
	DEFAULT: "#3b7ff7",
	UPDATE: "#3e3bf7",
	BLACK: "#1f1f1f"
} as const;

export const BLOCKED_EVENTS: WebhookEventName[] = [
	"github_app_authorization",
	"installation",
	"installation_repositories",
	"installation_target",
	"marketplace_purchase",
	"membership",
	"ping",
	"status"
];

export type EventNames = keyof Omit<
	EventPayloadMap,
	| "github_app_authorization"
	| "installation"
	| "installation_repositories"
	| "installation_target"
	| "marketplace_purchase"
	| "membership"
	| "ping"
	| "status"
>;
export type WebhookEvents = EventPayloadMap[EventNames];
