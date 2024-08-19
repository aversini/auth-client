import type { HeadersLike } from "./getToken";

const getFromCookie = (headers: HeadersLike, clientId: string) => {
	const cookie = headers?.cookie;
	if (typeof cookie !== "string") {
		return;
	}
	const re = new RegExp(`auth.${clientId}.session=(.+?)(?:;|$)`);
	const match = cookie.match(re);
	if (!match) {
		return;
	}
	return match[1];
};

/**
 * Get a Session Id from a request.
 *
 * @param headers An object containing the request headers, usually `req.headers`.
 * @param clientId The client ID to use.
 *
 */
type GetSessionProps = {
	clientId: string;
	headers: HeadersLike;
};
export const getSession = ({ headers, clientId }: GetSessionProps): string => {
	const fromCookie = getFromCookie(headers, clientId);

	return fromCookie || "";
};
