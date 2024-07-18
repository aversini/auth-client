import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { AuthProvider } from "@versini/auth-provider";
import { App } from "./main.tsx";

const params = new URL(document.location.href).searchParams;
const timeout = params.get("timeout") || "90d";
const debug = Boolean(params.get("debug")) || false;

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider
			clientId={"b44c68f0-e5b3-4a1d-a3e3-df8632b0223b"}
			sessionExpiration={timeout}
			domain={"gizmette.local.com"}
			debug={debug}
		>
			<App timeout={timeout} />
		</AuthProvider>
	</React.StrictMode>,
);
