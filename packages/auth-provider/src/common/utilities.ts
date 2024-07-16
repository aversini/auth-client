import { getFingerprint } from "@thumbmarkjs/thumbmarkjs";
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
	fingerprint: string;
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
				fingerprint,
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

const GRAPHQL_QUERIES = {
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
				allowCredentials,
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
		$fingerprint: String) {
		verifyPasskeyAuthentication(
			clientId: $clientId,
			id: $id,
			authentication: $authentication,
			nonce: $nonce,
			domain: $domain,
			fingerprint: $fingerprint) {
				status,
				idToken,
				accessToken,
				refreshToken,
				userId,
				username,
		}
	}`,
};
export const SERVICE_TYPES = {
	GET_REGISTRATION_OPTIONS: {
		schema: GRAPHQL_QUERIES.GET_REGISTRATION_OPTIONS,
		method: "getPasskeyRegistrationOptions",
	},
	VERIFY_REGISTRATION: {
		schema: GRAPHQL_QUERIES.VERIFY_REGISTRATION,
		method: "verifyPasskeyRegistration",
	},
	GET_AUTHENTICATION_OPTIONS: {
		schema: GRAPHQL_QUERIES.GET_AUTHENTICATION_OPTIONS,
		method: "getPasskeyAuthenticationOptions",
	},
	VERIFY_AUTHENTICATION: {
		schema: GRAPHQL_QUERIES.VERIFY_AUTHENTICATION,
		method: "verifyPasskeyAuthentication",
	},
};

export const graphQLCall = async ({
	accessToken,
	type,
	clientId,
	params = {},
}: {
	accessToken: string;
	clientId: string;
	type: any;
	params?: any;
}) => {
	try {
		const requestData = type?.data ? type.data(params) : params;
		const authorization = `Bearer ${accessToken}`;
		const response = await fetch(
			isDev ? `${API_ENDPOINT.dev}/graphql` : `${API_ENDPOINT.prod}/graphql`,
			{
				method: "POST",
				credentials: "include",
				headers: {
					authorization,
					"Content-Type": "application/json",
					Accept: "application/json",
					[HEADERS.CLIENT_ID]: `${clientId}`,
				},
				body: JSON.stringify({
					query: type.schema,
					variables: requestData,
				}),
			},
		);
		if (response.status !== 200) {
			return { status: response.status, data: [] };
		}
		const { data, errors } = await response.json();
		return {
			status: response.status,
			data: data[type.method],
			errors,
		};
	} catch (_error) {
		console.error(_error);
		return { status: 500, data: [] };
	}
};

export const getCustomFingerprint = async () => {
	try {
		const res = await getFingerprint();
		if (typeof res === "string") {
			return res;
		} else if (res.hash && typeof res.hash === "string") {
			return res.hash;
		}
		return "";
	} catch (_error) {
		return "";
	}
};
