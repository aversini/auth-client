import { renderHook } from "@testing-library/react";
import { useLogger } from "../useLogger";

it("should log messages when debug is true", () => {
	const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
	const res = renderHook(() => useLogger(true));
	const logger = res.result.current;
	logger("Test message");
	expect(consoleSpy).toHaveBeenCalledWith(
		expect.stringContaining("==> [Auth"),
		"Test message",
	);
	consoleSpy.mockRestore();
});
