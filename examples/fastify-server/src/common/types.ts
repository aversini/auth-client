export type AuthTokenData = {
	accessToken?: string;
	accessTokenExpiresAt?: string;
	idToken?: string;
	idTokenExpiresAt?: string;
	// refreshToken: string;
	// refreshTokenExpiresAt: string;
};

export type AuthUserData = {
	clientId: string;
	id: string;
	active: boolean;
	username: string;
	email: string;
	hashedPassword: string;
	tokens: AuthTokenData[];
};

export type AuthClientData = {
	id: string;
	active: boolean;
	name: string;
	email: string;
	allowedOrigins: string[];
};

export type AuthData = {
	clients: AuthClientData[];
	users: AuthUserData[];
};

export type CorsOptions = {
	credentials: boolean;
	origin?: string;
};
