import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

export interface LoginSession {
	profileName: string;
	iv: string;
	publicKey: string;
	privateKey: string;
	encPK: string;
	encSK: string;
}

// TODO: Use this type instead of the LoginSession in all the places the session
// key info is not packed yet.
export interface UnpackedLoginSession {
	profileName: string;
	iv: Uint8Array;
	publicKey: Uint8Array;
	privateKey: Uint8Array;
	encPK: Uint8Array;
	encSK: Uint8Array;
}

export const LoginSessionContext = createContext<{
	loginSession: LoginSession | null;
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>;
}>({ loginSession: null, setLoginSession: () => {} });
