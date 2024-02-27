import { useRef, useState } from "react";
import { Stack, router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import {
	Button,
	ButtonText,
	Center,
	Heading,
	VStack,
} from "@gluestack-ui/themed";

import Layout from "@/components/Layout";

export default function ProvideSync() {
	const qrCodeRef = useRef<QRCode>(null);
	const [qrCodeValue, setQrCodeValue] = useState<string>();

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Provide Sync" }} />
			<Layout>
				<VStack space="4xl">
					<Heading color="$white" size="2xl">
						Provide Sync
					</Heading>

					<Center bg="$white" h={350} borderRadius="$md">
						<QRCode
							ref={qrCodeRef}
							value={qrCodeValue}
							size={300}
							logo={{
								uri: "https://localfirstweb.dev/assets/images/logo.png",
							}}
						/>
					</Center>

					<Button onPress={() => router.navigate("/(app)")}>
						<ButtonText>Done</ButtonText>
					</Button>
				</VStack>
			</Layout>
		</>
	);
}
