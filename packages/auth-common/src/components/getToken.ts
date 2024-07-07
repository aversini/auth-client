export type HeadersLike = Record<string, unknown> & {
	authorization?: string;
	"content-type"?: string;
	cookie?: string;
};

const TOKEN_RE = /^Bearer (.+)$/i;

const getTokenFromHeader = (headers: HeadersLike) => {
	if (typeof headers.authorization !== "string") {
		return;
	}
	const match = headers.authorization.match(TOKEN_RE);
	if (!match) {
		return;
	}
	return match[1];
};

const getFromCookie = (headers: HeadersLike, clientId: string) => {
	const cookie = headers.cookie;
	const re = new RegExp(`auth.${clientId}=(.+?)(?:;|$)`);
	if (typeof cookie !== "string") {
		return;
	}
	const match = cookie.match(re);
	if (!match) {
		return;
	}
	return match[1];
};

/**
 * Get a Bearer Token from a request.
 *
 * @param headers An object containing the request headers, usually `req.headers`.
 * @param clientId The client ID to use.
 *
 */
export const getToken = (headers: HeadersLike, clientId: string): string => {
	const fromHeader = getTokenFromHeader(headers);
	const fromCookie = getFromCookie(headers, clientId);

	if (!fromCookie && !fromHeader) {
		return "";
	}

	return (fromCookie || fromHeader) as string;
};
