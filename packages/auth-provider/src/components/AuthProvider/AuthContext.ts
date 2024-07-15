import { createContext } from "react";
import { AUTH_CONTEXT_ERROR } from "../../common/constants";
import type { AuthContextProps } from "../../common/types";

const stub = (): never => {
	throw new Error(AUTH_CONTEXT_ERROR);
};

export const AuthContext = createContext<AuthContextProps>({
	isAuthenticated: false,
	isLoading: false,
	authenticationType: null,
	login: stub,
	logout: stub,
	getAccessToken: stub,
	getIdToken: stub,
	registeringForPasskey: stub,
	loginWithPasskey: stub,
	logoutReason: "",
});
