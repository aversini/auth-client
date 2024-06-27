import { LOGOUT_ERROR } from "../../common/constants.js";
import { logoutUserInDB } from "../db/authDB.js";

export const logout = async (request: any, reply: any) => {
	const { idToken, accessToken, clientId } = request.body as {
		idToken: string;
		accessToken: string;
		clientId: string;
	};

	const { status } = await logoutUserInDB({
		idToken,
		accessToken,
		clientId,
	});
	if (status === "error") {
		throw new Error(LOGOUT_ERROR);
	}

	reply.send({
		status: "success",
	});
};
