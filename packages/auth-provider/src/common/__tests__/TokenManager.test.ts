import { JWT, verifyAndExtractToken } from "@versini/auth-common";
import { TokenManager } from "../TokenManager";
import { getAccessTokenSilently } from "../utilities";

// Mock dependencies
vi.mock("@versini/auth-common", () => ({
	verifyAndExtractToken: vi.fn(),
	JWT: {
		USER_ID_KEY: "userId",
	},
}));

vi.mock("../utilities", () => ({
	getAccessTokenSilently: vi.fn(),
}));

describe("TokenManager", () => {
	let tokenManager: TokenManager;

	beforeEach(() => {
		tokenManager = new TokenManager(
			"initialAccessToken",
			"initialRefreshToken",
		);
		(verifyAndExtractToken as any).mockReset();
		(getAccessTokenSilently as any).mockReset();
	});

	it("should initialize with provided tokens", () => {
		const manager = new TokenManager("accessToken", "refreshToken");
		expect(manager["accessToken"]).toBe("accessToken");
		expect(manager["refreshToken"]).toBe("refreshToken");
	});

	it("should initialize with empty tokens if none are provided", () => {
		const manager = new TokenManager();
		expect(manager["accessToken"]).toBe("");
		expect(manager["refreshToken"]).toBe("");
	});

	it("should refresh token if refreshToken is valid", async () => {
		(verifyAndExtractToken as any).mockResolvedValue({
			payload: { [JWT.USER_ID_KEY]: "user123" },
		});

		(getAccessTokenSilently as any).mockResolvedValue({
			status: true,
			accessToken: "newAccessToken",
			refreshToken: "newRefreshToken",
		});

		const response = await tokenManager.refreshtoken({
			clientId: "clientId",
			userId: "userId",
			nonce: "nonce",
			domain: "domain",
		});

		expect(response).toEqual({
			status: "success",
			newAccessToken: "newAccessToken",
			newRefreshToken: "newRefreshToken",
		});
		expect(tokenManager["accessToken"]).toBe("newAccessToken");
		expect(tokenManager["refreshToken"]).toBe("newRefreshToken");
	});

	it("should fail to refresh token if refreshToken is invalid", async () => {
		(verifyAndExtractToken as any).mockResolvedValue(null);

		const response = await tokenManager.refreshtoken({
			clientId: "clientId",
			userId: "userId",
			nonce: "nonce",
			domain: "domain",
		});

		expect(response).toEqual({
			status: "failure",
		});
	});

	it("should fail to refresh token if getAccessTokenSilently fails", async () => {
		(verifyAndExtractToken as any).mockResolvedValue({
			payload: { [JWT.USER_ID_KEY]: "user123" },
		});
		(getAccessTokenSilently as any).mockResolvedValue({
			status: false,
		});

		const response = await tokenManager.refreshtoken({
			clientId: "clientId",
			userId: "userId",
			nonce: "nonce",
			domain: "domain",
		});

		expect(response).toEqual({
			status: "failure",
		});
	});

	it("should only perform one refresh at a time", async () => {
		(verifyAndExtractToken as any).mockResolvedValue({
			payload: { [JWT.USER_ID_KEY]: "user123" },
		});

		(getAccessTokenSilently as any).mockResolvedValue({
			status: true,
			accessToken: "newAccessToken",
			refreshToken: "newRefreshToken",
		});

		const refreshPromise1 = tokenManager.refreshtoken({
			clientId: "clientId",
			userId: "userId",
			nonce: "nonce",
			domain: "domain",
		});

		const refreshPromise2 = tokenManager.refreshtoken({
			clientId: "clientId",
			userId: "userId",
			nonce: "nonce",
			domain: "domain",
		});

		const [response1, response2] = await Promise.all([
			refreshPromise1,
			refreshPromise2,
		]);

		expect(response1).toEqual(response2);
		expect(getAccessTokenSilently).toHaveBeenCalledTimes(1);
	});
});
