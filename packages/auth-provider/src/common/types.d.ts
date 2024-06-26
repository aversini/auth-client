export type ServiceCallProps = {
	params: any;
	type: "authenticate" | "logout" | (string & {});
};

export type AuthProviderProps = {
	children: React.ReactNode;
	sessionExpiration?: string;
	clientId: string;
	accessType?: string;
};

export type AuthState = {
	isLoading: boolean;
	isAuthenticated: boolean;
	logoutReason?: string;
	userId?: string;
	idTokenClaims?: any;
};

export type AuthContextProps = {
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	getAccessToken: () => string;
} & AuthState;
