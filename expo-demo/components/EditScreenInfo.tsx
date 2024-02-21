import React from "react";

import { ExternalLink } from "./ExternalLink";
import { Text, Box } from "@gluestack-ui/themed";

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <Box>
      <Box alignItems="center" marginHorizontal="$4">
        <Text
          textAlign="center"
          $light-color="rgba(0,0,0,0.8)"
          $dark-color="rgba(255,255,255,0.8)"
        >
          Open up the code for this screen:
        </Text>
        <Box
          borderRadius="$sm"
          paddingHorizontal="$1"
          marginVertical="$2"
          bg="$backgroundDark200"
        >
          <Text
            fontSize="$sm"
            lineHeight="$sm"
            textAlign="center"
            fontFamily="monospace"
          >
            {path}
          </Text>
        </Box>

        <Text
          textAlign="center"
          $light-color="rgba(0,0,0,0.8)"
          $dark-color="rgba(255,255,255,0.8)"
        >
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </Box>

      <Box marginTop="$4" marginHorizontal="$5" alignItems="center">
        <ExternalLink
          style={{ paddingVertical: 15 }}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text textAlign="center">
            Tap here if your app doesn't automatically update after making
            changes
          </Text>
        </ExternalLink>
      </Box>
    </Box>
  );
}
