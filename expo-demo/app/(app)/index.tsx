import { useContext } from "react";
import { Stack, router } from "expo-router";
import { Button, ButtonText, Heading, VStack } from "@gluestack-ui/themed";

import { clearLoginSession } from "@/lib/pwa-app";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";
import Layout from "@/components/Layout";

export default function AppIndex() {
	const { setCurrentProfile } = useContext(CurrentProfileContext);
	const { setLoginSession } = useContext(LoginSessionContext);

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Account" }} />
			<Layout>
				<VStack space="4xl">
					<Heading color="$white" size="2xl">
						You are logged in
					</Heading>

					<Button
						size="md"
						variant="solid"
						action="primary"
						onPress={() => {
							clearLoginSession(
								setLoginSession,
								setCurrentProfile
							);
							router.navigate("/welcome");
						}}
					>
						<ButtonText>Log Out</ButtonText>
					</Button>
				</VStack>
			</Layout>
		</>
	);
}
