import {packKeyInfo} from "@/lib/pwa-utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encryptText } from "./pwa-keys";

const PROFILE_KEY = 'profiles'
export async function readStoredProfiles() {
	return (
		JSON.parse((await AsyncStorage.getItem(PROFILE_KEY)) || "null") || {}
	);
}

export async function saveLoginSession(keyInfo) {
	const packed_key = packKeyInfo(keyInfo);
	console.log('Returned packed key', packed_key);
	return AsyncStorage.setItem("login-session", JSON.stringify(packed_key));
	// TODO: multiple logged in profiles support^
}

export async function saveProfile(encPKey, profileName, profileInfo) {
	// if (loginSession) {
	const currentProfile = profileInfo;
	let profiles : {} = readStoredProfiles();
	const cipherText = await encryptText(
		JSON.stringify(currentProfile),
		encPKey
	);
	console.log("Cipher Text from registration: ", cipherText);
	profiles[profileName] = cipherText
	await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)).catch();
	return true;
}

function unpackKeyInfo(keyInfo) {
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