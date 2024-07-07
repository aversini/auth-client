import fastifyAuth from "@fastify/auth";
import fastifyCache from "@fastify/caching";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { getToken, verifyAndExtractToken } from "@versini/auth-common";
import Fastify from "fastify";

import fastifyLogs from "../services/logs.js";
import { getData } from "../services/routes/getData.js";
import { CorsOptions } from "./types.js";
import { isDev, isSSL } from "./utilities.js";

const fastifyOptions: {
	disableRequestLogging?: boolean;
	http2?: boolean;
	https?: any;
	logger?: boolean | object;
} = {
	disableRequestLogging: true,
};

fastifyOptions.logger = {
	level: "info",
	transport: {
		target: "pino-pretty",
		options: {
			hideObject: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname,reqId,resTime,resTimeMs,level",
		},
	},
};

if (isSSL) {
	fastifyOptions.http2 = true;
	fastifyOptions.https = {
		allowHTTP1: true, // fallback support for HTTP1
		key: process.env.SSL_KEY,
		cert: process.env.SSL_CERT,
	};
}

export const initServer = async () => {
	const fastify = Fastify(fastifyOptions);

	fastify.register(fastifyCookie);
	fastify.register(fastifyLogs);
	fastify.register(fastifyCache, {
		privacy: "no-cache",
	});

	fastify.register(fastifyCors, () => {
		return async (request: any, callback: any) => {
			let isAllowed = false;
			const corsOptions: CorsOptions = {
				credentials: true,
			};

			if (
				request.method === "OPTIONS" ||
				(isDev && request.headers.origin === "postman")
			) {
				// preflight requests are always allowed
				corsOptions.origin = request.headers.origin;
				isAllowed = true;
			} else {
				corsOptions.origin = request.headers.origin;
				isAllowed = true;
			}

			if (isAllowed) {
				callback(null, corsOptions);
			} else {
				callback(new Error("Not allowed"), false);
			}
		};
	});

	fastify
		.decorate("isAllowed", async (_request: any, _reply: any, done: any) => {
			console.info(`==> [${Date.now()}] : hello?`);
			try {
				const accessToken = getToken(
					_reply.request.headers,
					"b44c68f0-e5b3-4a1d-a3e3-df8632b0223b",
				);
				console.info(`==> [${Date.now()}] : `, { accessToken });

				const res = await verifyAndExtractToken(accessToken);
				console.info(`==> [${Date.now()}] : `, { res });
				if (res) {
					return done();
				}
				return done({
					data: {
						error: "Not allowed",
					},
				});
			} catch (_error) {
				console.info(`==> [${Date.now()}] : `, { _error });
				return done({
					data: {
						error: "Not allowed",
					},
				});
			}
		})
		.register(fastifyAuth)
		.after(() => {
			fastify.route({
				method: "GET",
				url: "/getData",
				// @ts-expect-error
				preHandler: fastify.auth([fastify.isAllowed]),
				handler: getData,
			});
		});

	return fastify;
};
