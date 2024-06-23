export const EXPIRED_SESSION =
	"Oops! It looks like your session has expired. For your security, please log in again to continue.";

export const AUTH_CONTEXT_ERROR =
	"You forgot to wrap your component in <AuthProvider>.";

export const API_ENDPOINT = {
	dev: "https://auth.gizmette.local.com:3003",
	prod: "https://mylogin.gizmette.com",
};

export const LOCAL_STORAGE_PREFIX = "@@auth@@";

export const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsF6i3Jd9fY/3COqCw/m7
w5PKyTYLGAI2I6SIIdpe6i6DOCbEkmDz7LdVsBqwNtVi8gvWYIj+8ol6rU3qu1v5
i1Jd45GSK4kzkVdgCmQZbM5ak0KI99q5wsrAIzUd+LRJ2HRvWtr5IYdsIiXaQjle
aMwPFOIcJH+rKfFgNcHLcaS5syp7zU1ANwZ+trgR+DifBr8TLVkBynmNeTyhDm2+
l0haqjMk0UoNPPE8iYBWUHQJJE1Dqstj65d6Eh5g64Pao25y4cmYJbKjiblIGEkE
sjqybA9mARAqh9k/eiIopecWSiffNQTwVQVd2I9ZH3BalhEXHlqFgrjz51kFqg81
awIDAQAB
-----END PUBLIC KEY-----`;
