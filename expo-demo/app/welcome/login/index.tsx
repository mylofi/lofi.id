import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Stack, router } from "expo-router";
import {
	Button,
	ButtonText,
	Heading,
	Select,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectInput,
	SelectItem,
	SelectPortal,
	SelectTrigger,
	Textarea,
	TextareaInput,
	VStack,
} from "@gluestack-ui/themed";

import {
	clearLoginSession,
	getProfile,
	packKeyInfo,
	readStoredProfiles,
	saveLoginSession,
} from "@/lib/pwa-app";
import { generateAsymmetricKey } from "@/lib/pwa-keys";
import { fromMnemonic } from "@/lib/pwa-mnemonic";

import { CurrentProfileContext } from "@/context/CurrentProfileContext";
import { LoginSessionContext } from "@/context/LoginSessionContext";

import Layout from "@/components/Layout";

export default function Login() {
	const { setCurrentProfile } = useContext(CurrentProfileContext);
	const { setLoginSession } = useContext(LoginSessionContext);

	const [profiles, setProfiles] = useState({});
	const [loginProfileName, setLoginProfileName] = useState("");
	const [loginKeyWords, setLoginKeyWords] = useState("");

	async function handleCreateProfileName() {
		const sanitizedLoginKeyWords = loginKeyWords.trim().toLowerCase();

		if (!loginProfileName || !(loginProfileName in profiles)) {
			Alert.alert("Please select a valid profile for login.");
			return;
		}

		if (!/^(?:\w+ ){23}\w+$/.test(sanitizedLoginKeyWords)) {
			Alert.alert(
				"Login ID must be exactly 24 words, separated by spaces."
			);
			return;
		}

		const [decodedIV, checksumValid] = await fromMnemonic(loginKeyWords);

		if (!checksumValid) {
			Alert.alert("Login ID is invalid.");
			return;
		}

		try {
			let keyInfo = generateAsymmetricKey(decodedIV);
			const session = {
				profileName: loginProfileName,
				...keyInfo,
			};

			saveLoginSession(session, setLoginSession);

			const profile = await getProfile(session);
			if (profile) {
				setCurrentProfile(profile);
				setLoginSession(packKeyInfo(session));
				router.navigate("/");
				return;
			}

			clearLoginSession(setLoginSession, setCurrentProfile);
			Alert.alert("Login Failed.");
		} catch (err) {
			clearLoginSession(setLoginSession, setCurrentProfile);
			Alert.alert("Login ID could not be processed.");
		}
	}

	useEffect(() => {
		(async () => {
			const profiles = await readStoredProfiles();
			if (Object.keys(profiles).length === 0) {
				router.navigate("/welcome/register");
			}

			setProfiles(profiles);
		})();
	}, []);

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Login" }} />
			<Layout>
				<VStack space="md">
					<Heading color="$white" size="2xl">
						Login
					</Heading>

					<Select
						selectedValue={loginProfileName}
						onValueChange={(value) => setLoginProfileName(value)}
					>
						<SelectTrigger>
							<SelectInput
								color="$white"
								placeholder="Select a profile"
							/>
							{/* <SelectIcon mr="$3">
                                <Icon as={ChevronDownIcon} />
                            </SelectIcon> */}
						</SelectTrigger>
						<SelectPortal>
							<SelectBackdrop />
							<SelectContent>
								<SelectDragIndicatorWrapper>
									<SelectDragIndicator />
								</SelectDragIndicatorWrapper>
								{Object.keys(profiles).map((profile, index) => {
									return (
										<SelectItem
											key={index}
											label={profile}
											value={profile}
										/>
									);
								})}
							</SelectContent>
						</SelectPortal>
					</Select>

					<Textarea>
						<TextareaInput
							onChangeText={(text) => setLoginKeyWords(text)}
							value={loginKeyWords}
							autoCapitalize="none"
							color="$white"
							placeholder="Login ID (word list)"
						/>
					</Textarea>

					<VStack space="sm">
						<Button onPress={() => handleCreateProfileName()}>
							<ButtonText>Submit</ButtonText>
						</Button>

						<Button
							onPress={() => {
								router.navigate("/welcome");
							}}
						>
							<ButtonText>Cancel</ButtonText>
						</Button>
					</VStack>
				</VStack>
			</Layout>
		</>
	);
}
