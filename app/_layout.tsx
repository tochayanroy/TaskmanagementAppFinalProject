import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      setIsLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  if (!isLoggedIn) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="Register" />
      </Stack>
    );
  }

  return <Slot />;
}
