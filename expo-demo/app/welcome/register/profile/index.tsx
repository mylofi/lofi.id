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

	function handleSubmit() {
		const sanitizedFirstName = firstName.trim();
		const sanitizedLastName = lastName.trim();
		const sanitizedEmail = email.trim().toLowerCase();

		if (!sanitizedFirstName) {
			setFirstNameError("Please enter your first name.");
		}

		if (!sanitizedLastName) {
			setLastNameError("Please enter your last name.");
		}

		if (
			!sanitizedEmail ||
			!/[^@]+@[^@.]+(?:\.[^]+)+/.test(sanitizedEmail)
		) {
			setEmailError("Please enter a valid email address.");
		}

		if (
			!sanitizedFirstName ||
			!sanitizedLastName ||
			!sanitizedEmail ||
			!/[^@]+@[^@.]+(?:\.[^]+)+/.test(sanitizedEmail)
		) {
			return;
		}

		const message = {
			type: "register",
			payload: {
				profileName,
				registrationInfo: {
					firstName: sanitizedFirstName,
					lastName: sanitizedLastName,
					email: sanitizedEmail,
				},
			},
		};

		webViewRef.current?.postMessage(JSON.stringify(message));
	}

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Profile Info" }} />
			<Layout>
				<VStack space="md">
					<Heading color="$white" size="2xl">
						Profile
					</Heading>

					<FormControl isInvalid={firstNameError !== ""}>
						<FormControlLabel>
							<FormControlLabelText color="$white">
								First Name
							</FormControlLabelText>
						</FormControlLabel>

						<Input>
							<InputField
								onChangeText={(text) => {
									setFirstNameError("");
									setFirstName(text);
								}}
								value={firstName}
								autoCapitalize="words"
								color="$white"
							/>
						</Input>

						<FormControlError>
							<FormControlErrorText>
								{firstNameError}
							</FormControlErrorText>
						</FormControlError>
					</FormControl>

					<FormControl isInvalid={lastNameError !== ""}>
						<FormControlLabel>
							<FormControlLabelText color="$white">
								Last Name
							</FormControlLabelText>
						</FormControlLabel>

						<Input>
							<InputField
								onChangeText={(text) => {
									setLastNameError("");
									setLastName(text);
								}}
								value={lastName}
								autoCapitalize="words"
								color="$white"
							/>
						</Input>

						<FormControlError>
							<FormControlErrorText>
								{lastNameError}
							</FormControlErrorText>
						</FormControlError>
					</FormControl>

					<FormControl isInvalid={emailError !== ""}>
						<FormControlLabel>
							<FormControlLabelText color="$white">
								Email
							</FormControlLabelText>
						</FormControlLabel>

						<Input>
							<InputField
								onChangeText={(text) => {
									setEmailError("");
									setEmail(text);
								}}
								value={email}
								autoCapitalize="none"
								color="$white"
							/>
						</Input>

						<FormControlError>
							<FormControlErrorText>
								{emailError}
							</FormControlErrorText>
						</FormControlError>
					</FormControl>

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
