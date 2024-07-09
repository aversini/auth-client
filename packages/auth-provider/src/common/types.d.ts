import {
	ACTION_TYPE_LOADING,
	ACTION_TYPE_LOGIN,
	ACTION_TYPE_LOGOUT,
} from "./constants";

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
};

export type AuthState = {
	isLoading: boolean;
	isAuthenticated: boolean;
	logoutReason?: string;
	user?: {
		userId?: string;
		username?: string;
	};
};

export type LoginType = (
	username: string,
	password: string,
	type?: string,
) => Promise<boolean>;

export type AuthContextProps = {
	login: LoginType;
	logout: (e?: any) => void;
	getAccessToken: () => Promise<string>;
	getIdToken: () => string;
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
