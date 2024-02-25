import { getDeferred, logError, } from "./util.js";
import { deriveSharedKeys, } from "./keys.js";
import { buildMessage, readMessage, } from "./messages.js";

var chan = new BroadcastChannel("e2e-demo");
chan.addEventListener("message",evt => onChannelMessage(evt).catch(logError));

var localPrivateKey;
var localPublicKey;
var remotePublicKey;
var sharedKeys;
var pongResponse;

export {
	sharedKeys,
	pingRemote,
	introduce,
	sendToRemote,
};


// *************************

async function pingRemote(privateKey,publicKey) {
	localPrivateKey = privateKey;
	localPublicKey = publicKey;

	// remote side already signaled it was ready?
	if (remotePublicKey != null) {
		pongResponse = null;

		// continue the key exchange
		return continueKeyExchange();
	}
	// try to connect with the remote side
	else {
		chan.postMessage({ ping: true, publicKey, });
		pongResponse = getDeferred();
		return pongResponse.pr;
	}
}

async function introduce(displayName) {
	var msg = await buildMessage(
		JSON.stringify({ displayName, }),
		sodium.from_base64(localPrivateKey,sodium.base64_variants.ORIGINAL),
		sharedKeys.sharedTx
	);

	chan.postMessage({ msg, });
}

async function sendToRemote(msgText) {
	var msg = await buildMessage(
		JSON.stringify({ chat: msgText, }),
		sodium.from_base64(localPrivateKey,sodium.base64_variants.ORIGINAL),
		sharedKeys.sharedTx
	);

	chan.postMessage({ msg, });
}

async function onChannelMessage(evt) {
	var data = evt.data || evt;
	if (data && typeof data == "object") {
		// remote side is ready with its
		// public key?
		if (data.ping) {
			// remote side re-connected?
			if (remotePublicKey != null) {
				await globalThis.onMessage({ remoteConnection: "reconnecting", });
			}

			remotePublicKey = data.publicKey;
			sharedKeys = null;

			// both sides of key exchange are ready?
			if (localPublicKey != null) {
				// continue the key exchange
				return continueKeyExchange();
			}
			// otherwise, still waiting on local registration/login
			else {
				return;
			}
		}
		// remote side is responding with its public key?
		else if (data.pong) {
			// don't yet have the remote public key?
			if (!remotePublicKey) {
				remotePublicKey = data.publicKey;
				sharedKeys = null;

				// both sides of key exchange are indeed ready?
				if (
					localPrivateKey != null &&
					localPublicKey != null
				) {
					return acceptKeyExchange();
				}
				else {
					console.log("Oops, unexpected pong received");
					return;
				}
			}
			// otherwise, send an ACK acknowledging we already
			// have the remote key
			else {
				ackKeyExchange();
				return;
			}
		}
		// remote side acknowledged successful key exchange
		else if (data.keyAck) {
			console.log("Key exchange complete.");
			if (pongResponse != null) {
				pongResponse.resolve();
				pongResponse = null;
				return;
			}
			else {
				return globalThis.onMessage({ remoteConnection: "reconnected", });
			}
		}
		// received encrypted message from remote?
		else if (data.msg) {
			return handleMessage(data.msg);
		}
	}

	// unknown message?
	console.log("Oops, unknown message",data);
}

async function handleMessage(msg) {
	try {
		msg = await readMessage(
			msg,
			sodium.from_base64(remotePublicKey,sodium.base64_variants.ORIGINAL),
			sharedKeys.sharedRx
		);
		msg = JSON.parse(msg);
		return globalThis.onMessage(msg);
	}
	catch (err) {
		throw new Error("Remote message invalid.",{ cause: err, });
	}

	throw new Error("Remote message invalid.",{ cause: err, });
}

async function continueKeyExchange() {
	sharedKeys = await deriveSharedKeys(
		sodium.from_base64(localPublicKey,sodium.base64_variants.ORIGINAL),
		sodium.from_base64(localPrivateKey,sodium.base64_variants.ORIGINAL),
		sodium.from_base64(remotePublicKey,sodium.base64_variants.ORIGINAL),
		/*isOriginator=*/true
	);

	chan.postMessage({
		pong: true,
		publicKey: localPublicKey,
	});
}

async function acceptKeyExchange() {
	sharedKeys = await deriveSharedKeys(
		sodium.from_base64(localPublicKey,sodium.base64_variants.ORIGINAL),
		sodium.from_base64(localPrivateKey,sodium.base64_variants.ORIGINAL),
		sodium.from_base64(remotePublicKey,sodium.base64_variants.ORIGINAL),
		/*isOriginator=*/false
	);

	// send an ACK to acknowledge the key exchange
	// being complete
	ackKeyExchange();
}

function ackKeyExchange() {
	chan.postMessage({ keyAck: true, });
	console.log("Key exchange complete.");
	if (pongResponse != null) {
		pongResponse.resolve();
		pongResponse = null;
	}
	else {
		throw new Error("Oops, shouldn't get here");
	}
}
