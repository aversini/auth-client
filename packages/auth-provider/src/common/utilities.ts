import {
	AUTH_TYPES,
	HEADERS,
	JWT,
	verifyAndExtractToken,
} from "@versini/auth-common";

import { API_ENDPOINT } from "./constants";
import type { ServiceCallProps } from "./types";

export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;

export const serviceCall = async ({ params = {} }: ServiceCallProps) => {
	try {
		const response = await fetch(
			isDev
				? `${API_ENDPOINT.dev}/authenticate`
				: `${API_ENDPOINT.prod}/authenticate`,
			{
				credentials: "include",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					[HEADERS.CLIENT_ID]: `${params.clientId}`,
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

export const authenticateUser = async ({
	username,
	password,
	clientId,
	nonce,
	sessionExpiration,
}: {
	username: string;
	password: string;
	clientId: string;
	nonce: string;
	sessionExpiration?: string;
}) => {
	try {
		const response = await serviceCall({
			params: {
				type: AUTH_TYPES.ID_AND_ACCESS_TOKEN,
				username,
				password,
				sessionExpiration,
				clientId,
				nonce,
			},
		});
		const jwt = await verifyAndExtractToken(response.data.idToken, clientId);
		if (
			jwt &&
			jwt.payload[JWT.USER_ID_KEY] !== "" &&
			jwt.payload[JWT.NONCE_KEY] === nonce
		) {
			return {
				idToken: response.data.idToken,
				accessToken: response.data.accessToken,
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
