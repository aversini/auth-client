import { BODY } from "./constants";

export type BodyLike = Record<string, unknown> & { access_token?: string };
export type HeadersLike = Record<string, unknown> & {
	authorization?: string;
	"content-type"?: string;
	cookie?: string;
};

const TOKEN_RE = /^Bearer (.+)$/i;

const getTokenFromHeader = (headers: HeadersLike) => {
	if (typeof headers?.authorization !== "string") {
		return;
	}
	const match = headers.authorization.match(TOKEN_RE);
	if (!match) {
		return;
	}
	return match[1];
};

const getFromCookie = (headers: HeadersLike, clientId: string) => {
	const cookie = headers?.cookie;
	if (typeof cookie !== "string") {
		return;
	}
	const re = new RegExp(`auth.${clientId}=(.+?)(?:;|$)`);
	const match = cookie.match(re);
	if (!match) {
		return;
	}
	return match[1];
};

const getFromBody = (body?: BodyLike) => {
	const accessToken = body?.[BODY.ACCESS_TOKEN];
	if (typeof accessToken === "string") {
		return accessToken;
	}
};

/**
 * Get a Bearer Token from a request.
 * It checks the following sources in order:
 * 1. The `access_token` body parameter.
 * 2. The `auth.${clientId}` cookie.
 * 3. The `Authorization` header.
 *
 * @param headers An object containing the request headers, usually `req.headers`.
 * @param body An object containing the request body, usually `req.body`.
 * @param clientId The client ID to use.
 *
 */
type GetToken = {
	clientId: string;
	headers: HeadersLike;
	body?: BodyLike;
};
export const getToken = ({ headers, body, clientId }: GetToken): string => {
	const fromHeader = getTokenFromHeader(headers);
	const fromCookie = getFromCookie(headers, clientId);
	const fromBody = getFromBody(body);

	return fromBody || fromCookie || fromHeader || "";
};
