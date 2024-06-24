import { AUTH_TYPES, HEADERS, JWT } from "@versini/auth-common";
import * as jose from "jose";
import { v4 as uuidv4 } from "uuid";

import { API_ENDPOINT, JWT_PUBLIC_KEY } from "./constants";
import type { ServiceCallProps } from "./types";

export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;

export const serviceCall = async ({ params = {} }: ServiceCallProps) => {
	try {
		const nonce = uuidv4();
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
				body: JSON.stringify({ ...params, nonce }),
			},
		);

		if (response.status !== 200) {
			return { status: response.status, data: [] };
		}
		const { data, errors } = await response.json();
		if (data.nonce !== nonce) {
			return { status: 500, data: [] };
		}

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

export const verifyAndExtractToken = async (
	token: string,
	audience: string,
) => {
	try {
		const alg = JWT.ALG;
		const spki = JWT_PUBLIC_KEY;
		const publicKey = await jose.importSPKI(spki, alg);
		return await jose.jwtVerify(token, publicKey, {
			issuer: JWT.ISSUER,
			audience,
		});
	} catch (_error) {
		return undefined;
	}
};

export const authenticateUser = async ({
	username,
	password,
	clientId,
	sessionExpiration,
}: {
	username: string;
	password: string;
	clientId: string;
	sessionExpiration?: string;
}) => {
	try {
		const response = await serviceCall({
			params: {
				type: AUTH_TYPES.ID_TOKEN,
				username,
				password,
				sessionExpiration,
				clientId,
			},
		});
		const jwt = await verifyAndExtractToken(response.data.idToken, clientId);
		if (jwt && jwt.payload[JWT.USER_ID_KEY] !== "") {
			return {
				idToken: response.data.idToken,
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
