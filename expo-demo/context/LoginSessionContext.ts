import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

interface KeyInfo {
	iv: Uint8Array;
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	encPK: Uint8Array;
	encSK: Uint8Array;
}

export interface LoginSession extends KeyInfo {
	profileName: string;
}

export const LoginSessionContext = createContext<{
	loginSession: LoginSession | null;
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>;
}>({ loginSession: null, setLoginSession: () => {} });
