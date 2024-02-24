import WebView from "react-native-webview";

export default function Pwa() {
	return (
		<>
			<WebView
				source={{
					uri: "https://lofi-id.getify.com/",
				}}
				userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36"
				originWhitelist={["*"]}
				allowsInlineMediaPlayback
				javaScriptEnabled
				scalesPageToFit
				allowInlineMediaPlayback={true}
				mediaPlaybackRequiresUserAction={false}
				startInLoadingState
				onNavigationStateChange={(val) => {
					console.log(val);
				}}
				javaScriptEnabledAndroid
				geolocationEnabled={true}
				useWebkit
			/>
		</>
	);
}
