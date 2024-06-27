import { Logger } from "@node-cli/logger";

export const logger = new Logger({
	boring: String(process.env.NODE_ENV) === "test",
});

export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;
export const isSSL = process.env.SSL_KEY && process.env.SSL_CERT;
