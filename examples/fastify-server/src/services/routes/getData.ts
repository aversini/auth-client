export const getData = async (_request: any, reply: any) => {
	reply.send({
		data: "This is a test",
	});
};
