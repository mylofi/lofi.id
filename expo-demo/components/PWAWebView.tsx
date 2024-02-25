import { forwardRef, useContext } from "react";
import { WebView } from "react-native-webview";

import { LoginSessionContext } from "@/context/LoginSessionContext";

import type { Dispatch, ForwardedRef, SetStateAction } from "react";

const webViewURL = process.env.EXPO_PUBLIC_WEBVIEW_URL;

if (!webViewURL) {
	throw new Error("Missing EXPO_PUBLIC_WEBVIEW_URL");
}

export default forwardRef(function (
	{
		setLoginKeyWords,
		setModalVisible,
	}: {
		setLoginKeyWords: Dispatch<SetStateAction<string>>;
		setModalVisible: Dispatch<SetStateAction<boolean>>;
	},
	ref: ForwardedRef<WebView>
) {
	const { setLoginSession } = useContext(LoginSessionContext);

	return (
		<WebView
			ref={ref}
			style={{ flex: 0 }}
			originWhitelist={["*"]}
			// TODO: Figure out how to inject html with https rather than using a separate server.
			source={{ uri: webViewURL }}
			onMessage={(message) => {
				const data = JSON.parse(message.nativeEvent.data);

				switch (data.type) {
					case "register":
						setLoginSession(data.payload.loginSession);

						// Show the registration confirmation modal with login keywords.
						setLoginKeyWords(data.payload.loginKeyWords);
						setModalVisible(true);

					default:
						console.log(`Unknown message type: ${data.type}`);
				}
			}}
		/>
	);
});
