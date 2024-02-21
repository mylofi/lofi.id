import "./external/error-cause-polyfill/auto.js";
import { logError, sanitize, generateEntropy, cancelEvt, } from "./util.js"
import { generateAsymmetricKey, } from "./keys.js";
import { toMnemonic, fromMnemonic, } from "./mnemonic.js";
import { encryptText, decryptText, } from "./data.js";
import QRScanner from "/js/external/qr-scanner/qr-scanner.min.js";

var loginSession = null;
var currentProfile = null;

var profileDetailsEl = null;
var profileNotesEl = null;
var newNoteEl = null;
var logoutBtn = null;
var syncProvideBtn = null;
var deleteProfileBtn = null;
var addNoteBtn = null;

main().catch(logError);


// *************************

async function main() {
	profileDetailsEl = document.getElementById("profile-details");
	profileNotesEl = document.getElementById("profile-notes");
	newNoteEl = document.getElementById("new-note");
	logoutBtn = document.getElementById("logout-btn");
	syncProvideBtn = document.getElementById("sync-provide-btn");
	deleteProfileBtn = document.getElementById("delete-profile-btn");
	addNoteBtn = document.getElementById("add-note-btn");

	logoutBtn.addEventListener("click",onLogout,false);
	syncProvideBtn.addEventListener("click",onSyncProvide,false);
	deleteProfileBtn.addEventListener("click",promptConfirmDeleteProfile,false);
	newNoteEl.addEventListener("keypress",onNewNoteKeypress,false);
	addNoteBtn.addEventListener("click",addNote,false);

	loginSession = loginSession || JSON.parse(
		window.sessionStorage.getItem("login-session") ||
		"null"
	);
	if (loginSession) {
		loginSession.profileName = sanitize(loginSession.profileName);
		loginSession = unpackKeyInfo(loginSession);
		currentProfile = await getProfile(loginSession.profileName);
		if (currentProfile) {
			return showProfile();
		}
	}

	clearLoginSession();
	return promptWelcome();
}

function onLogout() {
	clearLoginSession();
	window.location.reload();
}

async function promptWelcome() {
	var result = await Swal.fire({
		title: "Welcome",
		showConfirmButton: true,
		confirmButtonText: "Login",
		confirmButtonColor: "darkslateblue",
		showDenyButton: true,
		denyButtonText: "Register",
		denyButtonColor: "darkslategray",
		showCancelButton: true,
		cancelButtonText: "Receive Sync",
		cancelButtonColor: "black",

		allowOutsideClick: false,
		allowEscapeKey: false,
	});

	if (result.isConfirmed) {
		return promptLogin();
	}
	else if (result.isDenied) {
		return register();
	}
	else {
		return promptSyncReceive();
	}
}

async function promptLogin() {
	var newProfile = null;
	var profiles = readStoredProfiles();

	// no profiles saved on this device yet?
	if (Object.keys(profiles).length == 0) {
		newProfile = await promptProfileName();

		if (newProfile) {
			// default profile entry
			profiles[newProfile] = currentProfile = null;
		}
		else {
			return promptWelcome();
		}
	}

	var selectedProfile = (
		newProfile ||
		(Object.keys(profiles).length == 1 ? Object.keys(profiles)[0] : null)
	);

	var loginResult = await Swal.fire({
		title: "Login",
		html: `
			<select
				id="login-profile-name"
				class="swal2-select"
			>
				<option value="">-- create new profile --</option>
				${
					Object.keys(profiles).map(profileName => (
						`<option
							value="${profileName}"
							${profileName == selectedProfile ? "selected" : ""}
						>
							${profileName}
						</option>`
					))
					.join("")
				}
			</select>
			<textarea
				id="login-key-words"
				class="swal2-textarea"
				placeholder="Login ID (word list)"
				rows="5"
				cols="27"
			></textarea>
		`,
		showConfirmButton: true,
		confirmButtonText: "Submit",
		confirmButtonColor: "darkslateblue",

		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: true,

		didOpen(popupEl) {
			var loginProfileNameEl = document.getElementById("login-profile-name");
			var loginKeyWordsEl = document.getElementById("login-key-words");
			if (loginProfileNameEl.selectedIndex > 0) {
				loginKeyWordsEl.focus();
			}
			else {
				loginProfileNameEl.focus();
			}

			popupEl.addEventListener("keypress",onKeypress,true);
		},

		willClose(popupEl) {
			popupEl.removeEventListener("keypress",onKeypress,true);
		},

		async preConfirm() {
			var loginProfileNameEl = document.getElementById("login-profile-name");
			var loginProfileName = loginProfileNameEl.value;
			var loginKeyWords = document.getElementById("login-key-words").value.trim().toLowerCase();

			if (loginProfileNameEl.selectedIndex > 0) {
				if (!loginProfileName || !(loginProfileName in profiles)) {
					Swal.showValidationMessage("Please select a valid profile for login.");
					return false;
				}
			}
			if (!/^(?:\w+ ){23}\w+$/.test(loginKeyWords)) {
				Swal.showValidationMessage("Login ID must be exactly 24 words, separated by spaces.");
				return false;
			}

			var [ decodedIV, checksumValid ] = await fromMnemonic(loginKeyWords);

			if (!checksumValid) {
				Swal.showValidationMessage("Login ID is invalid.");
				return false;
			}

			return { loginProfileName, decodedIV, };
		},
	});

	if (loginResult.isConfirmed) {
		let { loginProfileName, decodedIV, } = loginResult.value;

		// need to prompt for a new profile name?
		if (!loginProfileName) {
			loginProfileName = await promptProfileName();
			// profile name not entered?
			if (!loginProfileName) {
				clearLoginSession();
				return promptWelcome();
			}
		}

		// try to re-generate keys from login ID (word list)
		try {
			let keyInfo = generateAsymmetricKey(decodedIV);
			saveLoginSession({
				profileName: loginProfileName,
				...keyInfo,
			});
		}
		catch (err) {
			clearLoginSession();
			await showError("Login ID could not be processed.");
		}

		// credentials successful?
		if (loginSession && loginSession.profileName) {
			// already a valid profile (on this device)?
			if (profiles[loginSession.profileName]) {
				currentProfile = await getProfile(loginSession.profileName);
				if (currentProfile) {
					return showProfile();
				}
				else {
					clearLoginSession();
					await showError("Login failed.");
				}
			}
			// otherwise, initialize (or sync) an profile
			else {
				// TODO: offer prompt to instead sync a profile
				// from another device
				let registrationInfo = await promptRegistration();
				if (registrationInfo) {
					if (await saveProfile(loginSession.profileName,registrationInfo)) {
						currentProfile = registrationInfo;
						return showProfile();
					}
					else {
						clearLoginSession();
						await showError("Profile on this device not initialized. Please try again.");
					}
				}
			}
		}
	}

	return promptWelcome();


	// ***********************

	function onKeypress(evt) {
		if (
			evt.key == "Enter" &&
			evt.target.matches(".swal2-input, .swal2-select, .swal2-textarea")
		) {
			cancelEvt(evt);
			Swal.clickConfirm();
		}
	}
}

async function register() {
	var profileName = await promptProfileName();
	if (!profileName) {
		return promptWelcome();
	}

	var registrationInfo = await promptRegistration();
	if (!registrationInfo) {
		return promptWelcome();
	}

	var keyInfo = await generateAsymmetricKey();
	saveLoginSession({
		profileName,
		...keyInfo,
	});

	if (await saveProfile(profileName,registrationInfo)) {
		currentProfile = registrationInfo;
	}
	else {
		clearLoginSession();
		await showError("Profile registration not saved. Please try again.");
		return promptWelcome();
	}

	var loginKeyWords = (await toMnemonic(keyInfo.iv)).join(" ");
	await confirmRegistration(profileName,loginKeyWords);

	return showProfile();
}

async function promptRegistration() {
	var registrationResult = await Swal.fire({
		title: "Profile",
		html: `
			<label>
				First Name:
				<input
					type="text"
					id="register-first-name"
					class="swal2-input"
				>
			</label>
			<label>
				Last Name:
				<input
					type="text"
					id="register-last-name"
					class="swal2-input"
				>
			</label>
			<label>
				Email:
				<input
					type="text"
					id="register-email"
					class="swal2-input"
				>
			</label>
		`,
		showConfirmButton: true,
		confirmButtonText: "Submit",
		confirmButtonColor: "darkslateblue",

		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: true,

		didOpen(popupEl) {
			var firstNameEl = document.getElementById("register-first-name");
			firstNameEl.focus();

			popupEl.addEventListener("keypress",onKeypress,true);
		},

		willClose(popupEl) {
			popupEl.removeEventListener("keypress",onKeypress,true);
		},

		async preConfirm() {
			var firstName = document.getElementById("register-first-name").value.trim();
			var lastName = document.getElementById("register-last-name").value.trim();
			var email = document.getElementById("register-email").value.trim().toLowerCase();

			if (!firstName) {
				Swal.showValidationMessage("Please enter your first name.");
				return false;
			}
			if (!lastName) {
				Swal.showValidationMessage("Please enter your last name.");
				return false;
			}
			if (!email || !/[^@]+@[^@.]+(?:\.[^]+)+/.test(email)) {
				Swal.showValidationMessage("Please enter a valid email address.");
				return false;
			}

			return { firstName, lastName, email, };
		},
	});

	return (registrationResult.isConfirmed ? registrationResult.value : null);


	// ***********************

	function onKeypress(evt) {
		if (
			evt.key == "Enter" &&
			evt.target.matches(".swal2-input, .swal2-select, .swal2-textarea")
		) {
			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
			Swal.clickConfirm();
		}
	}
}

async function promptProfileName() {
	var profiles = readStoredProfiles();
	var result = await Swal.fire({
		title: "Profile Name",
		text: "Please enter a profile name (username).",
		input: "text",
		inputAttributes: {
			maxlength: "30",
		},
		showConfirmButton: true,
		confirmButtonText: "Create",
		confirmButtonColor: "darkslateblue",

		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: true,

		inputValidator(profileName) {
			profileName = sanitize(profileName);
			if (profileName == "" || profileName.length > 30) {
				return "Please enter a value from 1-30 characters.";
			}
		},

		preConfirm(profileName) {
			profileName = sanitize(profileName);
			if (profileName in profiles) {
				Swal.showValidationMessage(`Profile '${profileName}' is already registered on this device.`);
				return false;
			}
			return sanitize(profileName);
		},
	});

	return (result.isConfirmed ? result.value : null);
}

async function confirmRegistration(profileName,loginKeyWords) {
	return Swal.fire({
		title: "Profile Registered",
		text: `These words are your unique login ID for profile '${profileName}'. You'll need them each time you login!`,
		input: "textarea",
		inputValue: loginKeyWords,
		inputAttributes: {
			readonly: "",
			rows: "5",
			cols: "27",
		},
		showConfirmButton: true,
		confirmButtonText: "Login",
		confirmButtonColor: "darkslateblue",

		showCancelButton: false,
		allowOutsideClick: false,
		allowEscapeKey: false,
	});
}

async function promptConfirmDeleteProfile() {
	var result = await Swal.fire({
		title: "Delete Profile?",
		text: `Are you SURE you want to delete profile '${loginSession.profileName}' from this device? This cannot be undone!`,
		showConfirmButton: true,
		confirmButtonText: "Delete",
		confirmButtonColor: "darkslateblue",
		showCancelButton: true,
		cancelButtonText: "Cancel",
		cancelButtonColor: "darkslategray",
	});
	if (result.isConfirmed) {
		profileDetailsEl.classList.add("hidden");
		let profiles = readStoredProfiles();
		delete profiles[loginSession.profileName];
		window.localStorage.setItem(
			"profiles",
			JSON.stringify(profiles)
		);
		onLogout();
	}
}

async function showProfile() {
	if (!currentProfile) {
		currentProfile = await getProfile(loginSession.profileName);
	}

	var currentProfileNameEl = document.getElementById("current-profile-name");
	var profileInfoEl = document.getElementById("profile-info");

	currentProfileNameEl.innerText = loginSession.profileName;
	profileInfoEl.innerText = `${currentProfile.firstName} ${currentProfile.lastName}, ${currentProfile.email}`;

	renderNotes();
	profileNotesEl.addEventListener("click",onNotesClick,true);
	profileDetailsEl.classList.remove("hidden");
}

function renderNotes() {
	var notesHTML = "";

	if (Array.isArray(currentProfile.notes) && currentProfile.notes.length > 0) {
		for (let note of currentProfile.notes) {
			notesHTML += `
				<li data-note-id="${note.id}">
					<p>${note.text}</p>
					<button type="button">delete</button>
				</li>
			`;
		}
	}
	profileNotesEl.innerHTML = notesHTML;
}

function onNewNoteKeypress(evt) {
	if (evt.key == "Enter") {
		cancelEvt(evt);
		addNote();
	}
}

async function onNotesClick(evt) {
	if (evt.target.matches("li[data-note-id] button")) {
		let noteID = evt.target.closest("li").dataset.noteId;
		await deleteNote(noteID);
		renderNotes();
	}
}

async function addNote() {
	var newNote = newNoteEl.value;
	newNote = newNote.replace(/[<>]/g,"");
	if (newNote != "") {
		newNoteEl.value = "";
		let noteEntry = {
			id: sodium.to_base64(generateEntropy(32),sodium.base64_variants.ORIGINAL),
			text: newNote,
		};
		currentProfile.notes = (currentProfile.notes || []);
		currentProfile.notes.push(noteEntry);
		await saveProfile(loginSession.profileName,currentProfile);
		renderNotes();
	}
	setTimeout(() => newNoteEl.focus(),50);
}

async function deleteNote(noteID) {
	currentProfile.notes = currentProfile.notes.filter(note => note.id != noteID);
	await saveProfile(loginSession.profileName,currentProfile);
	renderNotes();
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
			includeProfileEl = document.getElementById("include-profile-in-sync");
			qrCodeHolderEl = document.getElementById("sync-qr-code");
			frameIndexEl = document.getElementById("qr-frame-index");
			frameCountEl = document.getElementById("qr-frame-count");

			qrCodeHolderDim = qrCodeHolderEl.getBoundingClientRect();

			includeProfileEl.addEventListener("change",generateFrames,false);
			generateFrames();
		},

		willClose(popupEl) {
			clearTimeout(intv);
			includeProfileEl.removeEventListener("change",generateFrames,false);
			qrCodeImgEl.removeEventListener("load",onImgLoad,false);

			includeProfileEl = qrCodeHolderEl = qrCodeImgEl = qrCodeCnvEl =
				intv = qrImg = frames = frameCache = imgLoadPr =
				imgLoadTrigger = null;
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
			...(includeProfileEl.checked ? { profile: currentProfile, } : {}),
		});

		// break the JSON string into 50-character chunks
		frames = data.split(/([^]{50})/).filter(Boolean);
		framesLen = frames.length;
		frameCountEl.innerText = String(framesLen);
		var frameLengthDigits = String(framesLen).length;

		// prepare frame chunks list with index/frame-count headers
		frames = frames.map((text,idx) => `${String(idx).padStart(frameLengthDigits,"0")}:${framesLen}:${text.padEnd(50," ")}`);
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
		if (frameCache.length < (framesLen - 1)) {
			// first (overall) frame to render?
			if (!qrImg) {
				let frameText = frames.shift();
				// NOTE: parseInt() here is on purpose, because it
				// converts the leading, possibly-zero-padded, integer
				// from the frame header, which is its index
				frameIndexEl.innerText = String(parseInt(frameText,10) + 1);

				// initialize the QR code renderer
				qrImg = new QRCode("sync-qr-code",{
					text: frameText,
					colorDark : "#000000",
					colorLight : "#ffffff",
					width: qrCodeHolderDim.width,
					height: qrCodeHolderDim.height,
					correctLevel : QRCode.CorrectLevel.H,
				});
				qrCodeImgEl = qrCodeHolderEl.querySelector("img");
				qrCodeCnvEl = qrCodeHolderEl.querySelector("canvas");

				qrCodeImgEl.addEventListener("load",onImgLoad,false);
			}
			// QR code renderer already present, so just
			// update the rendered image
			else {
				// NOT first frame of (re-)generated frames list?
				if (frames.length < framesLen) {
					// need to initially detect which element (img vs canvas)
					// the qr-code library is rendering with?
					if (whichActiveElem == null) {
						whichActiveElem = (
							(qrCodeImgEl.style.display != "none" && qrCodeCnvEl.style.display == "none") ? "img" :
							(qrCodeImgEl.style.display == "none" && qrCodeCnvEl.style.display != "none") ? "canvas" :
							null
						);

						// if detection failed, we have to bail
						if (whichActiveElem == null) {
							return showError("QR code generation does not seem to work properly on this device.");
						}
					}

					// cache previous frame's title/src
					frameCache.push([
						qrCodeHolderEl.title,
						(
							whichActiveElem == "img" ?
								qrCodeImgEl.src :
								qrCodeCnvEl.toDataURL("image/png")
						)
					]);
				}

				let frameText = frames.shift();
				// NOTE: parseInt() here is on purpose, because it
				// converts the leading, possibly-zero-padded, integer
				// from the frame header, which is its index
				frameIndexEl.innerText = String(parseInt(frameText,10) + 1);
				qrImg.makeCode(frameText);
			}
		}
		// all frames generated, so now process rendering
		// via the frame (title/src) cache
		else {
			// still need to cache the final frame (title/src)?
			if (frameCache.length == (framesLen - 1)) {
				frameCache.push([
					qrCodeHolderEl.title,
					(
						whichActiveElem == "img" ?
							qrCodeImgEl.src :
							qrCodeCnvEl.toDataURL("image/png")
					)
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
				qrCodeCnvEl.getContext("2d").drawImage(qrCodeImgEl,0,0);
			}

			// NOTE: parseInt() here is on purpose, because it
			// converts the leading, possibly-zero-padded, integer
			// from the frame header, which is its index
			frameIndexEl.innerText = String(parseInt(frameEntry[0],10) + 1);
		}

		intv = setTimeout(rotateFrame,150);
	}

	function onImgLoad() {
		if (imgLoadTrigger != null) {
			imgLoadTrigger();
		}
		else {
			imgLoadPr = Promise.resolve();
		}
	}

	function waitImage() {
		return (
			qrCodeImgEl.complete ||
			imgLoadPr ||
			(
				imgLoadPr = new Promise(r => { imgLoadTrigger = r; })
				.then(() => { imgLoadPr = imgLoadTrigger = null; })
				.catch(()=>{})
			)
		);
	}
}

async function promptSyncReceive() {
	var qrCameraScannerEl;
	var videoEl;
	var framesReadEl;
	var frameCountEl;
	var scanner;
	var scannedFrames = [];
	var syncData = null;

	await Swal.fire({
		title: "Receive Sync",
		html: `
			<p>
				To synchronize credentials/profile from another device,
				display the flashing QR code images on that device, then
				scan with this device here, using your camera.
			</p>
			<p>
				Frames Read:
				<span id="qr-frames-read">--</span> /
				<span id="qr-frame-count">--</span>
			</p>
			<div id="qr-camera-scanner">
				<video></video>
			</div>
		`,
		showConfirmButton: false,
		showCancelButton: true,
		allowOutsideClick: false,
		allowEscapeKey: true,
		// customClass: {
		// 	popup: "prompt-popup",
		// },

		didOpen(popupEl) {
			qrCameraScannerEl = document.getElementById("qr-camera-scanner");
			videoEl = qrCameraScannerEl.querySelector("video");
			framesReadEl = document.getElementById("qr-frames-read");
			frameCountEl = document.getElementById("qr-frame-count");

			scanner = new QRScanner(videoEl,onDecoded,{
				onDecodeError,
				maxScansPerSecond: 10,
				preferredCamera: "environment",
				highlightScanRegion: true,
			});
			scanner.start();
		},

		willClose(popupEl) {
			scanner.stop();

			qrCameraScannerEl = videoEl = framesReadEl = frameCountEl =
				scanner = null;
		},
	});

	if (syncData) {
		return promptAcceptSync(syncData);
	}
	else {
		return promptWelcome();
	}

	// ***********************


	function onDecoded(result) {
		var decodedData = result.data;
		if (/^\d+:\d+:.+/.test(decodedData)) {
			let [ , frameIndex, frameCount, frameText ] = decodedData.match(/^(\d+):(\d+):(.+)$/);
			frameIndex = Number(frameIndex);
			frameCount = Number(frameCount);
			scannedFrames[frameIndex] = frameText;

			// update frame counters
			var framesRead = scannedFrames.filter(Boolean).length;
			framesReadEl.innerText = String(framesRead);
			frameCountEl.innerText = String(frameCount);

			// read all expected frames?
			if (framesRead == frameCount) {
				try {
					let data = JSON.parse(scannedFrames.join(""));
					if (!(
						data.credentials &&
						"profileName" in data.credentials &&
						"iv" in data.credentials &&
						"privateKey" in data.credentials
					)) {
						throw new Error("Synchronization missing valid credentials");
					}
					syncData = data;
					Swal.close();
				}
				catch (err) {
					return showError("Synchronization failed. Please try again.");
				}
			}
		}
	}

	async function onDecodeError(err) {
		if (!/no qr code found/i.test(err)) {
			console.log(err);
		}
	}
}

async function promptAcceptSync(syncData) {
	var result = await Swal.fire({
		title: "Accept Sync?",
		text: `
			Credentials${("profile" in syncData) ? " and profile data" : ""} synchronized
			for '${syncData.credentials.profileName}'. Do you want to accept and store
			that information on this device?
		`,
		showConfirmButton: true,
		confirmButtonText: "Yes",
		confirmButtonColor: "darkslateblue",
		showDenyButton: true,
		denyButtonText: "Ignore",
		denyButtonColor: "darkslategray",
		showCancelButton: false,

		allowOutsideClick: false,
		allowEscapeKey: false,
	});

	if (result.isConfirmed) {
		saveLoginSession(unpackKeyInfo(syncData.credentials));
		if (syncData.profile) {
			await saveProfile(loginSession.profileName,syncData.profile);
			return showProfile();
		}
		else {
			currentProfile = await getProfile(loginSession.profileName);
			if (currentProfile) {
				return showProfile();
			}
			else {
				let registrationInfo = await promptRegistration();
				if (registrationInfo) {
					if (await saveProfile(loginSession.profileName,registrationInfo)) {
						currentProfile = registrationInfo;
						return showProfile();
					}
					else {
						clearLoginSession();
						await showError("Profile on this device not initialized. Please try again.");
					}
				}
			}
		}
	}

	return promptWelcome();
}

function showError(errMsg) {
	return Swal.fire({
		title: "Error!",
		text: errMsg,
		icon: "error",
		confirmButtonText: "ok",
	});
}

function saveLoginSession(session) {
	loginSession = session;
	window.sessionStorage.setItem("login-session",JSON.stringify(packKeyInfo(session)));
}

function clearLoginSession() {
	window.sessionStorage.removeItem("login-session");
	loginSession = currentProfile = null;
}

async function saveProfile(profileName,profileInfo) {
	if (loginSession) {
		currentProfile = profileInfo;
		let profiles = readStoredProfiles();
		profiles[profileName] = await encryptText(
			JSON.stringify(currentProfile),
			loginSession.encPK
		);
		window.localStorage.setItem(
			"profiles",
			JSON.stringify(profiles)
		);
		return true;
	}
}

async function getProfile(profileName) {
	let profiles = readStoredProfiles();
	if (profiles[profileName] && loginSession) {
		try {
			let json = await decryptText(
				profiles[profileName],
				loginSession.encPK,
				loginSession.encSK
			);
			let profile = JSON.parse(json);
			if (!(profile != null && "firstName" in profile)) {
				throw new Error("Profile not opened.");
			}
			return profile;
		}
		catch (err) {
			logError(err);
		}
	}
	return null;
}

function readStoredProfiles() {
	return (
		JSON.parse(
			window.localStorage.getItem("profiles") ||
			"null"
		) ||
		{}
	);
}

function packKeyInfo(keyInfo) {
	return Object.assign(
		{ ...keyInfo },
		Object.fromEntries(
			Object.entries(keyInfo)
			.filter(([ key, ]) => (
				[ "publicKey", "privateKey", "encPK", "encSK", "iv", ].includes(key)
			))
			.map(([ key, value ]) => [
				key,
				sodium.to_base64(value,sodium.base64_variants.ORIGINAL)
			])
		)
	);
}

function unpackKeyInfo(keyInfo) {
	return Object.assign(
		{ ...keyInfo },
		Object.fromEntries(
			Object.entries(keyInfo)
			.filter(([ key, ]) => (
				[ "publicKey", "privateKey", "encPK", "encSK", "iv", ].includes(key)
			))
			.map(([ key, value ]) => [
				key,
				sodium.from_base64(value,sodium.base64_variants.ORIGINAL)
			])
		)
	);
}
