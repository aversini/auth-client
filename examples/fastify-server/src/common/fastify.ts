import fastifyAuth from "@fastify/auth";
import fastifyCache from "@fastify/caching";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { verifyAndExtractToken } from "@versini/auth-common";
import Fastify from "fastify";
import mercurius from "mercurius";

import { resolvers, schema } from "../services/graphql.js";
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
	fastify.register(mercurius, {
		schema,
		resolvers,
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
			try {
				const accessToken = _reply.request.headers.authorization.replace(
					"Bearer ",
					"",
				);
				const res = await verifyAndExtractToken(accessToken);
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
