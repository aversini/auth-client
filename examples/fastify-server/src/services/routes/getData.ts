import { getToken, isGranted } from "@versini/auth-common";
import { CLIENT_ID } from "../../common/utilities.js";

export const getData = async (_request: any, reply: any) => {
	const token = getToken({
		headers: _request.headers,
		clientId: CLIENT_ID,
	});

	if (await isGranted(token, ["shortcuts:read"])) {
		return reply.send({
			data: "This is a test",
		});
	}
	reply.send({
		data: "Not allowed",
	});
};
