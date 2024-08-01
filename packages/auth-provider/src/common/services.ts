import { HEADERS } from "@versini/auth-common";

import {
	API_ENDPOINT,
	GRAPHQL_QUERIES,
	REQUEST_CONTENT_TYPE,
	REQUEST_CREDENTIALS,
	REQUEST_METHOD,
	STATUS_FAILURE,
	STATUS_SUCCESS,
} from "./constants";
import type {
	GraphQLCallProps,
	GraphQLCallResponse,
	RestCallProps,
	RestCallResponse,
} from "./types";
import { isDev } from "./utilities";

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
 * @param {string} props.accessToken - Access token
 * @param {string} props.clientId - Client ID
 * @param {object} props.params - Parameters
 * @param {object} props.type - Service type
 *
 * @returns {Promise<GraphQLCallResponse>} - Generic response
 */
export const graphQLCall = async ({
	accessToken,
	type,
	clientId,
	params = {},
}: GraphQLCallProps): Promise<GraphQLCallResponse> => {
	try {
		const requestData = params;
		const authorization = `Bearer ${accessToken}`;
		const response = await fetch(
			isDev ? `${API_ENDPOINT.dev}/graphql` : `${API_ENDPOINT.prod}/graphql`,
			{
				credentials: REQUEST_CREDENTIALS,
				method: REQUEST_METHOD,
				headers: {
					authorization,
					"Content-Type": REQUEST_CONTENT_TYPE,
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
 * @param {string} props.type - Service type
 * @param {string} props.clientId - Client ID
 * @param {object} props.params - Parameters
 *
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
				credentials: REQUEST_CREDENTIALS,
				method: REQUEST_METHOD,
				headers: {
					"Content-Type": REQUEST_CONTENT_TYPE,
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
