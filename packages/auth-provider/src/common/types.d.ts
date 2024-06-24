export type ServiceCallProps = {
	params: any;
};

export type AuthProviderProps = {
	children: React.ReactNode;
	sessionExpiration?: string;
	clientId: string;
	accessType?: string;
};

export type AuthState = {
	isAuthenticated: boolean;
	logoutReason?: string;
	userId?: string;
};

export type AuthContextProps = {
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	getIdTokenClaims: () => Promise<any>;
} & AuthState;
