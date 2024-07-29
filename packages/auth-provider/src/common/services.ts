import { HEADERS } from "@versini/auth-common";
import { API_ENDPOINT, STATUS_FAILURE, STATUS_SUCCESS } from "./constants";
import type {
	GraphQLCallProps,
	GraphQLCallResponse,
	RestCallProps,
	RestCallResponse,
} from "./types";
import { isDev } from "./utilities";

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

/**
 * GraphQL call
 *
 * @async
 * @param {GraphQLCallProps} props - GraphQL call properties
 * @returns {Promise<GraphQLCallResponse>} - Generic response
 */
export const graphQLCall = async ({
	accessToken,
	type,
	clientId,
	params = {},
}: GraphQLCallProps): Promise<GraphQLCallResponse> => {
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
			return { status: STATUS_FAILURE, data: [] };
		}
		const { data } = await response.json();
		return {
			status: STATUS_SUCCESS,
			data: data[type.method],
		};
	} catch (_error) {
		console.error(_error);
		return { status: STATUS_FAILURE, data: [] };
	}
};

/**
 * REST call
 *
 * @async
 * @param {RestCallProps} props - REST call properties
 * @returns {Promise<RestCallResponse>} - Generic response
 */
export const restCall = async ({
	type,
	clientId,
	params = {},
}: RestCallProps): Promise<RestCallResponse> => {
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
			return { status: STATUS_FAILURE, data: [] };
		}
		const { data } = await response.json();

		return {
			status: STATUS_SUCCESS,
			data: data || [],
		};
	} catch (_error) {
		console.error(_error);
		return { status: STATUS_FAILURE, data: [] };
	}
};