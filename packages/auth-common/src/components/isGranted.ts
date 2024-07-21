import { JWT } from "./constants";
import { verifyAndExtractToken } from "./verifyToken";

export const isGranted = async (
	token: string,
	scopes: string[],
): Promise<boolean> => {
	const jwt = await verifyAndExtractToken(token);

	if ((jwt && (jwt?.payload?.[JWT.SCOPES_KEY] as string[]))?.length) {
		const tokenScopes = jwt.payload[JWT.SCOPES_KEY] as string[];
		return scopes.every((scope) => tokenScopes.includes(scope));
	}
	return false;
};
