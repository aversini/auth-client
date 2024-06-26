import { AUTH_TYPES, useAuth } from "@versini/auth-provider";
import { Button, Footer, Header, Main } from "@versini/ui-components";
import { Flexgrid, FlexgridItem } from "@versini/ui-system";
import { useEffect, useRef, useState } from "react";

export const App = ({ timeout }: { timeout: string }) => {
	const accessTokenRef = useRef("");
	const { login, logout, isAuthenticated, getAccessToken } = useAuth();
	const [apiResponse, setApiResponse] = useState({ data: "" });

	const handleValidLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const response = await login(
			process.env.PUBLIC_TEST_USER as string,
			process.env.PUBLIC_TEST_USER_PASSWORD as string,
			AUTH_TYPES.CODE,
		);
		if (!response) {
			console.error(`==> [${Date.now()}] : `, "Login failed");
		} else {
			console.info(`==> [${Date.now()}] : `, "Login successful");
			console.info(`==> [${Date.now()}] : `, response);
		}
	};

	const handleInvalidLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const response = await login(
			process.env.PUBLIC_TEST_USER as string,
			"invalid-password",
		);
		if (!response) {
			console.error(`==> [${Date.now()}] : `, "Login failed");
		} else {
			console.info(`==> [${Date.now()}] : `, "Login successful");
			console.info(`==> [${Date.now()}] : `, response);
		}
	};

	const handleValidAPICall = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const response = await fetch(
			"https://api.gizmette.local.com:3004/getData",
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${await getAccessToken()}`,
				},
			},
		);
		const data = await response.json();
		setApiResponse(data);
	};

	useEffect(() => {
		if (isAuthenticated) {
			(async () => {
				accessTokenRef.current = await getAccessToken();
			})();
		}
		accessTokenRef.current = "";
	}, [getAccessToken, isAuthenticated]);

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
							size="small"
							onClick={handleInvalidLogin}
							disabled={isAuthenticated}
						>
							Login (invalid)
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
				<pre className="text-xs">{accessTokenRef.current}</pre>
			</Main>
			<Footer row1={<p>Timeout: {timeout}</p>} />
		</div>
	);
};
