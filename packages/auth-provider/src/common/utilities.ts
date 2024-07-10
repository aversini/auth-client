import {
	API_TYPE,
	AUTH_TYPES,
	HEADERS,
	JWT,
	verifyAndExtractToken,
} from "@versini/auth-common";

import { API_ENDPOINT } from "./constants";
import type { ServiceCallProps } from "./types";

const isProd = process.env.NODE_ENV === "production";
const isDev = !isProd;

export const serviceCall = async ({
	type,
	clientId,
	params = {},
}: ServiceCallProps) => {
	try {
		const response = await fetch(
			isDev ? `${API_ENDPOINT.dev}/${type}` : `${API_ENDPOINT.prod}/${type}`,
			{
				credentials: "include",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					[HEADERS.CLIENT_ID]: `${clientId}`,
				},
				body: JSON.stringify(params),
			},
		);

		if (response.status !== 200) {
			return { status: response.status, data: [] };
		}
		const { data, errors } = await response.json();

		return {
			status: response.status,
			data,
			errors,
		};
	} catch (_error) {
		console.error(_error);
		return { status: 500, data: [] };
	}
};

export const logoutUser = async ({
	userId,
	idToken,
	accessToken,
	refreshToken,
	clientId,
	domain,
}: {
	userId: string;
	idToken: string;
	accessToken: string;
	refreshToken: string;
	clientId: string;
	domain: string;
}) => {
	try {
		const response = await serviceCall({
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
			status: response.status === 200,
		};
	} catch (_error) {
		return {
			status: false,
		};
	}
};

export type AuthenticateUserProps = {
	username: string;
	password: string;
	clientId: string;
	nonce: string;
	type?: string;
	sessionExpiration?: string;
	code?: string;
	code_verifier?: string;
	domain: string;
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
}: AuthenticateUserProps) => {
	try {
		const response = await serviceCall({
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
			},
		});
		const jwt = await verifyAndExtractToken(response.data.idToken);
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
}: { clientId: string; nonce: string; code_challenge: string }) => {
	try {
		const response = await serviceCall({
			type: API_TYPE.CODE,
			clientId,
			params: {
				type: AUTH_TYPES.CODE,
				nonce,
				code_challenge,
			},
		});
		if (response.data.code) {
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

export type getAccessTokenSilently = {
	clientId: string;
	userId: string;
	nonce: string;
	refreshToken: string;
	accessToken: string;
	domain: string;
};
export const getAccessTokenSilently = async ({
	clientId,
	userId,
	nonce,
	refreshToken,
	accessToken,
	domain,
}: getAccessTokenSilently) => {
	try {
		const response = await serviceCall({
			type: API_TYPE.AUTHENTICATE,
			clientId,
			params: {
				type: AUTH_TYPES.REFRESH_TOKEN,
				userId,
				nonce,
				refreshToken,
				accessToken,
				domain,
			},
		});
		const jwt = await verifyAndExtractToken(response.data.accessToken);
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
