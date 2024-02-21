import { useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
  VStack,
} from "@gluestack-ui/themed";
import { ServerAuthSessionContext } from "@/context/ServerAuthSessionContext";

export default function Form() {
  const session = useContext(ServerAuthSessionContext);

  const [savedString, setSavedString] = useState("");
  const [currentString, setCurrentString] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveString(stringToSave: string) {
    setLoading(true);

    try {
      if (!session) throw new Error("User not logged in!");
      await AsyncStorage.setItem(session.user.id, stringToSave);
      setSavedString(stringToSave);
    } catch (e) {
      // saving error
    }

    setLoading(false);
  }

  async function getSavedString() {
    try {
      if (!session) throw new Error("User not logged in!");
      const value = await AsyncStorage.getItem(session.user.id);
      if (value !== null) {
        setSavedString(value);
        setCurrentString(value);
      }
    } catch (e) {
      // error reading value
    }
  }

  useEffect(() => {
    getSavedString();
  }, []);

  return (
    <VStack space="sm">
      <FormControl
        size="md"
        isDisabled={loading}
        isInvalid={currentString !== savedString}
      >
        <FormControlLabel>
          <FormControlLabelText color="$white">
            Type something to save...
          </FormControlLabelText>
        </FormControlLabel>

        <Input variant="outline" size="md">
          <InputField
            color="$white"
            onChangeText={(text) => setCurrentString(text)}
            value={currentString}
            placeholder="Type here..."
            autoCapitalize="none"
          />
        </Input>

        <FormControlError>
          <FormControlErrorText>Not saved!</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <Button
        size="md"
        variant="solid"
        action="primary"
        isDisabled={loading || currentString === savedString}
        onPress={() => saveString(currentString)}
      >
        <ButtonText>
          {currentString === "" || currentString !== savedString
            ? "Save"
            : "Saved"}
        </ButtonText>
      </Button>
    </VStack>
  );
}
