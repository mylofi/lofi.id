import { useContext } from "react";
import { Box, ScrollView } from "@gluestack-ui/themed";

import { ServerAuthSessionContext } from "@/context/ServerAuthSessionContext";

import Account from "@/components/Account";
import BackgroundGradient from "@/components/BackgroundGradient";
import Header from "@/components/Header";
import LocalAuth from "@/components/LocalAuth";

export default function Home() {
	const session = useContext(ServerAuthSessionContext);

	return (
		<Box flex={1} backgroundColor="$black">
			<ScrollView
				style={{ height: "100%" }}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<BackgroundGradient />

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
					{session && session.user ? <Account /> : <LocalAuth />}
				</Box>
			</ScrollView>
		</Box>
	);
}
