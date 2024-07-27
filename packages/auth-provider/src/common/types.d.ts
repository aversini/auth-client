import { API_TYPE, AUTH_TYPES } from "@versini/auth-common";
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

export type GenericResponse = {
	status: number;
	data: any;
	errors?: string;
};

export type BooleanResponse = {
	status: boolean;
};

export type RestCallProps = {
	params: any;
	clientId: string;
	type: typeof API_TYPE.LOGOUT | typeof API_TYPE.AUTHENTICATE;
};

export type GraphQLCallProps = {
	accessToken: string;
	clientId: string;
	type: any;
	params?: any;
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

export type AuthenticateUserProps = {
	username: string;
	password: string;
	clientId: string;
	nonce: string;
	type?: string;
	sessionExpiration?: string;
	code?: string;
	code_verifier?: string;
	domain: string;
	fingerprint: string;
};

export type AuthenticateUserResponse =
	| {
			idToken: string;
			accessToken: string;
			refreshToken: string;
			userId: string;
			status: true;
	  }
	| {
			status: false;
	  };

export type GetAccessTokenSilentlyProps = {
	clientId: string;
	userId: string;
	nonce: string;
	refreshToken: string;
	accessToken: string;
	domain: string;
};

export type GetAccessTokenSilentlyResponse =
	| {
			status: true;
			accessToken: string;
			refreshToken: string;
			userId: string;
	  }
	| {
			status: false;
	  };

export type GetPreAuthCodeProps = {
	clientId: string;
	nonce: string;
	code_challenge: string;
};

export type LoginProps = (
	username: string,
	password: string,
	type?: typeof AUTH_TYPES.CODE | typeof AUTH_TYPES.PASSKEY,
) => Promise<boolean>;

export type AuthContextProps = {
	login: LoginProps;
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

export type LogoutProps = {
	userId: string;
	idToken: string;
	accessToken: string;
	refreshToken: string;
	clientId: string;
	domain: string;
};

export type RefreshTokenResponse = {
	status: "success" | "failure";
	newAccessToken?: string;
	newRefreshToken?: string;
};

export type RefreshTokenProps = {
	clientId: string;
	userId: string;
	nonce: string;
	domain: string;
};
