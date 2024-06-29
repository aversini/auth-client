import { decodeJwt, importSPKI, jwtVerify } from "jose";
import { JWT, JWT_PUBLIC_KEY } from "./constants";

export const verifyAndExtractToken = async (token: string) => {
	try {
		const alg = JWT.ALG;
		const spki = JWT_PUBLIC_KEY;
		const publicKey = await importSPKI(spki, alg);
		return await jwtVerify(token, publicKey, {
			issuer: JWT.ISSUER,
		});
	} catch (_error) {
		return undefined;
	}
};

export const decodeToken = (token: string) => {
	try {
		return decodeJwt(token);
	} catch (_error) {
		return undefined;
	}
};
