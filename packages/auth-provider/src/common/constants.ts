export const EXPIRED_SESSION =
	"Oops! It looks like your session has expired. For your security, please log in again to continue.";
export const LOGOUT_SESSION = "Your session has been successfully terminated.";
export const LOGIN_ERROR = "Login failed. Please try again.";
export const ACCESS_TOKEN_ERROR =
	"Error getting access token, please re-authenticate.";

export const AUTH_CONTEXT_ERROR =
	"You forgot to wrap your component in <AuthProvider>.";

export const API_ENDPOINT = {
	dev: "https://auth.gizmette.local.com:3003",
	prod: "https://mylogin.gizmette.com/auth",
};

export const LOCAL_STORAGE_PREFIX = "@@auth@@";

export const ACTION_TYPE_LOADING = "LOADING";
export const ACTION_TYPE_LOGIN = "LOGIN";
export const ACTION_TYPE_LOGOUT = "LOGOUT";
