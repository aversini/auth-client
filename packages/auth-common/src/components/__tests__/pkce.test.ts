import {
	generateCodeChallenge,
	pkceChallengePair,
	verifyChallenge,
} from "../pkce";

describe("pkceChallengePair tests", () => {
	it("should have a default verifier length of 43", async () => {
		expect((await pkceChallengePair()).code_verifier.length).toBe(43);
	});

	it("should make sure that code_verifier pattern matches", async () => {
		const pattern = /^[A-Za-z\d\-._~]{43,128}$/;
		const challengePair = await pkceChallengePair(128);
		expect(challengePair.code_verifier).toMatch(pattern);
	});

	it("should make sure that code_challenge pattern doesn't have [=+/]", async () => {
		const challengePair = await pkceChallengePair(128);
		expect(challengePair.code_challenge).not.toMatch("=");
		expect(challengePair.code_challenge).not.toMatch("+");
		expect(challengePair.code_challenge).not.toMatch("/");
	});

	it("should throw an error if verifier length < 43", async () => {
		await expect(pkceChallengePair(42)).rejects.toStrictEqual(
			"Expected a length between 43 and 128. Received 42.",
		);
	});

	it("should throw an error if verifier length > 128", async () => {
		await expect(pkceChallengePair(129)).rejects.toStrictEqual(
			"Expected a length between 43 and 128. Received 129.",
		);
	});
});

describe("verifyChallenge tests", () => {
	it("should make sure that verifyChallenge returns true", async () => {
		const challengePair = await pkceChallengePair();
		expect(
			await verifyChallenge(
				challengePair.code_verifier,
				challengePair.code_challenge,
			),
		).toBe(true);
	});

	it("should make sure that verifyChallenge returns false", async () => {
		const challengePair = await pkceChallengePair();
		expect(
			await verifyChallenge(
				challengePair.code_verifier,
				challengePair.code_challenge + "blah",
			),
		).toBe(false);
	});
});

describe("generateCodeChallenge tests", () => {
	test("generateChallenge should create a consistent challenge from a code_verifier", async () => {
		const challengePair = await pkceChallengePair();
		const code_challenge = await generateCodeChallenge(
			challengePair.code_verifier,
		);
		expect(code_challenge).toBe(challengePair.code_challenge);
	});
});
