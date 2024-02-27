import { useContext, useState } from "react";
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

import { register } from "@/lib/pwa-app";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";
import { ProfileNameContext } from "@/context/ProfileNameContext";

import Layout from "@/components/Layout";
import RegistrationConfirmationModal from "@/components/RegistrationConfirmationModal";

export default function Profile() {
	const { setCurrentProfile } = useContext(CurrentProfileContext);
	const { setLoginSession } = useContext(LoginSessionContext);
	const { profileName, setProfileName } = useContext(ProfileNameContext);

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");

	const [firstNameError, setFirstNameError] = useState("");
	const [lastNameError, setLastNameError] = useState("");
	const [emailError, setEmailError] = useState("");

	const [loginKeyWords, setLoginKeyWords] = useState("");
	const [modalVisible, setModalVisible] = useState(false);

	// TODO: handle loading states

	async function handleSubmit() {
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

		const registrationInfo = {
			firstName: sanitizedFirstName,
			lastName: sanitizedLastName,
			email: sanitizedEmail,
		};

		const loginKeyWords = await register(
			profileName,
			registrationInfo,
			setLoginSession,
			setCurrentProfile
		);

		if (!loginKeyWords) {
			// TODO: Show user-friendly error message.
			throw new Error(
				"Profile registration not saved. Please try again."
			);
			// TODO: redirect to welcome screen
		}

		console.log("loginKeyWords:", loginKeyWords);
		setLoginKeyWords(loginKeyWords);
		setModalVisible(true);
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

						{/* TODO: DRY up this with cancel button on /welcome/register */}
						<Button
							onPress={() => {
								setProfileName("");
								router.navigate("/welcome");
							}}
						>
							<ButtonText>Cancel</ButtonText>
						</Button>
					</VStack>
				</VStack>

				<RegistrationConfirmationModal
					loginKeyWords={loginKeyWords}
					modalVisible={modalVisible}
				/>
			</Layout>
		</>
	);
}
