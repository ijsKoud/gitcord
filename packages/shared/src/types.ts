export type GitHubEventSender = {
	/** The username of the sender (e.g.: ijsKoud) */
	username: string;
	/** The display name of the sender (e.g.: Daan Klarenbeek) */
	displayName?: string;
	/** The profile url of the sender */
	profileUrl: string;
	/** The profile image url of the sender */
	profileImage: string;
};
