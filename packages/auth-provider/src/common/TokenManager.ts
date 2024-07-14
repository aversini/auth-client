import { JWT, verifyAndExtractToken } from "@versini/auth-common";
import { getAccessTokenSilently } from "./utilities";

type RefreshTokenResponse = {
	status: "success" | "failure";
	newAccessToken?: string;
	newRefreshToken?: string;
};
type RefreshTokenProps = {
	clientId: string;
	userId: string;
	nonce: string;
	domain: string;
};
export class TokenManager {
	private refreshTokenPromise: Promise<any> | null = null;
	private accessToken: string;
	private refreshToken: string;

	constructor(
		accessToken: string | null = null,
		refreshToken: string | null = null,
	) {
		this.accessToken = accessToken || "";
		this.refreshToken = refreshToken || "";
	}

	async refreshtoken({
		clientId,
		userId,
		nonce,
		domain,
	}: RefreshTokenProps): Promise<RefreshTokenResponse> {
		if (!this.refreshTokenPromise) {
			// No existing refresh in progress, start a new one
			this.refreshTokenPromise = this._refreshToken({
				clientId,
				userId,
				nonce,
				domain,
			});
		}

		try {
			// Wait for the existing refresh or start a new one
			return await this.refreshTokenPromise;
		} finally {
			// Clear the promise to allow subsequent calls
			this.refreshTokenPromise = null;
		}
	}

	private async _refreshToken({
		clientId,
		userId,
		nonce,
		domain,
	}: RefreshTokenProps): Promise<RefreshTokenResponse> {
		const jwtRefresh = await verifyAndExtractToken(this.refreshToken);
		if (jwtRefresh && jwtRefresh.payload[JWT.USER_ID_KEY] !== "") {
			// Refresh token is valid, refreshing access token...
			const response = await getAccessTokenSilently({
				clientId,
				userId,
				nonce,
				refreshToken: this.refreshToken,
				accessToken: this.accessToken,
				domain,
			});
			if (response.status) {
				this.accessToken = response.accessToken;
				this.refreshToken = response.refreshToken;
				return {
					status: "success",
					newAccessToken: response.accessToken,
					newRefreshToken: response.refreshToken,
				};
			} else {
				// Access token could not be refreshed, re-authenticate the user...
				return {
					status: "failure",
				};
			}
		} else {
			// Refresh token is not valid, re-authenticate the user...
			return {
				status: "failure",
			};
		}
	}
}