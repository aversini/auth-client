import { useCallback } from "react";

export const useLogger = (debug?: boolean) => {
	/**
	 * This hook is used to log messages to the console. It returns a function
	 * that can be used to log messages to the console, but it only logs
	 * messages if the `debug` flag is set to `true`.
	 */
	return useCallback(
		(...args: unknown[]) => {
			if (debug) {
				console.info(`==> [Auth ${Date.now()}]: `, ...args);
			}
		},
		[debug],
	);
};
