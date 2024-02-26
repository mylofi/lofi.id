import { useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { clearLoginSession, getProfile, unpackKeyInfo } from "@/lib/pwa-app";
import { sanitize } from "@/lib/pwa-utils";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";

export default function AppLayout() {
	const { setCurrentProfile } = useContext(CurrentProfileContext);
	const { loginSession, setLoginSession } = useContext(LoginSessionContext);
	const [loading, setLoading] = useState(true);

	// TODO: Add logic to check if user is already logged in on app start here.
	useEffect(() => {
		(async () => {
			const session =
				loginSession ||
				JSON.parse(
					(await AsyncStorage.getItem("login-session")) || "null"
				);

			if (session) {
				const profile = await getProfile(
					// TODO: Fix type error.
					unpackKeyInfo({
						...session,
						profileName: sanitize(session.profileName),
					})
				);
				if (profile) {
					setCurrentProfile(profile);
					setLoginSession(session);
					setLoading(false);
					return;
				}
			}

			clearLoginSession(setLoginSession, setCurrentProfile);
			setLoading(false);
		})();
	}, [loginSession]);

	// You can keep the splash screen open, or render a loading screen like we do here.
	if (loading) {
		return <Text>Loading...</Text>;
	}

	// Only require authentication within the (app) group's layout as users
	// need to be able to access the (auth) group and sign in again.
	if (!loginSession) {
		// On web, static rendering will stop here as the user is not authenticated
		// in the headless Node process that the pages are rendered in.
		return <Redirect href="/welcome/" />;
	}

	// This layout can be deferred because it's not the root layout.
	return <Stack />;
}
