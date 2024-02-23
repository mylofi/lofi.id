import sodium from "react-native-libsodium";

export { generateEntropy, getDeferred, logError, sanitize, cancelEvt };

// *************************

function generateEntropy(numBytes = 16) {
	return sodium.randombytes_buf(numBytes);
}

function getDeferred() {
	var def = {};
	def.pr = new Promise((res) => (def.resolve = res));
	return def;
}

function logError(err, returnLog = false) {
	var err = `${err.stack ? err.stack : err.toString()}${
		err.cause ? `\n${logError(err.cause, /*returnLog=*/ true)}` : ""
	}`;
	if (returnLog) return err;
	else console.error(err);
}

function sanitize(text) {
	return text.replace(/[^a-zA-Z0-9\s\.,\/_\-#@!$%^&*~`'"+=:?]+/g, "");
}

function cancelEvt(evt) {
	if (evt && evt.preventDefault) {
		evt.preventDefault();
		evt.stopPropagation();
		evt.stopImmediatePropagation();
	}
}
export function packKeyInfo(keyInfo) {
	console.log("PWA-utils packKeyInfo: ", keyInfo);
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
