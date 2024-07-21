import { JWT } from "./constants";
import { verifyAndExtractToken } from "./verifyToken";

export type ScopesGrants =
	| {
			[key: string]: string[];
	  }
	| string[];

/**
 * Checks if the given token grants the required scopes.
 *
 * This function verifies the provided token and extracts its payload.
 * It then checks if the token contains the required scopes. The scopes can be provided
 * either as an array of strings or as a map of string arrays. When the scopes are provided
 * as a map, the function checks if the token contains at least one of the scopes in each
 * of the map's values (OR operation).
 *
 *
 * @async
 * @function isGranted
 * @param {string} token - The token to be verified and checked for scopes.
 * @param {ScopesGrants} scopes - The required scopes. This can be an array of strings
 *  															representing the scopes or a map where the keys are strings
 * 																and the values are arrays of strings representing the scopes.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the
 * 															token grants the required scopes.
 *
 * @example
 * Example with an array of scopes (AND operation)
 * const scopesArray = ["read", "write"];
 * const res = isGranted(token, scopesArray);
 * console.log(res); // true only if the token has both "read" and "write" scopes
 *
 * @example
 * Example with a map of scopes (OR operation)
 * const scopesMap = {
 * 	"admin": ["read", "write"],
 * 	"user": ["read"]
 * };
 * const res = isGranted(token, scopesMap);
 * console.log(res); // true if the token has either "read" and "write" scopes or "read" scope
 */
export const isGranted = async (
	token: string,
	scopes: ScopesGrants,
): Promise<boolean> => {
	const jwt = await verifyAndExtractToken(token);

	if (!jwt || !Array.isArray(jwt.payload?.[JWT.SCOPES_KEY])) {
		return false;
	}

	const tokenScopes = jwt.payload[JWT.SCOPES_KEY] as string[];

	if (Array.isArray(scopes)) {
		return scopes.every((scope) => tokenScopes.includes(scope));
	}

	return Object.keys(scopes).some((key) =>
		scopes[key].every((scope) => tokenScopes.includes(scope)),
	);
};
