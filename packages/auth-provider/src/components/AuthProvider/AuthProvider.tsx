import {
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";
import {
	AUTH_TYPES,
	JWT,
	pkceChallengePair,
	verifyAndExtractToken,
} from "@versini/auth-common";
import { useLocalStorage } from "@versini/ui-hooks";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { TokenManager } from "../../common/TokenManager";
import {
	ACCESS_TOKEN_ERROR,
	ACTION_TYPE_LOADING,
	ACTION_TYPE_LOGIN,
	ACTION_TYPE_LOGOUT,
	EXPIRED_SESSION,
	LOCAL_STORAGE_PREFIX,
	LOGIN_ERROR,
	LOGOUT_SESSION,
	STATUS_SUCCESS,
} from "../../common/constants";
import { SERVICE_TYPES, graphQLCall } from "../../common/services";
import type { AuthProviderProps, LoginProps } from "../../common/types";
import {
	emptyState,
	getPreAuthCode,
	getUserIdFromToken,
	loginUser,
	logoutUser,
} from "../../common/utilities";
import { useLogger } from "../hooks/useLogger";
import { AuthContext } from "./AuthContext";
import { InternalContext } from "./InternalContext";
import { reducer } from "./reducer";

/**
 * AuthProvider component properties.
 *
 * @param children - The children of the component.
 * @param sessionExpiration - The session expiration time.
 * @param clientId - The client ID.
 * @param domain - The domain.
 * @param debug - The debug flag.
 */
export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
	domain = "",
	debug = false,
}: AuthProviderProps) => {
	const [state, dispatch] = useReducer(reducer, {
		...emptyState,
		debug,
	});

	const logger = useLogger(debug);
	const effectDidRunRef = useRef(false);

	const [idToken, setIdToken, , removeIdToken] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@user@@`,
	});
	const [accessToken, setAccessToken, , removeAccessToken] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@access@@`,
	});
	const [refreshToken, setRefreshToken, , removeRefreshToken] = useLocalStorage(
		{
			key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@refresh@@`,
		},
	);
	const [nonce, setNonce, , removeNonce] = useLocalStorage({
		key: `${LOCAL_STORAGE_PREFIX}::${clientId}::@@nonce@@`,
	});

	const tokenManager = new TokenManager(accessToken, refreshToken);

	/**
	 * This function is responsible to remove all the tokens from the local storage.
	 * It is used when the user logs out or when the tokens are invalid.
	 *
	 * @returns void
	 */
	const removeLocalStorage = useCallback(() => {
		logger("removeLocalStorage: removing local storage");
		removeIdToken();
		removeAccessToken();
		removeRefreshToken();
		removeNonce();
	}, [
		removeAccessToken,
		removeIdToken,
		removeNonce,
		removeRefreshToken,
		logger,
	]);

	/**
	 * This function is responsible to remove all the tokens from the local storage
	 * and clean up the state.
	 * It is used when the user logs out or when the tokens are invalid.
	 *
	 * @param logoutReason string
	 * @returns void
	 */
	const removeStateAndLocalStorage = useCallback(
		(logoutReason?: string) => {
			logger(
				"removeStateAndLocalStorage: removing state and local storage with reason: ",
				logoutReason,
			);
			dispatch({
				type: ACTION_TYPE_LOGOUT,
				payload: {
					logoutReason: logoutReason || EXPIRED_SESSION,
				},
			});
			removeLocalStorage();
			dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: false } });
		},
		[removeLocalStorage, logger],
	);

	/**
	 * This function is responsible to invalidate the tokens and log the user out.
	 * It is used when the tokens are invalid or when the user needs to be logged out.
	 *
	 * @param message string
	 * @returns void
	 */
	const invalidateAndLogout = useCallback(
		async (message: string) => {
			logger("invalidateAndLogout: invalidating and logging out");
			const { user } = state;
			const userId = user?.userId || getUserIdFromToken(idToken);
			if (!userId) {
				logger(
					"invalidateAndLogout: user cannot be identified, logging out without userId",
				);
			}
			await logoutUser({
				userId,
				clientId,
				domain,
				idToken,
			});
			removeStateAndLocalStorage(message || EXPIRED_SESSION);
		},
		[idToken, state, clientId, domain, removeStateAndLocalStorage, logger],
	);

	/**
	 * This effect is responsible to set the authentication state based on the
	 * idToken stored in the local storage. It is used when the page is being
	 * first loaded or refreshed.
	 */
	useEffect(() => {
		if (effectDidRunRef.current) {
			return;
		}
		if (state.isLoading && idToken !== null) {
			(async () => {
				try {
					const jwt = await verifyAndExtractToken(idToken);
					if (jwt && jwt.payload[JWT.USER_ID_KEY] !== "") {
						logger("useEffect: setting the authentication state");
						dispatch({
							type: ACTION_TYPE_LOGIN,
							payload: {
								authenticationType: jwt.payload[JWT.AUTH_TYPE_KEY] as string,
								user: {
									userId: jwt.payload[JWT.USER_ID_KEY] as string,
									username: jwt.payload[JWT.USERNAME_KEY] as string,
								},
							},
						});
					} else {
						logger("useEffect: invalid JWT, invalidating and logging out");
						await invalidateAndLogout(EXPIRED_SESSION);
					}
				} catch (_error) {
					logger(
						"useEffect: exception validating JWT, invalidating and logging out",
					);
					await invalidateAndLogout(EXPIRED_SESSION);
				}
			})();
		} else {
			logger("useEffect: setting the loading state to false");
			dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: false } });
		}
		return () => {
			effectDidRunRef.current = true;
		};
	}, [state.isLoading, idToken, invalidateAndLogout, logger]);

	/**
	 * Asynchronous function for user login.
	 *
	 * @async
	 * @param username - The username of the user logging in.
	 * @param password - The password of the user logging in.
	 * @param type - The type of authentication being used.
	 *
	 * @returns {Promise<boolean>} A promise that resolves with the login response.
	 */
	const login: LoginProps = async (username, password): Promise<boolean> => {
		dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: true } });
		removeLocalStorage();

		const _nonce = uuidv4();
		setNonce(_nonce);

		logger("login: Logging in with password");

		const { code_verifier, code_challenge } = await pkceChallengePair();
		const preResponse = await getPreAuthCode({
			nonce: _nonce,
			clientId,
			code_challenge,
		});
		if (preResponse.status) {
			// we received the auth code, now we need to exchange it for the tokens
			const response = await loginUser({
				username,
				password,
				clientId,
				sessionExpiration,
				nonce: _nonce,
				type: AUTH_TYPES.CODE,
				code: preResponse.data,
				code_verifier,
				domain,
				ua: navigator.userAgent,
			});
			if (response.status) {
				setIdToken(response.idToken);
				setAccessToken(response.accessToken);
				setRefreshToken(response.refreshToken);
				dispatch({
					type: ACTION_TYPE_LOGIN,
					payload: {
						authenticationType: AUTH_TYPES.CODE,
						user: {
							userId: response.userId as string,
							username,
						},
					},
				});
				return true;
			}
			removeStateAndLocalStorage(LOGIN_ERROR);
			return false;
		}
		return false;
	};

	/**
	 * Asynchronous function for user logout.
	 *
	 * @async
	 * @param e - The event object.
	 *
	 * @returns {Promise<void>} A promise that resolves when the user is logged out.
	 */
	const logout = async (e: any): Promise<void> => {
		e?.preventDefault();
		await invalidateAndLogout(LOGOUT_SESSION);
	};

	/**
	 * Asynchronous function to get the access token.
	 *
	 * @async
	 * @returns {Promise<string>} A promise that resolves with the access token
	 * or an empty string if the token is invalid.
	 */
	const getAccessToken = async (): Promise<string> => {
		const { isAuthenticated, user } = state;
		try {
			if (isAuthenticated && user && user.userId) {
				if (accessToken) {
					logger("getAccessToken");
					const jwtAccess = await verifyAndExtractToken(accessToken);
					if (jwtAccess && jwtAccess.payload[JWT.USER_ID_KEY] !== "") {
						return accessToken;
					}
				}
				/**
				 * accessToken is not valid, so we need to try to refresh it using the
				 * refreshToken - this is a silent refresh.
				 */
				logger("getAccessToken: invalid access token, trying to refresh it");
				const res = await tokenManager.refreshtoken({
					clientId,
					userId: user.userId as string,
					nonce,
					domain,
				});
				if (res.status && res.status === "success" && res.newAccessToken) {
					setAccessToken(res.newAccessToken);
					setRefreshToken(res.newRefreshToken);
					return res.newAccessToken;
				}
				logger(
					"getAccessToken: invalid refresh token, need to re-authenticate",
				);
				await invalidateAndLogout(EXPIRED_SESSION);
				return "";
			}
			logger(
				"getAccessToken: user is not authenticated, cannot get access token",
			);
			await invalidateAndLogout(EXPIRED_SESSION);
			return "";
		} catch (_error) {
			logger(
				"getAccessToken: exception occurred, invalidating and logging out",
			);
			await invalidateAndLogout(ACCESS_TOKEN_ERROR);
			return "";
		}
	};

	/**
	 * Function to get the id token.
	 *
	 * @returns {string} The id token or an empty string if the token is invalid.
	 */
	const getIdToken = (): string => {
		if (state.isAuthenticated && idToken) {
			return idToken;
		}
		return "";
	};

	/**
	 * Asynchronous function to register an existing and authenticated
	 * user with a passkey.
	 *
	 * @async
	 * @returns {Promise<boolean>} A promise that resolves with a boolean value.
	 */
	const registeringForPasskey = async (): Promise<boolean> => {
		const { user } = state;
		let response = await graphQLCall({
			accessToken,
			clientId,
			type: SERVICE_TYPES.GET_REGISTRATION_OPTIONS,
			params: {
				clientId,
				id: user?.userId,
				username: user?.username,
			},
		});
		if (response.status) {
			try {
				const registration = await startRegistration(response.data);
				response = await graphQLCall({
					accessToken,
					clientId,
					type: SERVICE_TYPES.VERIFY_REGISTRATION,
					params: {
						clientId,
						id: user?.userId,
						username: user?.username,
						registration,
					},
				});
				if (response.status && response.data.length > 0) {
					return true;
				}
				return false;
			} catch (_error) {
				await graphQLCall({
					accessToken,
					clientId,
					type: SERVICE_TYPES.VERIFY_REGISTRATION,
					params: {
						clientId,
						id: user?.userId,
						username: user?.username,
						registration: {},
					},
				});
				return false;
			}
		}
		return false;
	};

	/**
	 * Asynchronous function to login with a passkey.
	 * @async
	 * @returns {Promise<boolean>} A promise that resolves with a boolean value.
	 */
	const loginWithPasskey = async (): Promise<boolean> => {
		dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: true } });
		removeLocalStorage();

		const _nonce = uuidv4();
		setNonce(_nonce);

		logger("loginWithPasskey");

		const temporaryAnonymousUserId = uuidv4();
		let response = await graphQLCall({
			accessToken,
			clientId,
			type: SERVICE_TYPES.GET_AUTHENTICATION_OPTIONS,
			params: {
				id: temporaryAnonymousUserId,
				clientId,
			},
		});
		if (response.status) {
			try {
				const authentication = await startAuthentication(response.data);
				response = await graphQLCall({
					accessToken,
					clientId,
					type: SERVICE_TYPES.VERIFY_AUTHENTICATION,
					params: {
						clientId,
						id: temporaryAnonymousUserId,
						authentication,
						nonce: _nonce,
						domain,
						sessionExpiration,
						ua: navigator.userAgent,
					},
				});

				if (response.data.status === STATUS_SUCCESS) {
					setIdToken(response.data.idToken);
					setAccessToken(response.data.accessToken);
					setRefreshToken(response.data.refreshToken);
					dispatch({
						type: ACTION_TYPE_LOGIN,
						payload: {
							authenticationType: AUTH_TYPES.PASSKEY,
							user: {
								userId: response.data.userId as string,
								username: response.data.username as string,
							},
						},
					});
					return true;
				}
				removeStateAndLocalStorage(LOGIN_ERROR);
				return false;
			} catch (_error) {
				await graphQLCall({
					accessToken,
					clientId,
					type: SERVICE_TYPES.VERIFY_AUTHENTICATION,
					params: {
						clientId,
						id: temporaryAnonymousUserId,
						authentication: {},
						nonce: _nonce,
						domain,
						sessionExpiration,
					},
				});
				removeStateAndLocalStorage(LOGIN_ERROR);
				return false;
			}
		}
		return false;
	};

	return (
		<InternalContext.Provider value={{ state, dispatch }}>
			<AuthContext.Provider
				value={{
					...state,
					login,
					logout,
					getAccessToken,
					getIdToken,
					registeringForPasskey,
					loginWithPasskey,
				}}
			>
				{children}
			</AuthContext.Provider>
		</InternalContext.Provider>
	);
};
