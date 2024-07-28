import {
	API_TYPE,
	AUTH_TYPES,
	JWT,
	decodeToken,
	verifyAndExtractToken,
} from "@versini/auth-common";
import { getFingerprintHash } from "@versini/ui-fingerprint";
import { STATUS_FAILURE, STATUS_SUCCESS } from "./constants";
import { restCall } from "./services";
import type {
	AuthState,
	AuthenticateUserProps,
	AuthenticateUserResponse,
	GetAccessTokenSilentlyProps,
	GetAccessTokenSilentlyResponse,
	GetPreAuthCodeProps,
	GetPreAuthCodeResponse,
	LogoutProps,
	LogoutResponse,
} from "./types";

const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;

/**
 * Empty state for the AuthProvider
 */
export const emptyState: AuthState = {
	isLoading: true,
	isAuthenticated: false,
	authenticationType: null,
	user: undefined,
	logoutReason: "",
	debug: false,
};

/**
 * Get the user ID from the token
 *
 * @param {string} token - JWT token
 * @returns {string} - User ID
 */
export const getUserIdFromToken = (token: string): string => {
	try {
		const jwt = decodeToken(token);
		return jwt ? (jwt[JWT.USER_ID_KEY] as string) : "";
	} catch (_error) {
		return "";
	}
};

/**
 * Logout the user
 *
 * @async
 * @param {LogoutProps} props - Logout properties
 * @returns {LogoutResponse} - Logout response
 */
export const logoutUser = async ({
	userId,
	idToken,
	accessToken,
	refreshToken,
	clientId,
	domain,
}: LogoutProps): Promise<LogoutResponse> => {
	try {
		const response = await restCall({
			type: API_TYPE.LOGOUT,
			clientId,
			params: {
				userId,
				idToken,
				accessToken,
				refreshToken,
				domain,
			},
		});
		return {
			status: response?.status || STATUS_FAILURE,
		};
	} catch (_error) {
		return {
			status: STATUS_FAILURE,
		};
	}
};

/**
 * Authenticate the user
 *
 * @async
 * @param {AuthenticateUserProps} props - Authentication properties
 * @returns {AuthenticateUserResponse} - Authentication response
 */
export const authenticateUser = async ({
	username,
	password,
	clientId,
	nonce,
	type,
	sessionExpiration,
	code,
	code_verifier,
	domain,
	fingerprint,
}: AuthenticateUserProps): Promise<AuthenticateUserResponse> => {
	try {
		const response = await restCall({
			type: API_TYPE.AUTHENTICATE,
			clientId,
			params: {
				type: type || AUTH_TYPES.ID_AND_ACCESS_TOKEN,
				username,
				password,
				sessionExpiration,
				nonce,
				code,
				code_verifier,
				domain,
				fingerprint,
			},
		});
		const jwt = await verifyAndExtractToken(response?.data?.idToken);
		if (
			jwt &&
			jwt.payload[JWT.USER_ID_KEY] !== "" &&
			jwt.payload[JWT.NONCE_KEY] === nonce
		) {
			return {
				idToken: response.data.idToken,
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken,
				userId: jwt.payload[JWT.USER_ID_KEY] as string,
				status: true,
			};
		} else {
			return {
				status: false,
			};
		}
	} catch (_error) {
		return {
			status: false,
		};
	}
};

/**
 * Retrieve a pre-authorization code.
 *
 * @async
 * @param {object} options - The options object containing the following parameter:
 * @param {string} options.nonce - The nonce value used for authorization.
 * @param {string} options.clientId - The client ID.
 * @param {string} options.code_challenge - The code challenge.
 * @returns {GetPreAuthCodeResponse} - The response object.
 */
export const getPreAuthCode = async ({
	nonce,
	clientId,
	code_challenge,
}: GetPreAuthCodeProps): Promise<GetPreAuthCodeResponse> => {
	try {
		const response = await restCall({
			type: API_TYPE.CODE,
			clientId,
			params: {
				type: AUTH_TYPES.CODE,
				nonce,
				code_challenge,
			},
		});
		if (response?.data?.code) {
			return {
				status: STATUS_SUCCESS,
				data: response.data.code,
			};
		} else {
			return {
				status: STATUS_FAILURE,
				data: "",
			};
		}
	} catch (_error) {
		return {
			status: STATUS_FAILURE,
			data: "",
		};
	}
};

/**
 * Get the access token silently
 *
 * @async
 * @param {GetAccessTokenSilentlyProps} props - GetAccessTokenSilently properties
 * @returns {GetAccessTokenSilentlyResponse} - GetAccessTokenSilently response
 */
export const getAccessTokenSilently = async ({
	clientId,
	userId,
	nonce,
	refreshToken,
	accessToken,
	domain,
}: GetAccessTokenSilentlyProps): Promise<GetAccessTokenSilentlyResponse> => {
	try {
		const response = await restCall({
			type: API_TYPE.AUTHENTICATE,
			clientId,
			params: {
				type: AUTH_TYPES.REFRESH_TOKEN,
				userId,
				nonce,
				refreshToken,
				accessToken,
				domain,
				fingerprint: await getCustomFingerprint(),
			},
		});
		const jwt = await verifyAndExtractToken(response?.data?.accessToken);
		if (
			jwt &&
			jwt.payload[JWT.USER_ID_KEY] !== "" &&
			jwt.payload[JWT.NONCE_KEY] === nonce
		) {
			return {
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken,
				userId: jwt.payload[JWT.USER_ID_KEY] as string,
				status: true,
			};
		} else {
			return {
				status: false,
			};
		}
	} catch (_error) {
		return {
			status: false,
		};
	}
};

/**
 * Get the custom fingerprint
 *
 * @async
 * @returns {string} - Custom fingerprint
 */
export const getCustomFingerprint = async (): Promise<string> => {
	try {
		return await getFingerprintHash();
	} catch (_error) {
		return "";
	}
};
