import { register } from "./app.js";

window.addEventListener("message", (event) => {
	const data = JSON.parse(event.data);

	switch (data.type) {
		case "register":
			register(data.payload.profileName, data.payload.registrationInfo);
			break;

		default:
			alert(`Unknown message type: ${data.type}`);
	}
});
