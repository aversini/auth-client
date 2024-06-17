import { renderHook } from "@testing-library/react";

import { useAuth } from "../..";

describe("useAuth tests", () => {
	it("should return isAuthenticated false", () => {
		const res1 = renderHook(() => useAuth());
		expect(res1.result.current.isAuthenticated).toBe(false);
	});
});
