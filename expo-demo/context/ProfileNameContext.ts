import { createContext } from "react";

import type { Dispatch, SetStateAction } from "react";

export const ProfileNameContext = createContext<{
	profileName: string;
	setProfileName: Dispatch<SetStateAction<string>>;
}>({ profileName: "", setProfileName: () => {} });
