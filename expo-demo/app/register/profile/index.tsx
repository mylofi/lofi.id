import { useState } from "react";
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
	set,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { readStoredProfiles, saveLoginSession, saveProfile } from "@/lib/pwa-app";
import { generateAsymmetricKey } from "@/lib/pwa-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [firstNameError, setFirstNameError] = useState("");
	const [lastNameError, setLastNameError] = useState("");
	const [emailError, setEmailError] = useState("");

	async function handleSubmit() {
		const profiles = readStoredProfiles();
		const sanitizedFirstName = firstName.trim();
		const sanitizedLastName = lastName.trim();
		const sanitizedEmail = email.trim().toLowerCase();

		if (!sanitizedFirstName) {
			setFirstNameError("Please enter your first name.");
			return;
		}

		if (!sanitizedLastName) {
			setLastNameError("Please enter your last name.");
			return;
		}

		if (
			!sanitizedEmail ||
			!/[^@]+@[^@.]+(?:\.[^]+)+/.test(sanitizedEmail)
		) {
			setEmailError("Please enter a valid email address.");
			return;
		}

		const keyInfo = generateAsymmetricKey();
		console.log("keyInfo:", keyInfo);
		// TODO: profileName from the previous register pag as url
		const profileName = "FixMe";
		await saveLoginSession({
			profileName,
			...keyInfo,
		});
		AsyncStorage.getItem("login-session").then((result) =>
			console.log("login-session stored value: ", result)
		);

		const profileInfo = {
			first_name: sanitizedFirstName,
			last_name: sanitizedLastName,
			email: sanitizedEmail,
		};
		console.log("Profile info: ", profileInfo);
		saveProfile(keyInfo.encPK, profileName, profileInfo);

		// var loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
		// await confirmRegistration(profileName, loginKeyWords);

		// return showProfile();
	}

	function cancel() {
		router.navigate("/");
	}

	return (
		<VStack space="4xl">
			<Heading>Profile</Heading>

			<FormControl
				size="md"
				isDisabled={false}
				isInvalid={firstNameError !== ""}
			>
				<FormControlLabel>
					<FormControlLabelText>First Name</FormControlLabelText>
				</FormControlLabel>

				<Input variant="outline" size="md">
					<InputField
						onChangeText={(text) => {
							setFirstNameError("");
							setFirstName(text);
						}}
						value={firstName}
						autoCapitalize="none"
						maxLength={30}
					/>
				</Input>

				<FormControlError>
					<FormControlErrorText>
						{firstNameError}
					</FormControlErrorText>
				</FormControlError>
			</FormControl>

			<FormControl
				size="md"
				isDisabled={false}
				isInvalid={lastNameError !== ""}
			>
				<FormControlLabel>
					<FormControlLabelText>Last Name</FormControlLabelText>
				</FormControlLabel>

				<Input variant="outline" size="md">
					<InputField
						onChangeText={(text) => {
							setLastNameError("");
							setLastName(text);
						}}
						value={lastName}
						autoCapitalize="none"
						maxLength={30}
					/>
				</Input>

				<FormControlError>
					<FormControlErrorText>{lastNameError}</FormControlErrorText>
				</FormControlError>
			</FormControl>

			<FormControl
				size="md"
				isDisabled={false}
				isInvalid={emailError !== ""}
			>
				<FormControlLabel>
					<FormControlLabelText>Email</FormControlLabelText>
				</FormControlLabel>

				<Input variant="outline" size="md">
					<InputField
						onChangeText={(text) => {
							setEmailError("");
							setEmail(text);
						}}
						value={email}
						autoCapitalize="none"
						maxLength={30}
					/>
				</Input>

				<FormControlError>
					<FormControlErrorText>{emailError}</FormControlErrorText>
				</FormControlError>
			</FormControl>

			<VStack space="sm">
				<Button
					size="md"
					variant="solid"
					action="primary"
					onPress={() => handleSubmit()}
				>
					<ButtonText>Submit</ButtonText>
				</Button>

				<Button
					size="md"
					variant="solid"
					action="primary"
					onPress={() => cancel()}
				>
					<ButtonText>Cancel</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
