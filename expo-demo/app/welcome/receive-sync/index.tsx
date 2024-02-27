import { Stack, router } from "expo-router";
import { Button, ButtonText, Heading, VStack } from "@gluestack-ui/themed";

import Layout from "@/components/Layout";

export default function ReceiveSync() {
	return (
		<>
			<Stack.Screen options={{ headerTitle: "Receive Sync" }} />
			<Layout>
				<VStack space="md">
					<Heading color="$white" size="2xl">
						Receive Sync
					</Heading>

					<Button onPress={() => router.navigate("/welcome")}>
						<ButtonText>Cancel</ButtonText>
					</Button>
				</VStack>
			</Layout>
		</>
	);
}
