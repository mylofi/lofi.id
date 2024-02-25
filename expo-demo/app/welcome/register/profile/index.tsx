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

	return (
		<>
			<Stack.Screen options={{ headerTitle: "Profile Info" }} />
			<Layout>
			</Layout>
		</>
	);
}
