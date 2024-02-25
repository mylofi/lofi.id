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
}
