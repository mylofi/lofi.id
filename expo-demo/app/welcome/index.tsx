import { Stack, router } from "expo-router";
import { Button, ButtonText, VStack } from "@gluestack-ui/themed";

import Header from "@/components/Header";
import Layout from "@/components/Layout";

export default function Welcome() {
	return (
		<>
			<Stack.Screen options={{ headerTitle: "Home" }} />
			<Layout>
				<VStack space="4xl">
					<Header>Local-First Auth</Header>

					<VStack space="sm" m="$3">
						<Button
							onPress={() => router.navigate("/welcome/login")}
						>
							<ButtonText>Login</ButtonText>
						</Button>

						<Button
							onPress={() => router.navigate("/welcome/register")}
						>
							<ButtonText>Register</ButtonText>
						</Button>

						<Button
						// onPress={() => router.navigate("/welcome/receive-sync")}
						>
							<ButtonText>Receive Sync</ButtonText>
						</Button>

						{/* <Button onPress={() => router.navigate("/welcome/pwa")}>
							<ButtonText>PWA</ButtonText>
						</Button> */}
					</VStack>
				</VStack>
			</Layout>
		</>
	);
}
