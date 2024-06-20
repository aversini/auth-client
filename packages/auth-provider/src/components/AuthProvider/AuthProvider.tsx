import { AUTH_TYPES } from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import * as jose from "jose";
import { useEffect, useState } from "react";

import { EXPIRED_SESSION } from "../../common/constants";
import type { AuthProviderProps, AuthState } from "../../common/types";
import { serviceCall } from "../../common/utilities";
import { usePrevious } from "../hooks/usePrevious";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
	accessType,
}: AuthProviderProps) => {
	const [accessToken, setAccessToken, removeAccessToken] = useLocalStorage(
		`@@auth@@::${clientId}::@@access@@`,
		"",
	);
	const [refreshToken, setRefreshToken, removeRefreshToken] = useLocalStorage(
		`@@auth@@::${clientId}::@@refresh@@`,
		"",
	);
	const [idToken, setIdToken, removeIdToken] = useLocalStorage(
		`@@auth@@::${clientId}::@@user@@`,
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
			setAuthState({
				isAuthenticated: true,
				accessToken,
				refreshToken,
				idToken,
				logoutReason: "",
				userId: authState.userId,
			});
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
	}, [accessToken, refreshToken, idToken, previousIdToken, authState.userId]);

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
			const { _id }: { _id: string } = jose.decodeJwt(response.data.idToken);
			if (_id) {
				setIdToken(response.data.idToken);
				response.data.accessToken && setAccessToken(response.data.accessToken);
				response.data.refreshToken &&
					setRefreshToken(response.data.refreshToken);
				setAuthState({
					isAuthenticated: true,
					idToken: response.data.idToken,
					accessToken: response.data.accessToken,
					refreshToken: response.data.refreshToken,
					userId: _id,
					logoutReason: "",
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
