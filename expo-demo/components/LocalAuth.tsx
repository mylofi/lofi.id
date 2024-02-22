import { useState } from "react";
import { Alert } from "react-native";
import {
	Button,
	ButtonText,
	Input,
	InputField,
	VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

export default function LocalAuth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function signInWithEmail() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) Alert.alert(error.message);
		setLoading(false);
	}

	async function register() {
		// var profileName = await promptProfileName();
		// if (!profileName) {
		// 	return promptWelcome();
		// }
		// var registrationInfo = await promptRegistration();
		// if (!registrationInfo) {
		// 	return promptWelcome();
		// }
		// var keyInfo = await generateAsymmetricKey();
		// saveLoginSession({
		// 	profileName,
		// 	...keyInfo,
		// });
		// if (await saveProfile(profileName,registrationInfo)) {
		// 	currentProfile = registrationInfo;
		// }
		// else {
		// 	clearLoginSession();
		// 	await showError("Profile registration not saved. Please try again.");
		// 	return promptWelcome();
		// }
		// var loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
		// await confirmRegistration(profileName,loginKeyWords);
		// return showProfile();
	}

	function receiveSync() {
		// TODO: Implement receiveSync
	}

	return (
		<VStack space="3xl" m="$3">
			<VStack space="sm">
				<Input variant="outline" size="md" isDisabled={loading}>
					<InputField
						color="$white"
						onChangeText={(text) => setEmail(text)}
						value={email}
						placeholder="email@address.com"
						autoCapitalize="none"
					/>
				</Input>

				<Input variant="outline" size="md" isDisabled={loading}>
					<InputField
						color="$white"
						onChangeText={(text) => setPassword(text)}
						value={password}
						secureTextEntry={true}
						placeholder="Password"
						autoCapitalize="none"
					/>
				</Input>
			</VStack>

			<VStack space="sm">
				<Button
					size="md"
					variant="solid"
					action="primary"
					isDisabled={loading}
					onPress={() => signInWithEmail()}
				>
					<ButtonText>Login</ButtonText>
				</Button>

				<Button
					size="md"
					variant="solid"
					action="primary"
					isDisabled={loading}
					onPress={() => router.navigate("/register")}
				>
					<ButtonText>Register</ButtonText>
				</Button>

				<Button
					size="md"
					variant="solid"
					action="primary"
					isDisabled={loading}
					onPress={() => receiveSync()}
				>
					<ButtonText>Receive Sync</ButtonText>
				</Button>
			</VStack>
		</VStack>
	);
}
