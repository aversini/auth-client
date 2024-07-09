import {
	ACTION_TYPE_LOADING,
	ACTION_TYPE_LOGIN,
	ACTION_TYPE_LOGOUT,
} from "../../common/constants";
import { AuthState, InternalActions } from "../../common/types";

export const reducer = (state: AuthState, action: InternalActions) => {
	if (action?.type === ACTION_TYPE_LOADING) {
		return {
			...state,
			isLoading: action.payload.isLoading,
		};
	}

	if (action?.type === ACTION_TYPE_LOGIN) {
		return {
			...state,
			isLoading: false,
			isAuthenticated: true,
			user: action.payload.user,
			logoutReason: "",
		};
	}

	if (action?.type === ACTION_TYPE_LOGOUT) {
		return {
			...state,
			isLoading: false,
			isAuthenticated: false,
			user: undefined,
			logoutReason: action.payload.logoutReason,
		};
	}

	return state;
};
