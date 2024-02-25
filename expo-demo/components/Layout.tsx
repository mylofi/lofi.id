import { Box, ScrollView } from "@gluestack-ui/themed";

import BackgroundGradient from "@/components/BackgroundGradient";

import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
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
				>
					{children}
				</Box>
			</ScrollView>
		</Box>
	);
}
