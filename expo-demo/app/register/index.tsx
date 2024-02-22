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
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { readStoredProfiles } from "@/lib/pwa-app";
import { sanitize } from "@/lib/pwa-utils";

export default function Register() {
	const [profileName, setProfileName] = useState("");
	const [error, setError] = useState("");

	function create() {
		const profiles = readStoredProfiles();
		const sanitizedProfileName = sanitize(profileName);

		if (sanitizedProfileName == "" || sanitizedProfileName.length > 30) {
			setError("Please enter a value from 1-30 characters.");
			return;
		}

		if (sanitizedProfileName in profiles) {
			setError(
				`Profile '${sanitizedProfileName}' is already registered on this device.`
			);
			return;
		}

		setProfileName(sanitizedProfileName);
		router.navigate("/register/profile");
	}

	function cancel() {
		router.navigate("/");
	}

	return (
		<VStack space="4xl">
			<Heading>Profile Name</Heading>

			<FormControl size="md" isDisabled={false} isInvalid={error !== ""}>
				<FormControlLabel>
					<FormControlLabelText>
						Please enter a profile name (username).
					</FormControlLabelText>
				</FormControlLabel>

				<Input variant="outline" size="md">
					<InputField
						onChangeText={(text) => {
							setError("");
							setProfileName(text);
						}}
						value={profileName}
						autoCapitalize="none"
						maxLength={30}
					/>
				</Input>

				<FormControlError>
					<FormControlErrorText>{error}</FormControlErrorText>
				</FormControlError>
			</FormControl>

			<VStack space="sm">
				<Button
					size="md"
					variant="solid"
					action="primary"
					onPress={() => create()}
				>
					<ButtonText>Create</ButtonText>
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
