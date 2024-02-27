import { useContext, useState } from "react";
import { Stack, router } from "expo-router";
import {
	Button,
	ButtonText,
	Center,
	CloseIcon,
	Heading,
	Icon,
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Text,
	VStack,
	View,
} from "@gluestack-ui/themed";

import { clearLoginSession } from "@/lib/pwa-app";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";
import Layout from "@/components/Layout";
import QRCode from "react-native-qrcode-svg";

function updateEverSecond(setqrData: (qrData: any) => void) {
	const intervalId = setInterval(() => {
		setqrData(Math.random().toString(36).substring(2, 15));
	}, 1000);

	setTimeout(() => {
		clearInterval(intervalId);
	}, 30000);
}

export default function AppIndex() {
	const { currentProfile, setCurrentProfile } = useContext(
		CurrentProfileContext
	);
	const { loginSession, setLoginSession } = useContext(LoginSessionContext);
	const [showModal, setShowModal] = useState(false); // Start with the modal not shown
	// const { hasPermission, requestPermission } = useCameraPermission();
	const [qrData, setqrData] = useState("Puppy");


	// Function to handle the "Provide Sync" button press
	const handleProvideSyncPress = () => {
		setShowModal(true); // This will trigger a re-render and show the modal
		updateEverSecond(setqrData);
	};

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Account" }} />
			<Layout>
				<VStack space="4xl">
					<Heading color="$white" size="2xl">
						You are logged in
					</Heading>

					<VStack>
						<Text color="$white">{loginSession?.profileName}</Text>
						<Text color="$white">
							{JSON.stringify(currentProfile)}
						</Text>
					</VStack>

					<VStack space="sm">
						<Button
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
						<Button onPress={handleProvideSyncPress}>
							<ButtonText>Provide Sync</ButtonText>
						</Button>
						<Button onPress={() => {}}>
							<ButtonText>Delete Profile</ButtonText>
						</Button>
						<Center marginTop={'$4'}>
							{showModal && <QRCode size={300} value={qrData} />}
						</Center>
					</VStack>
				</VStack>
				{/* Conditionally render the modal */}
			</Layout>
		</>
	);
}