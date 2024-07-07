import { decodeJwt, importSPKI, jwtVerify } from "jose";
import { decodeToken, verifyAndExtractToken } from "..";
import { JWT, JWT_PUBLIC_KEY } from "../constants";
vi.mock("jose");

describe("verifyAndExtractToken", () => {
	const token = "testToken";

	it("should verify and extract token successfully", async () => {
		const mockPublicKey = {};
		const mockJwtVerifyResult = {
			payload: "testPayload",
			protectedHeader: "testHeader",
		};
		// @ts-expect-error
		(importSPKI as vi.Mock).mockResolvedValue(mockPublicKey);
		// @ts-expect-error
		(jwtVerify as vi.Mock).mockResolvedValue(mockJwtVerifyResult);

		const result = await verifyAndExtractToken(token);

		expect(importSPKI).toHaveBeenCalledWith(JWT_PUBLIC_KEY, JWT.ALG);
		expect(jwtVerify).toHaveBeenCalledWith(token, mockPublicKey, {
			issuer: JWT.ISSUER,
		});
		expect(result).toEqual(mockJwtVerifyResult);
	});

	it("should return undefined on error", async () => {
		// @ts-expect-error
		(importSPKI as vi.Mock).mockRejectedValue(new Error("test error"));

		const result = await verifyAndExtractToken(token);

		expect(result).toBeUndefined();
	});
});

describe("decodeToken", () => {
	const token = "testToken";

	it("should decode token successfully", () => {
		const mockDecodeResult = { payload: "testPayload" };
		// @ts-expect-error
		(decodeJwt as vi.Mock).mockReturnValue(mockDecodeResult);

		const result = decodeToken(token);

		expect(decodeJwt).toHaveBeenCalledWith(token);
		expect(result).toEqual(mockDecodeResult);
	});

	it("should return undefined on error", () => {
		// @ts-expect-error
		(decodeJwt as vi.Mock).mockImplementation(() => {
			throw new Error("test error");
		});

		const result = decodeToken(token);

		expect(result).toBeUndefined();
	});
});
