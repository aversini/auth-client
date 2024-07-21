import { importSPKI, jwtVerify } from "jose";
import { isGranted } from "..";
import { JWT, JWT_PUBLIC_KEY } from "../constants";
vi.mock("jose");

describe("isGranted", () => {
	const token = "testToken";

	it("should return false on error", async () => {
		// @ts-expect-error
		(importSPKI as vi.Mock).mockRejectedValue(new Error("test error"));

		const result = await isGranted(token, ["scope1"]);

		expect(result).toBe(false);
	});

	it("should verify that one scope is allowed", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["scope1", "scope2"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, ["scope1"]);

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(true);
	});

	it("should verify that 2 scopes are allowed", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["scope1", "scope2"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, ["scope1", "scope2"]);

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(true);
	});

	it("should verify that 1 scope is NOT allowed", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["scope1", "scope2"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, ["scope3"]);

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(false);
	});

	it("should verify that 1 allowed scope and 1 disallowed scope returns false", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["scope1", "scope2"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, ["scope1", "scope3"]);

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(false);
	});

	it("should verify that 1 or another scope is allowed", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["write"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, {
			user: ["read"],
			edit: ["write"],
		});

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(true);
	});

	it("should verify that 1 or another scope are not allowed", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: {
				scopes: ["write"],
			},
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await isGranted(token, {
			user: ["read"],
			admin: ["read", "write"],
		});

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toBe(false);
	});
});
