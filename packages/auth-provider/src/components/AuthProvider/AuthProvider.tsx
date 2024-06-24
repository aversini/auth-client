import { JWT } from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import { useEffect, useState } from "react";

import {
	EXPIRED_SESSION,
	LOCAL_STORAGE_PREFIX,
	LOGOUT_SESSION,
} from "../../common/constants";
import type { AuthProviderProps, AuthState } from "../../common/types";
import {
	authenticateUser,
	verifyAndExtractToken,
} from "../../common/utilities";
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
		isAuthenticated: Boolean(idToken),
		logoutReason: "",
		userId: "",
	});

	const previousIdToken = usePrevious(idToken) || "";

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
							isAuthenticated: true,
							logoutReason: "",
							userId: jwt.payload[JWT.USER_ID_KEY] as string,
						});
					} else {
						setAuthState({
							isAuthenticated: false,
							logoutReason: EXPIRED_SESSION,
							userId: "",
						});
					}
				} catch (_error) {
					setAuthState({
						isAuthenticated: false,
						logoutReason: EXPIRED_SESSION,
						userId: "",
					});
				}
			})();
		}
	}, [idToken, previousIdToken, clientId]);

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
				isAuthenticated: true,
				userId: response.userId,
			});
			return true;
		}
		return false;
	};

	const logout = () => {
		setAuthState({
			isAuthenticated: false,
			logoutReason: LOGOUT_SESSION,
			userId: "",
		});
		removeIdToken();
	};

	return (
		<AuthContext.Provider value={{ ...authState, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
