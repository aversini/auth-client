import { type HeadersLike, getSession } from "..";

describe("getSession", () => {
	const clientId = "testClient";

	it("should return empty string if no session is found", () => {
		const headers: HeadersLike = {};
		expect(getSession({ headers, clientId })).toBe("");
	});

	it("should extract session from cookie", () => {
		const session = "some-session";
		const headers: HeadersLike = {
			cookie: `auth.${clientId}.session=${session};`,
		};
		expect(getSession({ headers, clientId })).toBe(session);
	});

	it("should return empty string if cookie does not contain the session", () => {
		const headers: HeadersLike = {
			cookie: "someOtherCookie=value;",
		};
		expect(getSession({ headers, clientId })).toBe("");
	});
});
