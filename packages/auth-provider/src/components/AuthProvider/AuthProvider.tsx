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
	getPreAuthCode,
	graphQLCall,
	logoutUser,
} from "../../common/utilities";
import { AuthContext } from "./AuthContext";
import { InternalContext } from "./InternalContext";
import { reducer } from "./reducer";

export const AuthProvider = ({
	children,
	sessionExpiration,
	clientId,
	domain = "",
}: AuthProviderProps) => {
	const [state, dispatch] = useReducer(reducer, {
		isLoading: true,
		isAuthenticated: false,
		user: undefined,
		logoutReason: "",
	});

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

	const removeStateAndLocalStorage = useCallback(
		(logoutReason?: string) => {
			console.warn(logoutReason);
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
		[removeAccessToken, removeIdToken, removeNonce, removeRefreshToken],
	);

	const invalidateAndLogout = useCallback(
		async (message: string) => {
			const { user } = state;
			await logoutUser({
				userId: user?.userId || "",
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
		],
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
						dispatch({
							type: ACTION_TYPE_LOGIN,
							payload: {
								user: {
									userId: jwt.payload[JWT.USER_ID_KEY] as string,
									username: jwt.payload[JWT.USERNAME_KEY] as string,
								},
							},
						});
					} else {
						await invalidateAndLogout(EXPIRED_SESSION);
					}
				} catch (_error) {
					await invalidateAndLogout(EXPIRED_SESSION);
				}
			})();
		} else {
			dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: false } });
		}
		return () => {
			effectDidRunRef.current = true;
		};
	}, [state.isLoading, idToken, invalidateAndLogout]);

	const login: LoginType = async (username, password, type) => {
		const _nonce = uuidv4();
		setNonce(_nonce);
		dispatch({ type: ACTION_TYPE_LOADING, payload: { isLoading: true } });
		removeIdToken();
		removeAccessToken();
		removeRefreshToken();

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
				});
				if (response.status) {
					setIdToken(response.idToken);
					setAccessToken(response.accessToken);
					setRefreshToken(response.refreshToken);
					dispatch({
						type: ACTION_TYPE_LOGIN,
						payload: {
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
		});
		if (response.status) {
			setIdToken(response.idToken);
			setAccessToken(response.accessToken);
			setRefreshToken(response.refreshToken);
			dispatch({
				type: ACTION_TYPE_LOGIN,
				payload: {
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
					const jwtAccess = await verifyAndExtractToken(accessToken);
					if (jwtAccess && jwtAccess.payload[JWT.USER_ID_KEY] !== "") {
						return accessToken;
					}
				}
				/**
				 * accessToken is not valid, so we need to try to refresh it using the
				 * refreshToken - this is a silent refresh.
				 */
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
				await invalidateAndLogout(ACCESS_TOKEN_ERROR);
				return "";
			}
			await invalidateAndLogout(ACCESS_TOKEN_ERROR);
			return "";
		} catch (_error) {
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
		console.info("get registration options response", { response });
		if (response.status) {
			try {
				const registration = await startRegistration(response.data);
				console.info("registration", { registration });
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
				console.info("verify registration response", { response });
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

		const temporaryAnonymousUserId = uuidv4();
		console.info(`==> [${Date.now()}] : `, "Login with passkey");
		let response = await graphQLCall({
			accessToken,
			clientId,
			type: SERVICE_TYPES.GET_AUTHENTICATION_OPTIONS,
			params: {
				id: temporaryAnonymousUserId,
				clientId,
			},
		});
		console.info("get authentication options response", { response });
		if (response.status) {
			try {
				const authentication = await startAuthentication(response.data);
				console.info("authentication: ", { authentication });
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
					},
				});
				console.info("verify authentication response", { response });

				if (response.data.status === "success") {
					setIdToken(response.data.idToken);
					setAccessToken(response.data.accessToken);
					setRefreshToken(response.data.refreshToken);
					dispatch({
						type: ACTION_TYPE_LOGIN,
						payload: {
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
