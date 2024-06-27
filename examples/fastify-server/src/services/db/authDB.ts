import path from "node:path";
import { verifyPassword } from "@node-cli/secret";
import { JWT } from "@versini/auth-common";
import fs from "fs-extra";
import * as jose from "jose";
import lodash from "lodash";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import ms from "ms";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import type {
	AuthClientData,
	AuthData,
	AuthUserData,
} from "../../common/types.js";
import { emptyClient, emptyUser } from "../../common/utilities.js";

const CLIENT_DB_KEY = "clients";
const USER_DB_KEY = "users";
const ACCESS_EXPIRATION = "5m";
const ID_EXPIRATION = "90d";

let database: Low<AuthData> & {
	chain: lodash.ExpChain<AuthData>;
};

export const bootstrapDatabase = async () => {
	/**
	 * Extend Low class with a new `chain` field
	 * that is a lodash chain object.
	 */
	class LowWithLodash<T> extends Low<T> {
		chain: lodash.ExpChain<this["data"]> = lodash.chain(this).get("data");
	}

	const defaultData: AuthData = {
		[CLIENT_DB_KEY]: [],
		[USER_DB_KEY]: [],
	};

	/**
	 * Getting auth.json file path from command
	 * line arguments using yargs.
	 */
	const argv = await yargs(hideBin(process.argv)).options({
		db: {
			type: "string",
			demandOption: true,
			describe: "Auth database file path",
		},
	}).argv;
	const databaseFile = path.resolve(argv.db);
	await fs.ensureDir(path.dirname(databaseFile));

	/**
	 * Configure lowdb to write data to the
	 * JSON file specified in command line.
	 */
	const adapter = new JSONFile<AuthData>(databaseFile);
	database = new LowWithLodash(adapter, defaultData);

	/**
	 * Read data from JSON file, this will set
	 * db.data content. If JSON file doesn't
	 * exist, defaultData is used instead
	 */
	await database.read();
	return database;
};

const getDatabase = async () => {
	if (!database) {
		database = await bootstrapDatabase();
	}
	return database;
};

/**
 *  This function checks if a user/password exist.
 */
type AuthenticateUserOptions = {
	username: string;
	password: string;
	clientId: string;
};
export const authenticateUserInDB = async ({
	username,
	password,
	clientId,
}: AuthenticateUserOptions): Promise<{
	status: string;
	user: AuthUserData;
}> => {
	const database = await getDatabase();
	let data: AuthUserData[] = [];
	if (username && password && clientId) {
		const user = database.chain
			.get(USER_DB_KEY)
			.filter({ username, clientId })
			.value();

		if (user.length > 0) {
			if (verifyPassword(password, user[0].hashedPassword)) {
				data = user;
			}
		}
	}

	return {
		status: data.length > 0 ? "success" : "error",
		user: data.length > 0 ? data[0] : emptyUser,
	};
};

/**
 *  This function finds a user by username or token.
 */
type FindUserOptions = {
	username?: string;
	token?: string;
	clientId: string;
};
export const findUserInDB = async ({
	username,
	token,
	clientId,
}: FindUserOptions): Promise<{ status: string; user: AuthUserData }> => {
	const database = await getDatabase();
	let data: AuthUserData[] = [];

	if (username) {
		data = database.chain
			.get(USER_DB_KEY)
			.filter({ clientId, username })
			.value();
	} else if (token) {
		const decoded = jose.decodeJwt(token);
		data = database.chain
			.get(USER_DB_KEY)
			.filter({ id: decoded._id as string, clientId })
			.value();
	}

	return {
		status: data.length > 0 ? "success" : "error",
		user: data.length > 0 ? data[0] : emptyUser,
	};
};

/**
 * This function creates a new user.
 */
type CreateUserOptions = {
	username: string;
	email: string;
	hashedPassword: string;
	active: boolean;
	id: string;
	clientId: string;
};
export const createUserInDB = async ({
	username,
	email,
	hashedPassword,
	active,
	id,
	clientId,
}: CreateUserOptions) => {
	const database = await getDatabase();

	const user = {
		clientId,
		id,
		active,
		username,
		email,
		hashedPassword,
		tokens: [],
	};

	// First, check if the client exists
	const { client: existingClient } = await findClientInDB({ id: clientId });
	if (!existingClient || existingClient.id === "") {
		return {
			status: "error",
			user: emptyUser,
		};
	}

	// Second, check if the user already exists
	const { user: existingUser } = await findUserInDB({
		username,
		clientId: existingClient.id,
	});
	if (existingUser && existingUser.id !== "") {
		return {
			status: "error",
			user: existingUser,
		};
	}

	// Add the user to the database
	const data = database.chain.get(USER_DB_KEY).value();
	data.push(user);
	await database.write();

	return {
		status: "success",
		user,
	};
};

/**
 * This function deletes a user.
 */
type DeleteUserOptions = {
	username: string;
	password: string;
	clientId: string;
};
export const deleteUserInDB = async ({
	username,
	password,
	clientId,
}: DeleteUserOptions) => {
	const database = await getDatabase();
	const data = database.chain.get(USER_DB_KEY).value();
	const userIndex = data.findIndex((user) => {
		return user.username === username && user.clientId === clientId;
	});

	if (userIndex !== -1) {
		const user = data[userIndex];
		if (verifyPassword(password, user.hashedPassword)) {
			data.splice(userIndex, 1);
			await database.write();
			return {
				status: "success",
				user,
			};
		} else {
			return {
				status: "error",
				user: emptyUser,
			};
		}
	}
	return {
		status: "error",
		user: emptyUser,
	};
};

/**
 *  This function finds a client by name or id.
 */
type FindClientOptions = {
	name?: string;
	id?: string;
};
export const findClientInDB = async ({
	name,
	id,
}: FindClientOptions): Promise<{ status: string; client: AuthClientData }> => {
	const database = await getDatabase();
	let data: AuthClientData[] = [];
	if (name) {
		data = database.chain.get(CLIENT_DB_KEY).filter({ name }).value();
	}
	if (id) {
		data = database.chain.get(CLIENT_DB_KEY).filter({ id }).value();
	}
	return {
		status: data.length > 0 ? "success" : "error",
		client: data.length > 0 ? data[0] : emptyClient,
	};
};

/**
 * This function creates a new client.
 */
type CreateClientOptions = {
	name: string;
	email: string;
	active: boolean;
	id: string;
};
export const createClientInDB = async ({
	name,
	email,
	active,
	id,
}: CreateClientOptions): Promise<{
	status: string;
	client: AuthClientData;
}> => {
	const database = await getDatabase();
	const client = {
		id,
		active,
		name,
		email,
		allowedOrigins: [],
	};

	// First check if the client already exists
	const { client: existingClient } = await findClientInDB({ name });
	if (existingClient && existingClient.id !== "") {
		return {
			status: "error",
			client: existingClient,
		};
	}

	// Add the client to the database
	const data = database.chain.get(CLIENT_DB_KEY).value();
	data.push(client);
	await database.write();

	return {
		status: "success",
		client,
	};
};

/**
 * This function updates an existing client.
 */
type UpdateClientOptions = {
	name: string;
	allowedOrigins: string[];
};
export const updateClientInDB = async ({
	name,
	allowedOrigins,
}: UpdateClientOptions): Promise<{
	status: string;
	client: AuthClientData;
}> => {
	const database = await getDatabase();

	// First check if the clientexists
	const { client: existingClient } = await findClientInDB({ name });
	if (!existingClient || existingClient.id === "") {
		return {
			status: "error",
			client: emptyClient,
		};
	}

	// Update the client in the database
	existingClient.allowedOrigins = allowedOrigins;
	await database.write();

	return {
		status: "success",
		client: existingClient,
	};
};

type LogoutUserOptions = {
	idToken: string;
	accessToken: string;
	clientId: string;
};
export const logoutUserInDB = async ({
	idToken,
	accessToken,
	clientId,
}: LogoutUserOptions) => {
	const database = await getDatabase();
	const data = database.chain.get(USER_DB_KEY).value();
	const decoded = jose.decodeJwt(idToken);
	const userIndex = data.findIndex((user) => {
		return user.id === decoded._id && user.clientId === clientId;
	});

	if (userIndex !== -1) {
		const user = data[userIndex];
		/**
		 * The user.tokens array should be filtered to remove both the idToken
		 * and the accessToken.
		 * user.tokens array looks like that:
		 * [
		 *  {
		 *    idToken: "abc",
		 *    idTokenExpiresAt: 1234567890,
		 *  },
		 * {
		 *    idToken: "def",
		 *    idTokenExpiresAt: 1234567891,
		 *  },
		 *  {
		 *    accessToken: "xyz",
		 *    idTokenExpiresAt: 1234567892,
		 *  },
		 * {
		 *    accessToken: "ghi",
		 *    idTokenExpiresAt: 1234567893,
		 *  },
		 * ]
		 */
		user.tokens = user.tokens.filter((token) => {
			return token.idToken !== idToken && token.accessToken !== accessToken;
		});

		await database.write();
		return {
			status: "success",
			user,
		};
	}
	return {
		status: "error",
		user: emptyUser,
	};
};

/**
 * This function creates a new JWT token and adds it to the user.
 */
type GenerateIdTokenOptions = {
	username: string;
	sessionExpiration?: string;
	clientId: string;
	nonce: string;
};
export const generateIdTokenInDB = async ({
	username,
	sessionExpiration,
	clientId,
	nonce,
}: GenerateIdTokenOptions) => {
	const database = await getDatabase();
	const user = database.chain
		.get(USER_DB_KEY)
		.filter({ clientId, username })
		.value();

	if (user && user.length === 1) {
		let expiresIn = ID_EXPIRATION;
		if (sessionExpiration && ms(sessionExpiration)) {
			expiresIn = sessionExpiration;
		}
		const pkcs8 = process.env.JWT_PRIVATE_KEY;
		const privateKey = await jose.importPKCS8(pkcs8, JWT.ALG);
		const idToken = await new jose.SignJWT({
			[JWT.USER_ID_KEY]: user[0].id,
			[JWT.NONCE_KEY]: nonce,
		})
			.setProtectedHeader({ alg: JWT.ALG })
			.setIssuedAt()
			.setIssuer(JWT.ISSUER)
			.setAudience(clientId)
			.setExpirationTime(expiresIn)
			.sign(privateKey);

		user[0].tokens =
			user[0]?.tokens?.length > 0
				? user[0].tokens.concat({
						idToken,
						idTokenExpiresAt: Date.now() + ms(expiresIn),
					})
				: [
						{
							idToken,
							idTokenExpiresAt: Date.now() + ms(expiresIn),
						},
					];

		await database.write();
		return {
			status: "success",
			idToken,
		};
	}
	return {
		status: "error",
		token: "",
	};
};

type GenerateAccessTokenOptions = {
	username: string;
	clientId: string;
	nonce: string;
};
export const generateAccessTokenInDB = async ({
	username,
	clientId,
	nonce,
}: GenerateAccessTokenOptions) => {
	const database = await getDatabase();
	const user = database.chain
		.get(USER_DB_KEY)
		.filter({ clientId, username })
		.value();

	if (user && user.length === 1) {
		const expiresIn = ACCESS_EXPIRATION;
		const pkcs8 = process.env.JWT_PRIVATE_KEY;
		const privateKey = await jose.importPKCS8(pkcs8, JWT.ALG);
		const accessToken = await new jose.SignJWT({
			[JWT.NONCE_KEY]: nonce,
		})
			.setProtectedHeader({ alg: JWT.ALG })
			.setIssuedAt()
			.setSubject(user[0].id)
			.setIssuer(JWT.ISSUER)
			.setAudience(clientId)
			.setExpirationTime(expiresIn)
			.sign(privateKey);

		user[0].tokens =
			user[0]?.tokens?.length > 0
				? user[0].tokens.concat({
						accessToken,
						accessTokenExpiresAt: Date.now() + ms(expiresIn),
					})
				: [
						{
							accessToken,
							accessTokenExpiresAt: Date.now() + ms(expiresIn),
						},
					];

		await database.write();
		return {
			status: "success",
			accessToken,
		};
	}
	return {
		status: "error",
		token: "",
	};
};

/**
 * This function removes all tokens for all users.
 */
export const removeAllTokensInDB = async () => {
	const database = await getDatabase();
	const data = database.chain.get(USER_DB_KEY).value();
	data.forEach((user) => {
		user.tokens = [];
	});
	await database.write();
};
