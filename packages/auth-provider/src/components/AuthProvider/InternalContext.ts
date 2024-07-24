import React from "react";
import { AuthState } from "../../common/types";
import { emptyState } from "../../common/utilities";

export const InternalContext = React.createContext<{
	state: AuthState;
	dispatch: React.Dispatch<any>;
}>({
	state: emptyState,
	dispatch: () => {},
});
