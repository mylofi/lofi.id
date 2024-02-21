import { Box, Heading, Image } from "@gluestack-ui/themed";

export default function Header() {
  return (
    <Box alignItems="center">
      <Image
        size="md"
        source={{
          uri: "https://localfirstweb.dev/assets/images/logo.png",
        }}
        alt="Local First Web"
      />

      <Heading color="$white" size="2xl">
        Local-First Auth
      </Heading>
    </Box>
  );
}
