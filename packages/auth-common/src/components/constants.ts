export const AUTH_TYPES = {
	ID_TOKEN: "id_token",
	ACCESS_TOKEN: "token",
	ID_AND_ACCESS_TOKEN: "id_token token",
	CODE: "code",
	REFRESH_TOKEN: "refresh_token",
	PASSKEY: "passkey",
};

export const HEADERS = {
	CLIENT_ID: "X-Auth-ClientId",
};

export const BODY = {
	ACCESS_TOKEN: "access_token",
};

export const JWT = {
	ALG: "RS256",

	USER_ID_KEY: "sub",
	TOKEN_ID_KEY: "__raw",
	NONCE_KEY: "_nonce",
	USERNAME_KEY: "username",
	AUTH_TYPE_KEY: "auth_type",
	EXPIRES_AT_KEY: "exp",
	CREATED_AT_KEY: "iat",
	SCOPES_KEY: "scopes",
	CLIENT_ID_KEY: "aud",

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
	REFRESH: "90d",
};

export const API_TYPE = {
	CODE: "code",
	LOGOUT: "logout",
	LOGIN: "login",
	REFRESH: "refresh",
};
