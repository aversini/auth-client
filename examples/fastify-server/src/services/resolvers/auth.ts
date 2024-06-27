import { hashPassword } from "@node-cli/secret";
import { v4 as uuidv4 } from "uuid";

import {
	createClientInDB,
	createUserInDB,
	deleteUserInDB,
	updateClientInDB,
} from "../db/authDB.js";

export const createClient = async (_: any, arguments_: any) => {
	const { name, email } = arguments_;

	const { status, client } = await createClientInDB({
		id: uuidv4(),
		name,
		email,
		active: false,
	});
	if (status === "error") {
		throw new Error("Unable to create client");
	}
	return client;
};

export const updateClient = async (_: any, arguments_: any) => {
	const { name, allowedOrigins } = arguments_;
	const { status, client } = await updateClientInDB({
		name,
		allowedOrigins,
	});
	if (status === "error") {
		throw new Error("Unable to update client");
	}
	return client;
};

export const createUser = async (_: any, arguments_: any) => {
	const { username, email, password, clientId } = arguments_;
	const hashedPassword = hashPassword(password);

	const { status, user } = await createUserInDB({
		id: uuidv4(),
		username,
		email,
		hashedPassword,
		active: false,
		clientId,
	});
	if (status === "error") {
		throw new Error("Unable to create user");
	}
	return user;
};

export const deleteUser = async (_: any, arguments_: any) => {
	const { username, password, clientId } = arguments_;
	const { status, user } = await deleteUserInDB({
		username,
		password,
		clientId,
	});
	if (status === "error") {
		throw new Error("User cannot be deleted");
	}
	return user;
};
