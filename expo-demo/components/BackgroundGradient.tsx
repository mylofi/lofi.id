import { Box } from "@gluestack-ui/themed";
import Gradient from "@/assets/Icons/Gradient";

export default function BackgroundGradient() {
	return (
		<Box
			position="absolute"
			$base-h={500}
			$base-w={500}
			$lg-h={500}
			$lg-w={500}
		>
			<Gradient />
		</Box>
	);
}
