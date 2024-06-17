import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../..";

describe("AuthProvider", () => {
	it("renders children components", () => {
		render(
			<AuthProvider clientId="123">
				<div data-testid="child-component">Child Component</div>
			</AuthProvider>,
		);
		const childComponentElement = screen.getByTestId("child-component");
		expect(childComponentElement).toBeInTheDocument();
	});
});
