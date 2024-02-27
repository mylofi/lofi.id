import AsyncStorage from "@react-native-async-storage/async-storage";
import sodium from "react-native-libsodium";

import { decryptText, encryptText } from "./pwa-data";
import { generateAsymmetricKey } from "./pwa-keys";
import { toMnemonic } from "./pwa-mnemonic";
import { logError } from "./pwa-utils";

import type { Dispatch, SetStateAction } from "react";
import type { Profile } from "@/context/CurrentProfileContext";
import type {
	LoginSession,
	UnpackedLoginSession,
} from "@/context/LoginSessionContext";

export async function register(
	profileName: string,
	registrationInfo: Profile,
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>,
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>
) {
	const keyInfo = generateAsymmetricKey();
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

	const loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
	return loginKeyWords;
}

async function onSyncProvide() {
	var includeProfileEl;
	var qrCodeHolderEl;
	var frameIndexEl;
	var frameCountEl;
	var qrCodeHolderDim;
	var qrCodeImgEl;
	var qrCodeCnvEl;
	var whichActiveElem = null;
	var frames = [];
	var framesLen = 0;
	var frameCache = [];
	var qrImg = null;
	var intv;
	var imgLoadPr;
	var imgLoadTrigger;

	await Swal.fire({
		title: "Provide Sync",
		html: `
			<p>
				<label>
					<input
						type="checkbox"
						id="include-profile-in-sync"
						class="swal2-checkbox"
						checked
					>
					Include full profile
				</label>
			</p>
			<p>
				Frame:
				<span id="qr-frame-index"></span> /
				<span id="qr-frame-count"></span>
			</p>
			<div id="sync-qr-code"></div>
		`,
		showConfirmButton: true,
		confirmButtonText: "Done",
		confirmButtonColor: "darkslateblue",

		showCancelButton: false,
		allowOutsideClick: false,
		allowEscapeKey: true,

		didOpen(popupEl) {
			includeProfileEl = document.getElementById(
				"include-profile-in-sync"
			);
			qrCodeHolderEl = document.getElementById("sync-qr-code");
			frameIndexEl = document.getElementById("qr-frame-index");
			frameCountEl = document.getElementById("qr-frame-count");

			qrCodeHolderDim = qrCodeHolderEl.getBoundingClientRect();

			includeProfileEl.addEventListener("change", generateFrames, false);
			generateFrames();
		},

		willClose(popupEl) {
			clearTimeout(intv);
			includeProfileEl.removeEventListener(
				"change",
				generateFrames,
				false
			);
			qrCodeImgEl.removeEventListener("load", onImgLoad, false);

			includeProfileEl =
				qrCodeHolderEl =
				qrCodeImgEl =
				qrCodeCnvEl =
				intv =
				qrImg =
				frames =
				frameCache =
				imgLoadPr =
				imgLoadTrigger =
					null;
		},
	});

	// ***********************

	function generateFrames() {
		if (intv != null) {
			clearTimeout(intv);
			intv = null;
		}

		var data = JSON.stringify({
			credentials: packKeyInfo(loginSession),
			...(includeProfileEl.checked ? { profile: currentProfile } : {}),
		});

		// break the JSON string into 50-character chunks
		frames = data.split(/([^]{50})/).filter(Boolean);
		framesLen = frames.length;
		frameCountEl.innerText = String(framesLen);
		var frameLengthDigits = String(framesLen).length;

		// prepare frame chunks list with index/frame-count headers
		frames = frames.map(
			(text, idx) =>
				`${String(idx).padStart(
					frameLengthDigits,
					"0"
				)}:${framesLen}:${text.padEnd(50, " ")}`
		);
		frameCache.length = 0;

		rotateFrame();
	}

	async function rotateFrame() {
		// still generating all the frames?
		//
		// NOTE: the reason for the "- 1" logic below is
		// this timer-based looping caches a frame entry
		// (previous title/src) on each NEXT iteration,
		// right before rendering that frame (title/src),
		// because we need to make sure the image actually
		// rendered to be able to read its `src` property
		// to cache it
		if (frameCache.length < framesLen - 1) {
			// first (overall) frame to render?
			if (!qrImg) {
				let frameText = frames.shift();
				// NOTE: parseInt() here is on purpose, because it
				// converts the leading, possibly-zero-padded, integer
				// from the frame header, which is its index
				frameIndexEl.innerText = String(parseInt(frameText, 10) + 1);

				// initialize the QR code renderer
				qrImg = new QRCode("sync-qr-code", {
					text: frameText,
					colorDark: "#000000",
					colorLight: "#ffffff",
					width: qrCodeHolderDim.width,
					height: qrCodeHolderDim.height,
					correctLevel: QRCode.CorrectLevel.H,
				});
				qrCodeImgEl = qrCodeHolderEl.querySelector("img");
				qrCodeCnvEl = qrCodeHolderEl.querySelector("canvas");

				qrCodeImgEl.addEventListener("load", onImgLoad, false);
			}
			// QR code renderer already present, so just
			// update the rendered image
			else {
				// NOT first frame of (re-)generated frames list?
				if (frames.length < framesLen) {
					// need to initially detect which element (img vs canvas)
					// the qr-code library is rendering with?
					if (whichActiveElem == null) {
						whichActiveElem =
							qrCodeImgEl.style.display != "none" &&
							qrCodeCnvEl.style.display == "none"
								? "img"
								: qrCodeImgEl.style.display == "none" &&
								  qrCodeCnvEl.style.display != "none"
								? "canvas"
								: null;

						// if detection failed, we have to bail
						if (whichActiveElem == null) {
							return showError(
								"QR code generation does not seem to work properly on this device."
							);
						}
					}

					// cache previous frame's title/src
					frameCache.push([
						qrCodeHolderEl.title,
						whichActiveElem == "img"
							? qrCodeImgEl.src
							: qrCodeCnvEl.toDataURL("image/png"),
					]);
				}

				let frameText = frames.shift();
				// NOTE: parseInt() here is on purpose, because it
				// converts the leading, possibly-zero-padded, integer
				// from the frame header, which is its index
				frameIndexEl.innerText = String(parseInt(frameText, 10) + 1);
				qrImg.makeCode(frameText);
			}
		}
		// all frames generated, so now process rendering
		// via the frame (title/src) cache
		else {
			// still need to cache the final frame (title/src)?
			if (frameCache.length == framesLen - 1) {
				frameCache.push([
					qrCodeHolderEl.title,
					whichActiveElem == "img"
						? qrCodeImgEl.src
						: qrCodeCnvEl.toDataURL("image/png"),
				]);
			}

			// rotate frame cache
			let frameEntry = frameCache.shift();
			frameCache.push(frameEntry);

			// render current frame (title/src)
			qrCodeHolderEl.title = frameEntry[0];
			qrCodeImgEl.src = frameEntry[1];
			if (whichActiveElem == "canvas") {
				await waitImage();
				qrCodeCnvEl.getContext("2d").drawImage(qrCodeImgEl, 0, 0);
			}

			// NOTE: parseInt() here is on purpose, because it
			// converts the leading, possibly-zero-padded, integer
			// from the frame header, which is its index
			frameIndexEl.innerText = String(parseInt(frameEntry[0], 10) + 1);
		}

		intv = setTimeout(rotateFrame, 150);
	}

	function onImgLoad() {
		if (imgLoadTrigger != null) {
			imgLoadTrigger();
		} else {
			imgLoadPr = Promise.resolve();
		}
	}

	function waitImage() {
		return (
			qrCodeImgEl.complete ||
			imgLoadPr ||
			(imgLoadPr = new Promise((r) => {
				imgLoadTrigger = r;
			})
				.then(() => {
					imgLoadPr = imgLoadTrigger = null;
				})
				.catch(() => {}))
		);
	}
}

export async function saveLoginSession(
	session: UnpackedLoginSession,
	setLoginSession: Dispatch<SetStateAction<LoginSession | null>>
) {
	setLoginSession(packKeyInfo(session));
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
	loginSession: UnpackedLoginSession,
	setCurrentProfile: Dispatch<SetStateAction<Profile | null>>
) {
	if (loginSession) {
		const currentProfile = profileInfo;
		setCurrentProfile(currentProfile);

		let profiles = await readStoredProfiles();
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
	loginSession: UnpackedLoginSession
): Promise<Profile | null> {
	let profiles = await readStoredProfiles();
	if (profiles[loginSession.profileName] && loginSession) {
		try {
			let json = await decryptText(
				profiles[loginSession.profileName],
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

export async function readStoredProfiles() {
	return JSON.parse((await AsyncStorage.getItem("profiles")) || "null") || {};
}

export function packKeyInfo(keyInfo: UnpackedLoginSession): LoginSession {
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

export function unpackKeyInfo(keyInfo: LoginSession) {
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
