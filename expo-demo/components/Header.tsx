import { Box, Heading, Image } from "@gluestack-ui/themed";

export default function Header({ children }: { children: React.ReactNode }) {
	return (
		<Box alignItems="center">
			<Image
				size="lg"
				source={{
					// TODO: Use a relative path to local asset instead.
					uri: "https://localfirstweb.dev/assets/images/logo.png",
				}}
				alt="Local-First Community Logo"
			/>

			<Heading color="$white" size="2xl">
				{children}
			</Heading>
		</Box>
	);
}
