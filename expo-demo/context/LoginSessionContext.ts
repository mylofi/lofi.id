import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

export interface keyInfo {
	iv: Uint8Array;
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	encPK: Uint8Array;
	encSK: Uint8Array;
}

export interface UnpackedLoginSession extends keyInfo {
	profileName: string;
}

export interface LoginSession {
	profileName: string;
	iv: string;
	publicKey: string;
	privateKey: string;
	encPK: string;
	encSK: string;
}

export const LoginSessionContext = createContext<{
	loginSession: LoginSession | null;
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>;
}>({ loginSession: null, setLoginSession: () => {} });
