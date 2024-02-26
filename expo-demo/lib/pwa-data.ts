import sodium from "react-native-libsodium";

export async function encryptText(text, pkBuffer) {
	try {
		let dataBuffer = new TextEncoder().encode(text);
		let encData = sodium.crypto_box_seal(dataBuffer, pkBuffer);
		return sodium.to_base64(encData, sodium.base64_variants.ORIGINAL);
	} catch (err) {
		throw new Error("Text encryption failed.", { cause: err });
	}

	throw new Error("Text encryption failed.");
}

export async function decryptText(encText, pkBuffer, skBuffer) {
	try {
		let dataBuffer = sodium.from_base64(
			encText,
			sodium.base64_variants.ORIGINAL
		);
		dataBuffer = sodium.crypto_box_seal_open(
			dataBuffer,
			pkBuffer,
			skBuffer
		);
		return new TextDecoder().decode(dataBuffer);
	} catch (err) {
		throw new Error("Text decryption failed.", { cause: err });
	}

	throw new Error("Text decryption failed.");
}
