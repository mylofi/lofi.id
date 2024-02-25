import { register } from "./app.js";

window.addEventListener("message", async (event) => {
	let data;

	try {
		data = JSON.parse(event.data);
	} catch (error) {
		alert(`Error parsing message: ${error}`);
		return;
	}

	switch (data.type) {
		case "register":
			await register(
				data.payload.profileName,
				data.payload.registrationInfo
			);
			break;

		default:
			alert(`Unknown message type: ${data.type}`);
	}
});
