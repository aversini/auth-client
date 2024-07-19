import { BODY, BodyLike, type HeadersLike, getToken } from "..";

describe("getToken", () => {
	const clientId = "testClient";

	it("should return empty string if no token is found", () => {
		const headers: HeadersLike = {};
		expect(getToken({ headers, clientId })).toBe("");
	});

	it("should extract token from body", () => {
		const token = "someToken";
		const headers: HeadersLike = {};
		const body: BodyLike = {
			[BODY.ACCESS_TOKEN]: token,
		};
		expect(getToken({ body, headers, clientId })).toBe(token);
	});

	it("should extract token from authorization header", () => {
		const token = "someToken";
		const headers: HeadersLike = {
			authorization: `Bearer ${token}`,
		};
		expect(getToken({ headers, clientId })).toBe(token);
	});

	it("should extract token from cookie", () => {
		const token = "anotherToken";
		const headers: HeadersLike = {
			cookie: `auth.${clientId}=${token};`,
		};
		expect(getToken({ headers, clientId })).toBe(token);
	});

	it("should prioritize token from cookie over authorization header", () => {
		const headerToken = "headerToken";
		const cookieToken = "cookieToken";
		const headers: HeadersLike = {
			authorization: `Bearer ${headerToken}`,
			cookie: `auth.${clientId}=${cookieToken};`,
		};
		expect(getToken({ headers, clientId })).toBe(cookieToken);
	});

	it("should prioritize token from body over cookie or authorization header", () => {
		const headerToken = "headerToken";
		const cookieToken = "cookieToken";
		const bodyToken = "bodyToken";
		const body: BodyLike = {
			[BODY.ACCESS_TOKEN]: bodyToken,
		};
		const headers: HeadersLike = {
			authorization: `Bearer ${headerToken}`,
			cookie: `auth.${clientId}=${cookieToken};`,
		};
		expect(getToken({ headers, body, clientId })).toBe(bodyToken);
	});

	it("should return empty string if authorization header is not in correct format", () => {
		const headers: HeadersLike = {
			authorization: "InvalidHeader",
		};
		expect(getToken({ headers, clientId })).toBe("");
	});

	it("should return empty string if cookie does not contain the token", () => {
		const headers: HeadersLike = {
			cookie: "someOtherCookie=value;",
		};
		expect(getToken({ headers, clientId })).toBe("");
	});
});
