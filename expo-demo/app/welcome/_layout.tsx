import { useState } from "react";
import { Stack } from "expo-router";

import { ProfileNameContext } from "@/context/ProfileNameContext";

export default function WelcomeLayout() {
	const [profileName, setProfileName] = useState("");

	return (
		<ProfileNameContext.Provider value={{ profileName, setProfileName }}>
			<Stack />
		</ProfileNameContext.Provider>
	);
}
