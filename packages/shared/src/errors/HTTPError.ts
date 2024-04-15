export class HTTPError extends Error {
	public readonly status: HTTPStatus;

	public constructor(status: HTTPStatus, message: string) {
		super(message);
		this.status = status;
	}

	public toJSON() {
		return {
			status: this.status,
			message: this.message
		};
	}
}

export enum HTTPStatus {
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NO_CONTENT = 204,
	PERMANENT_REDIRECT = 308,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	CONFLICT = 409,
	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503
}
