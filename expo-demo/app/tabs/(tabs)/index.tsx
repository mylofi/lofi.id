import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, Center, Heading, Divider } from "@gluestack-ui/themed";

export default function Home() {
  return (
    <Center flex={1}>
      <Heading bold size="2xl">
        Expo V3
      </Heading>
      <Divider marginVertical={30} width="80%" />
      <Text p="$4">Example below to use gluestack-ui components.</Text>
      <EditScreenInfo path="app/(app)/(tabs)/index.tsx" />
    </Center>
  );
}
