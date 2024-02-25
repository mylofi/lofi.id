import { forwardRef, useContext } from "react";
import { WebView } from "react-native-webview";

import { LoginSessionContext } from "@/context/LoginSessionContext";

import type { Dispatch, ForwardedRef, SetStateAction } from "react";

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
			source={{ uri: "http://192.168.1.5:3000/webview" }}
			onMessage={(message) => {
				const data = JSON.parse(message.nativeEvent.data);

				switch (data.type) {
					case "register":
						setLoginSession(data.payload.loginSession);

						// Show the registration confirmation modal with login keywords.
						setLoginKeyWords(data.payload.loginKeyWords);
						setModalVisible(true);
				}
			}}
		/>
	);
});
