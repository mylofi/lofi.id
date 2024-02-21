import sodium from "react-native-sodium";
import { generateEntropy } from "./pwa-utils";

export {
	generateAsymmetricKey,
	// deriveSharedKeys,
};

// *************************

function generateAsymmetricKey(iv = generateEntropy(32)) {
	try {
		let ed25519KeyPair = sodium.crypto_sign_seed_keypair(iv);
		return {
			iv,
			publicKey: ed25519KeyPair.publicKey,
			privateKey: ed25519KeyPair.privateKey,
			encPK: sodium.crypto_sign_ed25519_pk_to_curve25519(
				ed25519KeyPair.publicKey
			),
			encSK: sodium.crypto_sign_ed25519_sk_to_curve25519(
				ed25519KeyPair.privateKey
			),
		};
	} catch (err) {
		throw new Error("Asymmetric key generation failed.", { cause: err });
	}

	throw new Error("Asymmetric key generation failed.");
}

// async function deriveSharedKeys(localPublicKeyBuffer,localPrivateKeyBuffer,remotePublicKeyBuffer,isOriginator = true) {
// 	try {
// 		// convert exchanged Ed25519 curve keys to X25519 curve keys
// 		let localPK = sodium.crypto_sign_ed25519_pk_to_curve25519(localPublicKeyBuffer);
// 		let localSK = sodium.crypto_sign_ed25519_sk_to_curve25519(localPrivateKeyBuffer);
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
