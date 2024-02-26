import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

export interface Profile {
	firstName: string;
	lastName: string;
	email: string;
}

export const CurrentProfileContext = createContext<{
	currentProfile: Profile | null;
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>;
}>({ currentProfile: null, setCurrentProfile: () => {} });
