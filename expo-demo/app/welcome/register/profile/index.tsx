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

