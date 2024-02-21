import { useContext } from "react";
import { Box, ScrollView } from "@gluestack-ui/themed";

import Gradient from "@/assets/Icons/Gradient";
import { ServerAuthSessionContext } from "@/context/ServerAuthSessionContext";

import Account from "@/components/Account";
import Header from "@/components/Header";
import ServerAuth from "@/components/ServerAuth";

export default function Home() {
  const session = useContext(ServerAuthSessionContext);

  return (
    <Box flex={1} backgroundColor="$black">
      <ScrollView
        style={{ height: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box
          position="absolute"
          $base-h={500}
          $base-w={500}
          $lg-h={500}
          $lg-w={500}
        >
          <Gradient />
        </Box>

        <Box
          height="60%"
          $base-my="$16"
          $base-mx="$5"
          $base-height="80%"
          $lg-my="$24"
          $lg-mx="$5"
          justifyContent="space-between"
        >
          <Header />
          {session && session.user ? <Account /> : <ServerAuth />}
        </Box>
      </ScrollView>
    </Box>
  );
}
