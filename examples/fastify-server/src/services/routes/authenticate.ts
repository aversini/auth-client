import { AUTH_TYPES } from "@versini/auth-common";
import { AUTH_ERROR } from "../../common/constants.js";
import {
	authenticateUserInDB,
	generateAccessTokenInDB,
	generateIdTokenInDB,
} from "../db/authDB.js";

export const authenticate = async (request: any, reply: any) => {
	let idTokenResponse: any, accessTokenResponse: any;
	const { username, password, sessionExpiration, clientId, type, nonce } =
		request.body as {
			username: string;
			password: string;
			sessionExpiration: string;
			clientId: string;
			type: string;
			nonce: string;
		};

	const { status } = await authenticateUserInDB({
		username,
		password,
		clientId,
	});
	if (status === "error") {
		throw new Error(AUTH_ERROR);
	}

	if (type === AUTH_TYPES.ID_TOKEN || type === AUTH_TYPES.ID_AND_ACCESS_TOKEN) {
		idTokenResponse = await generateIdTokenInDB({
			username,
			clientId,
			sessionExpiration,
			nonce,
		});

		if (
			!idTokenResponse ||
			!idTokenResponse.idToken ||
			idTokenResponse.status === "error"
		) {
			throw new Error(AUTH_ERROR);
		}
	}

	if (
		type === AUTH_TYPES.ACCESS_TOKEN ||
		type === AUTH_TYPES.ID_AND_ACCESS_TOKEN
	) {
		accessTokenResponse = await generateAccessTokenInDB({
			username,
			clientId,
			nonce,
		});

		if (
			!accessTokenResponse ||
			!accessTokenResponse.accessToken ||
			accessTokenResponse.status === "error"
		) {
			throw new Error(AUTH_ERROR);
		}
	}

	switch (type) {
		case AUTH_TYPES.ID_TOKEN:
			reply.send({
				data: { idToken: idTokenResponse.idToken },
			});
			break;
		case AUTH_TYPES.ACCESS_TOKEN:
			reply.send({
				data: { accessToken: accessTokenResponse.accessToken },
			});
			break;
		case AUTH_TYPES.ID_AND_ACCESS_TOKEN:
			reply.send({
				data: {
					idToken: idTokenResponse.idToken,
					accessToken: accessTokenResponse.accessToken,
				},
			});
			break;

		default:
			throw new Error(AUTH_ERROR);
	}
};
