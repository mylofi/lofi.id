import AsyncStorage from "@react-native-async-storage/async-storage";
import sodium from "react-native-libsodium";

import { encryptText } from "./pwa-data";
import { generateAsymmetricKey } from "./pwa-keys";
import { toMnemonic } from "./pwa-mnemonic";

import type { Dispatch, SetStateAction } from "react";
import type { LoginSession } from "@/context/LoginSessionContext";
import type { Profile } from "@/context/CurrentProfileContext";

export async function readStoredProfiles() {
	return JSON.parse((await AsyncStorage.getItem("profiles")) || "null") || {};
}

export async function register(
	profileName: string,
	registrationInfo: Profile,
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>,
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>
) {
	var keyInfo = await generateAsymmetricKey();
	const loginSession = {
		profileName,
		...keyInfo,
	};
	await saveLoginSession(loginSession, setLoginSession);

	if (
		await saveProfile(
			profileName,
			registrationInfo,
			loginSession,
			setCurrentProfile
		)
	) {
		setCurrentProfile(registrationInfo);
	} else {
		clearLoginSession(setLoginSession, setCurrentProfile);
		return "";
	}

	// TODO: use real login keywords once crypto_hash is implemented
	// var loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
	const loginKeyWords = "loginKeyWords";

	return loginKeyWords;
}

async function saveLoginSession(
	session: LoginSession,
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>
) {
	setLoginSession(session);
	try {
		await AsyncStorage.setItem(
			"login-session",
			JSON.stringify(packKeyInfo(session))
		);
	} catch (e) {
		// TODO: handle error
	}
}

export async function clearLoginSession(
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>,
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>
) {
	try {
		await AsyncStorage.removeItem("login-session");
	} catch (e) {
		// TODO: handle error
	}
	setLoginSession(null);
	setCurrentProfile(null);
}

async function saveProfile(
	profileName: string,
	profileInfo: Profile,
	loginSession: LoginSession,
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>
) {
	if (loginSession) {
		const currentProfile = profileInfo;
		setCurrentProfile(currentProfile);

		let profiles = readStoredProfiles();
		profiles[profileName] = await encryptText(
			JSON.stringify(currentProfile),
			loginSession.encPK
		);
		try {
			await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
		} catch (e) {
			// TODO: handle error
		}
		return true;
	}
}

export async function getProfile(
	profileName: string,
	loginSession: LoginSession
) {
	let profiles = readStoredProfiles();
	if (profiles[profileName] && loginSession) {
		try {
			let json = await decryptText(
				profiles[profileName],
				loginSession.encPK,
				loginSession.encSK
			);
			let profile = JSON.parse(json);
			if (!(profile != null && "firstName" in profile)) {
				throw new Error("Profile not opened.");
			}
			return profile;
		} catch (err) {
			logError(err);
		}
	}
	return null;
}

function packKeyInfo(keyInfo) {
	return Object.assign(
		{ ...keyInfo },
		Object.fromEntries(
			Object.entries(keyInfo)
				.filter(([key]) =>
					[
						"publicKey",
						"privateKey",
						"encPK",
						"encSK",
						"iv",
					].includes(key)
				)
				.map(([key, value]) => [
					key,
					sodium.to_base64(value, sodium.base64_variants.ORIGINAL),
				])
		)
	);
}

export function unpackKeyInfo(keyInfo) {
	return Object.assign(
		{ ...keyInfo },
		Object.fromEntries(
			Object.entries(keyInfo)
				.filter(([key]) =>
					[
						"publicKey",
						"privateKey",
						"encPK",
						"encSK",
						"iv",
					].includes(key)
				)
				.map(([key, value]) => [
					key,
					sodium.from_base64(value, sodium.base64_variants.ORIGINAL),
				])
		)
	);
}
