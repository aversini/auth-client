export const EXPIRED_SESSION =
	"Your session has expired. For your security, please log in again to continue.";
export const LOGOUT_SESSION = "Your session has been successfully terminated.";
export const LOGIN_ERROR = "Login failed. Please try again.";
export const ACCESS_TOKEN_ERROR =
	"Error getting access token, please re-authenticate.";

export const AUTH_CONTEXT_ERROR =
	"You forgot to wrap your component in <AuthProvider>.";

export const API_ENDPOINT = {
	dev: "https://auth.gizmette.local.com:3003",
	prod: "https://mylogin.gizmette.com/auth",
};

export const LOCAL_STORAGE_PREFIX = "@@auth@@";

export const ACTION_TYPE_LOADING = "LOADING";
export const ACTION_TYPE_LOGIN = "LOGIN";
export const ACTION_TYPE_LOGOUT = "LOGOUT";

export const STATUS_SUCCESS = "success";
export const STATUS_FAILURE = "failure";

export const REQUEST_CREDENTIALS = "include";
export const REQUEST_METHOD = "POST";
export const REQUEST_CONTENT_TYPE = "application/json";

export const GRAPHQL_QUERIES = {
	GET_REGISTRATION_OPTIONS: `mutation GetPasskeyRegistrationOptions(
	$clientId: String!,
	$username: String!,
	$id: String!) {
		getPasskeyRegistrationOptions(clientId: $clientId, username: $username, id: $id) {
			challenge
			rp {
				id
				name
			}
			user {
				id
				name
				displayName
			}
			pubKeyCredParams {
				type
				alg
			}
			timeout
			attestation
		}
	}`,
	VERIFY_REGISTRATION: `mutation VerifyPasskeyRegistration(
		$clientId: String!,
		$username: String!,
		$id: String!,
		$registration: RegistrationOptionsInput!) {
		verifyPasskeyRegistration(
			clientId: $clientId,
			username: $username,
			id: $id,
			registration: $registration) {
			status
			message
		}
	}`,
	GET_AUTHENTICATION_OPTIONS: `mutation GetPasskeyAuthenticationOptions(
		$id: String!,
		$clientId: String!,
		) {
		getPasskeyAuthenticationOptions(
			id: $id,
			clientId: $clientId) {
				rpId,
				challenge,
				allowCredentials {
					id,
					type,
					transports
				}
				timeout,
				userVerification,
		}
	}`,
	VERIFY_AUTHENTICATION: `mutation VerifyPasskeyAuthentication(
		$clientId: String!,
		$id: String!,
		$authentication: AuthenticationOptionsInput!,
		$nonce: String!,
		$domain: String,
		$sessionExpiration: String) {
		verifyPasskeyAuthentication(
			clientId: $clientId,
			id: $id,
			authentication: $authentication,
			nonce: $nonce,
			domain: $domain,
			sessionExpiration: $sessionExpiration) {
				status,
				idToken,
				accessToken,
				refreshToken,
				userId,
				username,
		}
	}`,
};
