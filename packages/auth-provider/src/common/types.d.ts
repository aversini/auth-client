export type ServiceCallProps = {
	params: any;
};

export type AuthState = {
	isAuthenticated: boolean;
	idToken: string;
	logoutReason: string;
	userId: string;
	accessToken?: string;
	refreshToken?: string;
};

export type AuthProviderProps = {
	children: React.ReactNode;
	sessionExpiration?: string;
	clientId: string;
	accessType?: string;
};

export type AuthContextProps = {
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
	accessToken?: string;
	refreshToken?: string;
	idToken?: string;
	logoutReason?: string;
};
