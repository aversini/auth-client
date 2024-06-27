#!/usr/bin/env node

import "dotenv/config";
import kleur from "kleur";
import portfinder from "portfinder";

import { initServer } from "./common/fastify.js";
import { isSSL, logger } from "./common/utilities.js";

export const DEFAULT_PORT = Number(process.env.SERVER_PORT) || 3003;
const fastify = await initServer();

/**
 * Run the server!
 */
let port: number,
	portMessage = "";
const start = async () => {
	try {
		port = await portfinder.getPortPromise({ port: Number(DEFAULT_PORT) });
		if (port !== DEFAULT_PORT) {
			portMessage = `\n\n${kleur.yellow(
				`Warning: port ${DEFAULT_PORT} was not available!`,
			)}`;
		}
		const listenOptions: { port?: number; host?: string } = {
			port,
			host: process.env.SERVER_HOST,
		};

		await fastify.listen(listenOptions);

		const address = process.env.SERVER_HOST;
		const scheme = isSSL ? "https" : "http";
		const url = `${scheme}://${address}:${port}`;
		const messages = [
			`${kleur.cyan("API Server")} is up and running!`,
			"",
			`${kleur.cyan(url)}`,
			"",
			`Hit CTRL+C to shut it down.${portMessage}`,
		];

		logger.printBox(messages, { newLineAfter: false });
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
};
start();
