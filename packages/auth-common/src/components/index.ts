import * as jose from "jose";

export const AUTH_TYPES = {
	ID_TOKEN: "id_token",
	ACCESS_TOKEN: "token",
	ID_AND_ACCESS_TOKEN: "id_token token",
};

export const HEADERS = {
	CLIENT_ID: "X-Auth-ClientId",
};

export const JWT = {
	ALG: "RS256",
	USER_ID_KEY: "_id",
	TOKEN_ID_KEY: "__raw",
	NONCE_KEY: "_nonce",
	ISSUER: "gizmette.com",
};

export const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsF6i3Jd9fY/3COqCw/m7
w5PKyTYLGAI2I6SIIdpe6i6DOCbEkmDz7LdVsBqwNtVi8gvWYIj+8ol6rU3qu1v5
i1Jd45GSK4kzkVdgCmQZbM5ak0KI99q5wsrAIzUd+LRJ2HRvWtr5IYdsIiXaQjle
aMwPFOIcJH+rKfFgNcHLcaS5syp7zU1ANwZ+trgR+DifBr8TLVkBynmNeTyhDm2+
l0haqjMk0UoNPPE8iYBWUHQJJE1Dqstj65d6Eh5g64Pao25y4cmYJbKjiblIGEkE
sjqybA9mARAqh9k/eiIopecWSiffNQTwVQVd2I9ZH3BalhEXHlqFgrjz51kFqg81
awIDAQAB
-----END PUBLIC KEY-----`;

export const TOKEN_EXPIRATION = {
	ACCESS: "5m",
	ID: "90d",
};

export const verifyAndExtractToken = async (token: string) => {
	try {
		const alg = JWT.ALG;
		const spki = JWT_PUBLIC_KEY;
		const publicKey = await jose.importSPKI(spki, alg);
		return await jose.jwtVerify(token, publicKey, {
			issuer: JWT.ISSUER,
		});
	} catch (_error) {
		return undefined;
	}
};
