import React from "react";
import { AuthState } from "../../common/types";

export const InternalContext = React.createContext<{
	state: AuthState;
	dispatch: React.Dispatch<any>;
}>({
	state: {
		isLoading: true,
		isAuthenticated: false,
		authenticationType: null,
		user: undefined,
		logoutReason: "",
		debug: false,
	},
	dispatch: () => {},
});
