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
} from "../../common/constants";
import type { AuthProviderProps, LoginType } from "../../common/types";
import {
	SERVICE_TYPES,
	authenticateUser,
	getCustomFingerprint,
	getPreAuthCode,
	getUserIdFromToken,
	graphQLCall,
	logoutUser,
} from "../../common/utilities";
import { useLogger } from "../hooks/useLogger";
import { AuthContext } from "./AuthContext";
import { InternalContext } from "./InternalContext";
import { reducer } from "./reducer";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
	domain = "",
	debug = false,
}: AuthProviderProps) => {
	const [state, dispatch] = useReducer(reducer, {
		isLoading: true,
		isAuthenticated: false,
		authenticationType: null,
		user: undefined,
		logoutReason: "",
		debug,
	});

	const logger = useLogger(debug);
	const effectDidRunRef = useRef(false);
	const fingerprintRef = useRef<string>("");

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
			removeIdToken();
			removeAccessToken();
			removeRefreshToken();
			removeNonce();
			dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: false } });
		},
		[removeAccessToken, removeIdToken, removeNonce, removeRefreshToken, logger],
	);

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
				idToken,
				accessToken,
				refreshToken,
				clientId,
				domain,
			});
			removeStateAndLocalStorage(message || EXPIRED_SESSION);
		},
		[
			accessToken,
			state,
			clientId,
			domain,
			idToken,
			refreshToken,
			removeStateAndLocalStorage,
			logger,
		],
	);

	/**
	 * This effect is responsible to set the fingerprintRef value when the
	 * component is first loaded.
	 */

	// biome-ignore lint/correctness/useExhaustiveDependencies: logger is stable
	useEffect(() => {
		(async () => {
			logger("useEffect: setting the fingerprint");
			fingerprintRef.current = await getCustomFingerprint();
		})();
		return () => {
			logger("useEffect: cleaning up the fingerprint");
			fingerprintRef.current = "";
		};
	}, []);

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

	const login: LoginType = async (username, password, type) => {
		const _nonce = uuidv4();
		setNonce(_nonce);
		dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: true } });
		removeIdToken();
		removeAccessToken();
		removeRefreshToken();

		logger("login: Logging in with type: ", type);

		if (type === AUTH_TYPES.CODE) {
			const { code_verifier, code_challenge } = await pkceChallengePair();
			const preResponse = await getPreAuthCode({
				nonce: _nonce,
				clientId,
				code_challenge,
			});
			if (preResponse.status) {
				// we received the auth code, now we need to exchange it for the tokens
				const response = await authenticateUser({
					username,
					password,
					clientId,
					sessionExpiration,
					nonce: _nonce,
					type,
					code: preResponse.code,
					code_verifier,
					domain,
					fingerprint: fingerprintRef.current,
				});
				if (response.status) {
					setIdToken(response.idToken);
					setAccessToken(response.accessToken);
					setRefreshToken(response.refreshToken);
					dispatch({
						type: ACTION_TYPE_LOGIN,
						payload: {
							authenticationType: type,
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
		}

		const response = await authenticateUser({
			username,
			password,
			clientId,
			sessionExpiration,
			nonce: _nonce,
			type,
			domain,
			fingerprint: fingerprintRef.current,
		});
		if (response.status) {
			setIdToken(response.idToken);
			setAccessToken(response.accessToken);
			setRefreshToken(response.refreshToken);
			dispatch({
				type: ACTION_TYPE_LOGIN,
				payload: {
					authenticationType: type as string,
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
	};

	const logout = async (e: any) => {
		e?.preventDefault();
		await invalidateAndLogout(LOGOUT_SESSION);
	};

	const getAccessToken = async () => {
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
				logger("getAccessToken: invalid access token, refreshing it");
				const res = await tokenManager.refreshtoken({
					clientId,
					userId: user.userId as string,
					nonce,
					domain,
				});
				if (res.status && res.status === "success") {
					setAccessToken(res.newAccessToken);
					setRefreshToken(res.newRefreshToken);
					return res.newAccessToken;
				}
				/**
				 * refreshToken is not valid, so we need to re-authenticate the user.
				 */
				logger("getAccessToken: invalid refresh token, re-authenticating user");
				await invalidateAndLogout(ACCESS_TOKEN_ERROR);
				return "";
			}
			logger(
				"getAccessToken: user is not authenticated, cannot get access token",
			);
			await invalidateAndLogout(ACCESS_TOKEN_ERROR);
			return "";
		} catch (_error) {
			logger(
				"getAccessToken: exception occurred, invalidating and logging out",
			);
			await invalidateAndLogout(ACCESS_TOKEN_ERROR);
			return "";
		}
	};

	const getIdToken = () => {
		if (state.isAuthenticated && idToken) {
			return idToken;
		}
	};

	const registeringForPasskey = async () => {
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
	};

	const loginWithPasskey = async () => {
		const _nonce = uuidv4();
		setNonce(_nonce);
		dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: true } });
		removeIdToken();
		removeAccessToken();
		removeRefreshToken();

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
						fingerprint: fingerprintRef.current,
					},
				});

				if (response.data.status === "success") {
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
					},
				});
				removeStateAndLocalStorage(LOGIN_ERROR);
				return false;
			}
		}
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
