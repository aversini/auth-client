import { useLogger } from "../useLogger";

it("should log messages when debug is true", () => {
	const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
	const logger = useLogger(true);
	logger("Test message");
	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining("==> [Auth"),
		"Test message",
	);
	consoleSpy.mockRestore();
});
