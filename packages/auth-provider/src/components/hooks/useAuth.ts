import { useContext } from "react";
import type { AuthContextProps } from "../../common/types";
import { AuthContext } from "../AuthProvider/AuthContext";

export const useAuth = (context = AuthContext): AuthContextProps =>
	useContext(context) as AuthContextProps;
