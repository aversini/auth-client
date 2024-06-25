import { JWT, verifyAndExtractToken } from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import { useCallback, useEffect, useState } from "react";

import {
	EXPIRED_SESSION,
	LOCAL_STORAGE_PREFIX,
	LOGIN_ERROR,
	LOGOUT_SESSION,
} from "../../common/constants";
import type { AuthProviderProps, AuthState } from "../../common/types";
import { authenticateUser } from "../../common/utilities";
import { usePrevious } from "../hooks/usePrevious";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
}: AuthProviderProps) => {
	const [idToken, setIdToken, , removeIdToken] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@user@@`,
	});

	const [authState, setAuthState] = useState<AuthState>({
		isLoading: true,
		isAuthenticated: false,
		logoutReason: "",
		userId: "",
		idTokenClaims: null,
	});

	const previousIdToken = usePrevious(idToken) || "";

	const cleanupSession = useCallback(
		(logoutReason?: string) => {
			setAuthState({
				isLoading: false,
				isAuthenticated: false,
				logoutReason: logoutReason || EXPIRED_SESSION,
				userId: "",
				idTokenClaims: null,
			});
			removeIdToken();
		},
		[removeIdToken],
	);

	/**
	 * This effect is responsible to set the authentication state based on the
	 * idToken stored in the local storage. It is used when the page is being
	 * refreshed.
	 */
	useEffect(() => {
		if (previousIdToken !== idToken && idToken !== null) {
			(async () => {
				try {
					const jwt = await verifyAndExtractToken(idToken, clientId);
					if (jwt && jwt.payload[JWT.USER_ID_KEY] !== "") {
						setAuthState({
							isLoading: false,
							isAuthenticated: true,
							logoutReason: "",
							userId: jwt.payload[JWT.USER_ID_KEY] as string,
							idTokenClaims: {
								...jwt?.payload,
								[JWT.TOKEN_ID_KEY]: idToken,
							},
						});
					} else {
						cleanupSession(EXPIRED_SESSION);
					}
				} catch (_error) {
					cleanupSession(EXPIRED_SESSION);
				}
			})();
		}
	}, [idToken, previousIdToken, clientId, cleanupSession]);

	const login = async (
		username: string,
		password: string,
	): Promise<boolean> => {
		const response = await authenticateUser({
			username,
			password,
			clientId,
			sessionExpiration,
		});
		if (response.status) {
			setIdToken(response.idToken);
			setAuthState({
				isLoading: false,
				isAuthenticated: true,
				userId: response.userId,
			});
			return true;
		}
		cleanupSession(LOGIN_ERROR);
		return false;
	};

	const logout = () => {
		cleanupSession(LOGOUT_SESSION);
	};

	return (
		<AuthContext.Provider value={{ ...authState, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
