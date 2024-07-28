import { useAuth } from "@versini/auth-provider";
import { Button, Footer, Header, Main } from "@versini/ui-components";
import { Flexgrid, FlexgridItem } from "@versini/ui-system";
import { useEffect, useState } from "react";

export const App = ({ timeout }: { timeout: string }) => {
	const [accessToken, setAccessToken] = useState("");
	const {
		login,
		logout,
		isAuthenticated,
		getAccessToken,
		registeringForPasskey,
		loginWithPasskey,
	} = useAuth();
	const [apiResponse, setApiResponse] = useState({ data: "" });

	const handleValidLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const res = await login(
			process.env.PUBLIC_TEST_USER as string,
			process.env.PUBLIC_TEST_USER_PASSWORD as string,
		);
		console.info("Login response: ", res);
	};

	const handleInvalidLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const res = await login(
			process.env.PUBLIC_TEST_USER as string,
			"invalid-password",
		);
		console.info("Login response: ", res);
	};

	const handleValidAPICall = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const response = await fetch(
			"https://api.gizmette.local.com:3004/getData",
			{
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${await getAccessToken()}`,
				},
			},
		);
		const data = await response.json();
		setApiResponse(data);
	};

	const handleClickOnGetAccessToken = async (e: {
		preventDefault: () => void;
	}) => {
		e.preventDefault();
		const token = await getAccessToken();
		setAccessToken(token);
	};

	const handleValidRegistration = async (e: {
		preventDefault: () => void;
	}) => {
		e.preventDefault();
		const res = await registeringForPasskey();
		console.info("Registering response: ", res);
	};

	const handleValidLoginWithPasskey = async (e: {
		preventDefault: () => void;
	}) => {
		e.preventDefault();
		const res = await loginWithPasskey();
		console.info("Login with passkey response: ", res);
	};

	/**
	 * Fade out the logo and fade in the app.
	 */
	useEffect(() => {
		document.getElementById("logo")?.classList.add("fadeOut");
		setTimeout(() => {
			document
				.getElementById("root")
				?.classList.replace("app-hidden", "fadeIn");
		}, 500);
	});

	return (
		<div className="prose prose-dark dark:prose-lighter">
			<Header>
				<h1>Code Flow</h1>
			</Header>
			<Main>
				<h2>Authentication Actions</h2>
				<Flexgrid rowGap={2} direction="column">
					<FlexgridItem>
						<Button
							size="small"
							spacing={{ r: 2 }}
							onClick={handleValidLogin}
							disabled={isAuthenticated}
						>
							Login (valid)
						</Button>
						<Button
							spacing={{ r: 2 }}
							size="small"
							onClick={handleInvalidLogin}
							disabled={isAuthenticated}
						>
							Login (invalid)
						</Button>
						<Button
							spacing={{ r: 2 }}
							size="small"
							onClick={handleValidRegistration}
							disabled={!isAuthenticated}
						>
							Register for Passkey (valid)
						</Button>
						<Button
							size="small"
							onClick={handleValidLoginWithPasskey}
							disabled={isAuthenticated}
						>
							Login with Passkey (valid)
						</Button>
					</FlexgridItem>
					<FlexgridItem>
						<Button
							size="small"
							onClick={logout}
							variant="danger"
							disabled={!isAuthenticated}
						>
							Logout
						</Button>
					</FlexgridItem>
				</Flexgrid>

				<h2>API Actions</h2>
				<Flexgrid rowGap={2} direction="column">
					<FlexgridItem>
						<Button
							size="small"
							spacing={{ r: 2 }}
							onClick={handleValidAPICall}
						>
							API call (valid)
						</Button>
					</FlexgridItem>
				</Flexgrid>

				<h2>API response</h2>
				<pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>

				<h2>State</h2>
				<pre className="text-xs">{JSON.stringify(useAuth(), null, 2)}</pre>

				<h2>Access Token</h2>

				<Button onClick={handleClickOnGetAccessToken}>get Access Token</Button>
				<pre className="text-xs">{accessToken}</pre>
			</Main>
			<Footer row1={<p>Timeout: {timeout}</p>} />
		</div>
	);
};
