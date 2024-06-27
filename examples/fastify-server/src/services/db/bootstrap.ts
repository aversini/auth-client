import { bootstrapDatabase as bootstrapAuthDB } from "./authDB.js";

export const bootstrapDatabases = async () => {
	await bootstrapAuthDB();
};
