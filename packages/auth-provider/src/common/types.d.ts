import { AUTH_TYPES } from "@versini/auth-common";
import {
	ACTION_TYPE_LOADING,
	ACTION_TYPE_LOGIN,
	ACTION_TYPE_LOGOUT,
} from "./constants";

type AuthenticationTypes =
	| typeof AUTH_TYPES.PASSKEY
	| typeof AUTH_TYPES.CODE
	| typeof AUTH_TYPES.ID_TOKEN
	| typeof AUTH_TYPES.ACCESS_TOKEN
	| typeof AUTH_TYPES.ID_AND_ACCESS_TOKEN
	| null;

export type ServiceCallProps = {
	params: any;
	clientId: string;
	type: "authenticate" | "logout" | (string & {});
};

export type AuthProviderProps = {
	children: React.ReactNode;
	sessionExpiration?: string;
	clientId: string;
	accessType?: string;
	domain?: string;
	debug?: boolean;
};

export type AuthState = {
	isLoading: boolean;
	isAuthenticated: boolean;
	logoutReason?: string;
	authenticationType: AuthenticationTypes;
	user?: {
		userId?: string;
		username?: string;
	};
	debug?: boolean;
};

export type LoginType = (
	username: string,
	password: string,
	type?: typeof AUTH_TYPES.CODE | typeof AUTH_TYPES.PASSKEY,
) => Promise<boolean>;

export type AuthContextProps = {
	login: LoginType;
	logout: (e?: any) => void;
	getAccessToken: () => Promise<string>;
	getIdToken: () => string;
	registeringForPasskey: () => Promise<any>;
	loginWithPasskey: () => Promise<any>;
} & AuthState;

export type InternalActions =
	| {
			type: typeof ACTION_TYPE_LOADING;
			payload: {
				isLoading: boolean;
			};
	  }
	| {
			type: typeof ACTION_TYPE_LOGIN;
			payload: {
				authenticationType: AuthenticationTypes;
				user: {
					userId: string;
					username: string;
				};
			};
	  }
	| {
			type: typeof ACTION_TYPE_LOGOUT;
			payload: {
				logoutReason: string;
			};
	  };
