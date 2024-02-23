import sodium, {
	crypto_sign_ed25519_pk_to_curve25519,
	crypto_sign_seed_keypair,
	crypto_sign_ed25519_sk_to_curve25519,
} from "react-native-libsodium";

import { generateEntropy } from "./pwa-utils";

export {
	generateAsymmetricKey,
	// deriveSharedKeys,
};

// *************************

function generateAsymmetricKey(iv = generateEntropy(32)) {
	console.log("sodium:", crypto_sign_ed25519_pk_to_curve25519);
	console.log("sodium:", crypto_sign_seed_keypair);
	try {
		let ed25519KeyPair = crypto_sign_seed_keypair(iv);
		return {
			iv,
			publicKey: ed25519KeyPair.publicKey,
			privateKey: ed25519KeyPair.privateKey,
			encPK: crypto_sign_ed25519_pk_to_curve25519(
				ed25519KeyPair.publicKey
			),
			encSK: crypto_sign_ed25519_sk_to_curve25519(
				ed25519KeyPair.privateKey
			),
		};
	} catch (err) {
		console.log("err:", err);
		throw new Error("Asymmetric key generation failed.", { cause: err });
	}

	throw new Error("Asymmetric key generation failed.");
}

export async function encryptText(text: string, pkBuffer) {
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


// async function deriveSharedKeys(localPublicKeyBuffer,localPrivateKeyBuffer,remotePublicKeyBuffer,isOriginator = true) {
// 	try {
// 		// convert exchanged Ed25519 curve keys to X25519 curve keys
// 		let localPK = crypto_sign_ed25519_pk_to_curve25519(localPublicKeyBuffer);
// 		let localSK = crypto_sign_ed25519_sk_to_curve25519(localPrivateKeyBuffer);
// 		let remotePK = sodium.crypto_sign_ed25519_pk_to_curve25519(remotePublicKeyBuffer);
// 		let sharedKeys;

// 		// derive shared tx/rx keys, for encryption and decryption
// 		if (isOriginator) {
// 			sharedKeys = sodium.crypto_kx_client_session_keys(localPK,localSK,remotePK);
// 		}
// 		else {
// 			sharedKeys = sodium.crypto_kx_server_session_keys(localPK,localSK,remotePK);
// 		}

// 		return sharedKeys;
// 	}
// 	catch (err) {
// 		throw new Error("Shared key derivation failed.",{ cause: err, });
// 	}

// 	throw new Error("Shared key derivation failed.");
// }
