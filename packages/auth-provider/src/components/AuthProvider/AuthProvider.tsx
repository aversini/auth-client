import { JWT, verifyAndExtractToken } from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
	EXPIRED_SESSION,
	LOCAL_STORAGE_PREFIX,
	LOGIN_ERROR,
	LOGOUT_SESSION,
} from "../../common/constants";
import type { AuthProviderProps, AuthState } from "../../common/types";
import { authenticateUser, logoutUser } from "../../common/utilities";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
}: AuthProviderProps) => {
	const [idToken, setIdToken, , removeIdToken] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@user@@`,
	});
	const [accessToken, setAccessToken, , removeAccessToken] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@access@@`,
	});
	const [, setNonce, , removeNonce] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@nonce@@`,
	});

	const [authState, setAuthState] = useState<AuthState>({
		isLoading: true,
		isAuthenticated: false,
		logoutReason: "",
		userId: "",
		idTokenClaims: null,
	});

	const removeStateAndLocalStorage = useCallback(
		(logoutReason?: string) => {
			setAuthState({
				isLoading: false,
				isAuthenticated: false,
				logoutReason: logoutReason || EXPIRED_SESSION,
				userId: "",
				idTokenClaims: null,
			});
			removeIdToken();
			removeAccessToken();
			removeNonce();
		},
		[removeIdToken, removeAccessToken, removeNonce],
	);

	/**
	 * This effect is responsible to set the authentication state based on the
	 * idToken stored in the local storage. It is used when the page is being
	 * first loaded or refreshed.
	 * NOTE: we are extending the state with the idTokenClaims to store the
	 * idToken "string" and other claims in the state.
	 */
	useEffect(() => {
		if (authState.isLoading && idToken !== null) {
			(async () => {
				try {
					const jwt = await verifyAndExtractToken(idToken);
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
						removeStateAndLocalStorage(EXPIRED_SESSION);
						await logoutUser({
							idToken: idToken,
							accessToken: accessToken,
							clientId: clientId,
						});
					}
				} catch (_error) {
					removeStateAndLocalStorage(EXPIRED_SESSION);
					await logoutUser({
						idToken: idToken,
						accessToken: accessToken,
						clientId: clientId,
					});
				}
			})();
		}
	}, [
		authState.isLoading,
		accessToken,
		idToken,
		clientId,
		removeStateAndLocalStorage,
	]);

	const login = async (
		username: string,
		password: string,
	): Promise<boolean> => {
		const _nonce = uuidv4();
		setNonce(_nonce);
		const response = await authenticateUser({
			username,
			password,
			clientId,
			sessionExpiration,
			nonce: _nonce,
		});
		if (response.status) {
			setIdToken(response.idToken);
			setAccessToken(response.accessToken);
			setAuthState({
				isLoading: false,
				isAuthenticated: true,
				userId: response.userId,
			});
			return true;
		}
		removeStateAndLocalStorage(LOGIN_ERROR);
		return false;
	};

	const logout = async () => {
		removeStateAndLocalStorage(LOGOUT_SESSION);
		await logoutUser({
			idToken: idToken,
			accessToken: accessToken,
			clientId: clientId,
		});
	};

	const getAccessToken = () => {
		if (authState.isAuthenticated && accessToken) {
			return accessToken;
		}
	};

	const getIdToken = () => {
		if (authState.isAuthenticated && idToken) {
			return idToken;
		}
	};

	return (
		<AuthContext.Provider
			value={{ ...authState, login, logout, getAccessToken, getIdToken }}
		>
			{children}
		</AuthContext.Provider>
	);
};
