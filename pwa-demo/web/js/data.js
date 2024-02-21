import { generateEntropy, } from "./util.js";

export {
	encryptText,
	decryptText,
	// buildMessage,
	// readMessage,
};


// *************************

async function encryptText(text,pkBuffer) {
	try {
		let dataBuffer = (new TextEncoder()).encode(text);
		let encData = sodium.crypto_box_seal(dataBuffer,pkBuffer);
		return sodium.to_base64(encData,sodium.base64_variants.ORIGINAL);
	}
	catch (err) {
		throw new Error("Text encryption failed.",{ cause: err, });
	}

	throw new Error("Text encryption failed.");
}

async function decryptText(encText,pkBuffer,skBuffer) {
	try {
		let dataBuffer = sodium.from_base64(encText,sodium.base64_variants.ORIGINAL);
		dataBuffer = sodium.crypto_box_seal_open(dataBuffer,pkBuffer,skBuffer);
		return (new TextDecoder()).decode(dataBuffer);
	}
	catch (err) {
		throw new Error("Text decryption failed.",{ cause: err, });
	}

	throw new Error("Text decryption failed.");
}

// async function buildMessage(text,privateKeyBuffer,sharedTxKeyBuffer) {
// 	try {
// 		let { nonceText, encText, } = await encryptText(text,sharedTxKeyBuffer);
// 		return sodium.to_base64(
// 			sodium.crypto_sign(
// 				`${nonceText};${encText}`,
// 				privateKeyBuffer
// 			),
// 			sodium.base64_variants.ORIGINAL
// 		);
// 	}
// 	catch (err) {
// 		throw new Error("Message could not be built.",{ cause: err, });
// 	}

// 	throw new Error("Message could not be built.");
// }

// async function readMessage(msg,publicKeyBuffer,sharedRxKeyBuffer) {
// 	try {
// 		let msgData = (new TextDecoder()).decode(
// 			sodium.crypto_sign_open(
// 				sodium.from_base64(msg,sodium.base64_variants.ORIGINAL),
// 				publicKeyBuffer
// 			)
// 		);
// 		let [ , nonceText, encText, ] = msgData.match(/^([^;]+);(.*)$/) || [];

// 		if (nonceText && encText) {
// 			return decryptText(encText,sharedRxKeyBuffer,nonceText);
// 		}
// 	}
// 	catch (err) {
// 		throw new Error("Message could not be read.",{ cause: err, });
// 	}

// 	throw new Error("Message could not be read.");
// }
