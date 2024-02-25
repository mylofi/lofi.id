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

import { readStoredProfiles } from "@/lib/pwa-app";
import { sanitize } from "@/lib/pwa-utils";

import { ProfileNameContext } from "@/context/ProfileNameContext";

import Layout from "@/components/Layout";

export default function Register() {
	const { profileName, setProfileName } = useContext(ProfileNameContext);
	const [profileNameError, setProfileNameError] = useState("");

	function handleCreateProfileName() {
		const sanitizedProfileName = sanitize(profileName);

		if (sanitizedProfileName === "" || sanitizedProfileName.length > 30) {
			setProfileNameError("Please enter a value from 1-30 characters.");
			return;
		}

		// TODO: readStoredProfiles is not fully implemented, so the check for
		// existing profiles is not working yet.
		const profiles = readStoredProfiles();
		if (sanitizedProfileName in profiles) {
			setProfileNameError(
				`Profile '${sanitizedProfileName}' is already registered on this device.`
			);
			return;
		}

		setProfileName(sanitizedProfileName);
		router.navigate("/welcome/register/profile");
	}

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Register" }} />
			<Layout>
				<VStack space="md">
					<Heading color="$white" size="2xl">
						Profile Name
					</Heading>

					<FormControl isInvalid={profileNameError !== ""}>
						<FormControlLabel>
							<FormControlLabelText color="$white">
								Please enter a profile name (username).
							</FormControlLabelText>
						</FormControlLabel>

						<Input>
							<InputField
								onChangeText={(text) => {
									setProfileNameError("");
									setProfileName(text);
								}}
								value={profileName}
								autoCapitalize="none"
								maxLength={30}
								color="$white"
							/>
						</Input>

						<FormControlError>
							<FormControlErrorText>
								{profileNameError}
							</FormControlErrorText>
						</FormControlError>
					</FormControl>

					<VStack space="sm">
						<Button onPress={() => handleCreateProfileName()}>
							<ButtonText>Create</ButtonText>
						</Button>

						<Button onPress={() => router.navigate("/welcome")}>
							<ButtonText>Cancel</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</Layout>
		</>
	);
}
