import { useState } from "react";
import { Alert } from "react-native";
import {
  Button,
  ButtonText,
  Input,
  InputField,
  VStack,
} from "@gluestack-ui/themed";

import { supabase } from "@/lib/supabase";

export default function ServerAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <VStack space="3xl" m="$3">
      <VStack space="sm">
        <Input variant="outline" size="md" isDisabled={loading}>
          <InputField
            color="$white"
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
          />
        </Input>

        <Input variant="outline" size="md" isDisabled={loading}>
          <InputField
            color="$white"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
          />
        </Input>
      </VStack>

      <VStack space="sm">
        <Button
          size="md"
          variant="solid"
          action="primary"
          isDisabled={loading}
          onPress={() => signInWithEmail()}
        >
          <ButtonText>Sign In</ButtonText>
        </Button>

        <Button
          size="md"
          variant="solid"
          action="primary"
          isDisabled={loading}
          onPress={() => signUpWithEmail()}
        >
          <ButtonText>Sign Up</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
