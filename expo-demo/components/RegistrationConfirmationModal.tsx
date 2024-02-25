import { useContext } from "react";
import { router } from "expo-router";
import {
	AlertDialog,
	AlertDialogBackdrop,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Button,
	ButtonText,
	HStack,
	Heading,
	Icon,
	Text,
	Textarea,
	TextareaInput,
	VStack,
} from "@gluestack-ui/themed";

import { LoginSessionContext } from "@/context/LoginSessionContext";

export default function RegistrationConfirmationModal({
	loginKeyWords,
	modalVisible,
}: {
	loginKeyWords: string;
	modalVisible: boolean;
}) {
	const { loginSession } = useContext(LoginSessionContext);

	return (
		<AlertDialog isOpen={modalVisible}>
			<AlertDialogBackdrop />
			<AlertDialogContent>
				<AlertDialogHeader>
					<VStack space="xs">
						<HStack space="sm" alignItems="center">
							{/* <Icon
									as={CheckCircleIcon}
									color="$success700"
									$dark-color="$success300"
								/> */}
							<Heading size="lg">Profile Registered</Heading>
						</HStack>

						<Text size="sm">
							These words are your unique login ID for profile '
							{loginSession?.profileName}'. You'll need them each
							time you login!
						</Text>
					</VStack>
				</AlertDialogHeader>
				<AlertDialogBody>
					<Textarea size="sm" isReadOnly={true}>
						<TextareaInput value={loginKeyWords} />
					</Textarea>
				</AlertDialogBody>
				<AlertDialogFooter borderTopWidth="$0">
					{/* TODO: Add copy to clipboard button? */}
					<Button
						variant="solid"
						size="sm"
						action="primary"
						onPress={() => router.navigate("/")}
					>
						<ButtonText>Login</ButtonText>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
