// WARNING: this mnemonic algorithm uses the BIP39 wordlist,
// and is inspired by BIP39, but is in fact NOT compatible
// with BIP39!!
//
// References:
//   https://github.com/bitcoinjs/bip39
//   https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
//   https://medium.com/coinmonks/mnemonic-generation-bip39-simply-explained-e9ac18db9477

// NOTE: since "import attributes" is still currently in progress,
// using a top-level await + fetch hack for now
//
// References:
//   https://github.com/tc39/proposal-import-attributes
//   https://caniuse.com/?search=import%20attributes

import bip39Words from "./bip39-english.json"; // with { type: "json" };
import sodium from "react-native-libsodium";

// var bip39Words = await fetch(
// 	`${import.meta.url.match(/^(.*)\/[^\/]+$/)[1]}/external/bip39-english.json`
// ).then((res) => res.json());

export { toMnemonic, fromMnemonic };

// *************************

async function toMnemonic(ivBits) {
	try {
		// get the key's bits individually in a regular array
		let ivBitArray = Array.from(new Uint32Array(ivBits.buffer)).flatMap(
			(v) => Array.from(v.toString(2).padStart(32, "0"))
		);

		// compute the checksum bits and put them in a regular array
		let checksum = computeChecksum(ivBits);
		let checksumBitArray = Array.from(
			checksum.toString(2).padStart(ivBits.byteLength / 4, "0")
		);

		// split the bit arrays (`ivBitArray` + `checksumBitArray`)
		// into an array of 11-bit base10 numbers
		// (11 bits: 0 - 2047 in base10)
		let chunks = Array((ivBitArray.length + checksumBitArray.length) / 11)
			.fill(0)
			.map((_, idx) => {
				var bitStr = (
					(idx + 1) * 11 <= ivBitArray.length
						? ivBitArray.slice(idx * 11, (idx + 1) * 11)
						: ivBitArray.slice(idx * 11).concat(checksumBitArray)
				).join("");
				return Number(`0b${bitStr}`);
			});

		// map each value to the corresponding word in the BIP39
		// word list
		let words = chunks.map((v) => bip39Words[v]);

		return words;
	} catch (err) {
		throw new Error("Generating mnemonic from key failed.", { cause: err });
	}

	throw new Error("Generating mnemonic from key failed.");
}

async function fromMnemonic(words) {
	if (typeof words == "string") {
		words = words.split(" ");
	}

	try {
		var bitArray = words.flatMap((word) =>
			Array.from(bip39Words.indexOf(word).toString(2).padStart(11, "0"))
		);

		var ivBitArray = bitArray.slice(
			0,
			Math.ceil(((words.length - 1) * 11) / 8) * 8
		);
		var ivBits = new ArrayBuffer(ivBitArray.length / 8);
		var ivBits8 = new Uint8Array(ivBits);
		var ivBits32 = new Uint32Array(ivBits);
		Array(ivBits32.length)
			.fill(0)
			.forEach((_, idx) => {
				var bitStr = ivBitArray
					.slice(idx * 32, (idx + 1) * 32)
					.join("");
				ivBits32[idx] = Number(`0b${bitStr}`);
			});

		var checksumBitArray = bitArray.slice(ivBitArray.length);
		var decodedChecksum = Number(`0b${checksumBitArray.join("")}`);
		var checksum = computeChecksum(ivBits8);

		return [ivBits8, decodedChecksum === checksum];
	} catch (err) {
		throw new Error("Parsing seed from mnemonic failed.", { cause: err });
	}

	throw new Error("Parsing seed from mnemonic failed.");
}

function computeChecksum(bits) {
	console.log("sodium.crypto_hash:", sodium.crypto_hash);
	var hash = sodium.crypto_hash(bits).buffer;
	return new DataView(hash).getUint8(0) >>> (8 - bits.length / 4);
}
