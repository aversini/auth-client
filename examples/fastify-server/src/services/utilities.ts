import { emptyClient } from "../common/utilities.js";
import { findClientInDB } from "./db/authDB.js";

export const isOriginAllowedForClient = async ({ origin, clientId }) => {
	const { client: existingClient } = await findClientInDB({ id: clientId });
	if (!existingClient || existingClient.id === "") {
		return {
			status: "error",
			client: emptyClient,
		};
	}
	return {
		status: "success",
		allowed: existingClient.allowedOrigins.includes(origin),
	};
};
