import { useState } from "react";
import { Alert } from "react-native";
import { Button, ButtonText, VStack } from "@gluestack-ui/themed";

import { supabase } from "@/lib/supabase";
import Form from "./Form";

export default function Account() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <VStack space="4xl" m="$3">
      <Form />

      <Button
        size="md"
        variant="solid"
        action="primary"
        isDisabled={loading}
        onPress={() => logout()}
      >
        <ButtonText>Log Out</ButtonText>
      </Button>
    </VStack>
  );
}
