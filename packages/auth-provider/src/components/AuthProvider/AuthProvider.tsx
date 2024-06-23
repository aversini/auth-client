import { AUTH_TYPES, JWT } from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import { useEffect, useState } from "react";

import { EXPIRED_SESSION, LOCAL_STORAGE_PREFIX } from "../../common/constants";
import type { AuthProviderProps, AuthState } from "../../common/types";
import { serviceCall, verifyAndExtractToken } from "../../common/utilities";
import { usePrevious } from "../hooks/usePrevious";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
	accessType,
}: AuthProviderProps) => {
	const [accessToken, setAccessToken, removeAccessToken] = useLocalStorage(
		`${LOCAL_STORAGE_PREFIX}::${clientId}::@@access@@`,
		"",
	);
	const [refreshToken, setRefreshToken, removeRefreshToken] = useLocalStorage(
		`${LOCAL_STORAGE_PREFIX}::${clientId}::@@refresh@@`,
		"",
	);
	const [idToken, setIdToken, removeIdToken] = useLocalStorage(
		`${LOCAL_STORAGE_PREFIX}::${clientId}::@@user@@`,
		"",
	);
	const [authState, setAuthState] = useState<AuthState>({
		isAuthenticated: !!idToken,
		accessToken,
		refreshToken,
		idToken,
		logoutReason: "",
		userId: "",
	});

	const previousIdToken = usePrevious(idToken) || "";

	useEffect(() => {
		if (previousIdToken !== idToken && idToken !== "") {
			(async () => {
				try {
					const jwt = await verifyAndExtractToken(idToken);
					if (jwt && jwt.payload[JWT.USER_ID_KEY] !== "") {
						setAuthState({
							isAuthenticated: true,
							accessToken,
							refreshToken,
							idToken,
							logoutReason: "",
							userId: jwt.payload[JWT.USER_ID_KEY] as string,
						});
					}
				} catch (_error) {
					setAuthState({
						isAuthenticated: false,
						accessToken: "",
						refreshToken: "",
						idToken: "",
						logoutReason: EXPIRED_SESSION,
						userId: "",
					});
				}
			})();
		} else if (previousIdToken !== idToken && idToken === "") {
			setAuthState({
				isAuthenticated: false,
				accessToken: "",
				refreshToken: "",
				idToken: "",
				logoutReason: EXPIRED_SESSION,
				userId: "",
			});
		}
	}, [accessToken, refreshToken, idToken, previousIdToken]);

	const login = async (username: string, password: string) => {
		const response = await serviceCall({
			params: {
				type: accessType || AUTH_TYPES.ID_TOKEN,
				username,
				password,
				sessionExpiration,
				clientId,
			},
		});

		try {
			const jwt = await verifyAndExtractToken(response.data.idToken);

			if (jwt && jwt.payload[JWT.USER_ID_KEY] !== "") {
				setIdToken(response.data.idToken);
				response.data.accessToken && setAccessToken(response.data.accessToken);
				response.data.refreshToken &&
					setRefreshToken(response.data.refreshToken);
				setAuthState({
					isAuthenticated: true,
					idToken: response.data.idToken,
					accessToken: response.data.accessToken,
					refreshToken: response.data.refreshToken,
					userId: jwt.payload[JWT.USER_ID_KEY] as string,
				});
				return true;
			}
			return false;
		} catch (_error) {
			return false;
		}
	};

	const logout = () => {
		removeAccessToken();
		removeRefreshToken();
		removeIdToken();
	};

	return (
		<AuthContext.Provider value={{ ...authState, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
