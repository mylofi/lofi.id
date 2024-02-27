import { useContext, useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import {
	Button,
	ButtonText,
	Center,
	Checkbox,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
	Heading,
	Text,
	VStack,
} from "@gluestack-ui/themed";

import { LoginSessionContext } from "@/context/LoginSessionContext";

import Layout from "@/components/Layout";

export default function ProvideSync() {
	const { loginSession } = useContext(LoginSessionContext);
	const [includeFullProfile, setIncludeFullProfile] = useState(true);
	const [frameIndex, setFrameIndex] = useState(0);
	const [frameCount, setFrameCount] = useState(0);
	const [qrCodeValue, setQrCodeValue] = useState<string>();

	useEffect(() => {}, []);

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Provide Sync" }} />
			<Layout>
				<VStack space="lg">
					<Heading color="$white" size="2xl">
						Provide Sync
					</Heading>

					<Checkbox
						aria-label="Include full profile"
						isChecked={includeFullProfile}
						value=""
						size="lg"
					>
						<CheckboxIndicator mr="$2">
							{/* <CheckboxIcon as={CheckIcon}/> */}
						</CheckboxIndicator>

						<CheckboxLabel color="$white">
							Include full profile
						</CheckboxLabel>
					</Checkbox>

					<Text size="lg" color="$white">
						Frame: {frameIndex} / {frameCount}
					</Text>

					<Center bg="$white" h={350} borderRadius="$md">
						<QRCode
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
