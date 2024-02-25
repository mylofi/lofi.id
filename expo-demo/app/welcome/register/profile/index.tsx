import { useContext, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import {
	Button,
	ButtonText,
	FormControl,
	FormControlError,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
	Heading,
	Input,
	InputField,
	VStack,
} from "@gluestack-ui/themed";

import { ProfileNameContext } from "@/context/ProfileNameContext";

import Layout from "@/components/Layout";
import PWAWebView from "@/components/PWAWebView";
import RegistrationConfirmationModal from "@/components/RegistrationConfirmationModal";

import type { WebView } from "react-native-webview";

export default function Profile() {
	const { profileName } = useContext(ProfileNameContext);

	const webViewRef = useRef<WebView>(null);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");

	const [firstNameError, setFirstNameError] = useState("");
	const [lastNameError, setLastNameError] = useState("");
	const [emailError, setEmailError] = useState("");

	const [loginKeyWords, setLoginKeyWords] = useState("");
	const [modalVisible, setModalVisible] = useState(false);

	// TODO: handle loading states

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Profile Info" }} />
			<Layout>
				<VStack space="md">
					<Heading color="$white" size="2xl">
						Profile
					</Heading>


					<VStack space="sm">
						<Button onPress={() => handleSubmit()}>
							<ButtonText>Submit</ButtonText>
						</Button>

						{/* TODO: clear profileName on cancel */}
						<Button onPress={() => router.navigate("/welcome")}>
							<ButtonText>Cancel</ButtonText>
						</Button>
					</VStack>
				</VStack>

				<PWAWebView
					ref={webViewRef}
					setLoginKeyWords={setLoginKeyWords}
					setModalVisible={setModalVisible}
				/>

				<RegistrationConfirmationModal
					loginKeyWords={loginKeyWords}
					modalVisible={modalVisible}
				/>
			</Layout>
		</>
	);
}
