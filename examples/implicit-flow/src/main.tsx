import { useAuth } from "@versini/auth-provider";
import { Button, Header, Main } from "@versini/ui-components";
import { Flexgrid, FlexgridItem } from "@versini/ui-system";
import * as React from "react";

export const App: React.FC = () => {
	const { login, logout, isAuthenticated } = useAuth();

	const handleValidLogin = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const response = await login(
			process.env.PUBLIC_TEST_USER as string,
			process.env.PUBLIC_TEST_USER_PASSWORD as string,
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

	return (
		<div className="prose prose-dark dark:prose-lighter">
			<Header>
				<h1>Implicit Flow</h1>
			</Header>
			<Main>
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
							Logout (valid)
						</Button>
					</FlexgridItem>
				</Flexgrid>

				<h2>State</h2>
				<pre className="text-xs">{JSON.stringify(useAuth(), null, 2)}</pre>
			</Main>
		</div>
	);
};
