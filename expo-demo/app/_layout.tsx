import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { useColorScheme } from "@/components/useColorScheme";
import { Slot } from "expo-router";

import { ServerAuthSessionContext } from "@/context/ServerAuthSessionContext";
import { supabase } from "@/lib/supabase";

import type { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "gluestack",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	const colorScheme = useColorScheme();
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	return (
		<GluestackUIProvider config={config}>
			<ThemeProvider
				value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
			>
				<ServerAuthSessionContext.Provider value={session}>
					{/* <Slot /> */}
					<Stack>
						<Stack.Screen
							name="index"
							options={{ headerTitle: "Home" }}
						/>
						<Stack.Screen
							name="register/index"
							options={{
								headerTitle: "Register",
							}}
						/>
						<Stack.Screen
							name="register/profile/index"
							options={{
								headerTitle: "Profile Info",
							}}
						/>
					</Stack>
				</ServerAuthSessionContext.Provider>
			</ThemeProvider>
		</GluestackUIProvider>
	);
}
