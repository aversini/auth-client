import { v4 as uuidv4 } from "uuid";

const crypto = globalThis.crypto;

/**
 * Generate a PKCE challenge verifier.
 *
 * @param length Length of the verifier.
 * @returns A random verifier `length` characters long.
 */
const generateCodeVerifier = (length: number): string => {
	return `${uuidv4()}${uuidv4()}`.slice(0, length);
};

/**
 * Converts an ArrayBuffer to base64 string.
 *
 * @param val ArrayBuffer to convert.
 * @returns Base64 string.
 */
const toBase64 = (val: ArrayBuffer): string =>
	btoa(
		[...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""),
	);

/**
 * Generate a PKCE code challenge from a code verifier.
 *
 * @param code_verifier
 * @returns The base64 url encoded code challenge.
 */
export async function generateCodeChallenge(code_verifier: string) {
	if (!crypto.subtle) {
		throw new Error(
			"crypto.subtle is available only in secure contexts (HTTPS).",
		);
	}
	const data = new TextEncoder().encode(code_verifier);
	const hashed = await crypto.subtle.digest("SHA-256", data);
	return toBase64(hashed)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

/**
 * Generate a PKCE challenge pair.
 *
 * @param length Length of the verifier (between 43-128). Defaults to 43.
 * @returns PKCE challenge pair.
 */
export async function pkceChallengePair(length?: number): Promise<{
	code_verifier: string;
	code_challenge: string;
}> {
	const actualLength = length || 43;
	if (actualLength < 43 || actualLength > 128) {
		throw `Expected a length between 43 and 128. Received ${length}.`;
	}
	const verifier = generateCodeVerifier(actualLength);
	const challenge = await generateCodeChallenge(verifier);
	return {
		code_verifier: verifier,
		code_challenge: challenge,
	};
}

/**
 * Verify that a code_verifier produces the expected code challenge.
 *
 * @param code_verifier
 * @param expectedChallenge The code challenge to verify.
 * @returns True if challenges are equal. False otherwise.
 */
export async function verifyChallenge(
	code_verifier: string,
	expectedChallenge: string,
) {
	const actualChallenge = await generateCodeChallenge(code_verifier);
	return actualChallenge === expectedChallenge;
}
