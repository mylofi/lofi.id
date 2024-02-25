import { useContext } from "react";
import { router } from "expo-router";
import { Button, ButtonText, Heading, VStack } from "@gluestack-ui/themed";

import { LoginSessionContext } from "@/context/LoginSessionContext";
import AuthLayout from "@/components/AuthLayout";

export default function AppIndex() {
	const { setLoginSession } = useContext(LoginSessionContext);

	return (
		<AuthLayout>
			<VStack space="4xl">
				<Heading color="$white" size="2xl">
					You are logged in
				</Heading>

				<Button
					size="md"
					variant="solid"
					action="primary"
					onPress={() => {
						// TODO: Clear from device storage. See clearLoginSession.
						setLoginSession(null);
						router.navigate("/welcome");
					}}
				>
					<ButtonText>Log Out</ButtonText>
				</Button>
			</VStack>
		</AuthLayout>
	);
}
