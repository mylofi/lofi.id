import { Box, Heading, Image } from "@gluestack-ui/themed";

export default function Header({ children }: { children: React.ReactNode }) {
	return (
		<Box alignItems="center">
			<Image
				size="lg"
				source={{
					uri: "https://localfirstweb.dev/assets/images/logo.png",
				}}
				alt="Local First Web"
			/>

			<Heading color="$white" size="2xl">
				{children}
			</Heading>
		</Box>
	);
}
