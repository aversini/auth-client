import {
	API_TYPE,
	AUTH_TYPES,
	JWT,
	decodeToken,
	verifyAndExtractToken,
} from "@versini/auth-common";
import { getFingerprintHash } from "@versini/ui-fingerprint";
import { restCall } from "./services";
import type {
	AuthState,
	AuthenticateUserProps,
	AuthenticateUserResponse,
	BooleanResponse,
	GetAccessTokenSilentlyProps,
	GetAccessTokenSilentlyResponse,
	GetPreAuthCodeProps,
	LogoutProps,
} from "./types";

const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;

export const emptyState: AuthState = {
	isLoading: true,
	isAuthenticated: false,
	authenticationType: null,
	user: undefined,
	logoutReason: "",
	debug: false,
};

export const getUserIdFromToken = (token: string): string => {
	try {
		const jwt = decodeToken(token);
		return jwt ? (jwt[JWT.USER_ID_KEY] as string) : "";
	} catch (_error) {
		return "";
	}
};

export const logoutUser = async ({
	userId,
	idToken,
	accessToken,
	refreshToken,
	clientId,
	domain,
}: LogoutProps): Promise<BooleanResponse> => {
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
			status: response?.status === 200,
		};
	} catch (_error) {
		return {
			status: false,
		};
	}
};

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

export const getPreAuthCode = async ({
	nonce,
	clientId,
	code_challenge,
}: GetPreAuthCodeProps) => {
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
				status: true,
				code: response.data.code,
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

export const getCustomFingerprint = async (): Promise<string> => {
	try {
		return await getFingerprintHash();
	} catch (_error) {
		return "";
	}
};
