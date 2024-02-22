import AsyncStorage from "@react-native-async-storage/async-storage";

export async function readStoredProfiles() {
	return JSON.parse((await AsyncStorage.getItem("profiles")) || "null") || {};
}
