import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../store/useAuthStore";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
import SplashScreen from "../screens/splashScreen";

export default function RootNavigator() {
  const { token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Küçük gecikme persist'in AsyncStorage'dan yüklenmesi için yeterli
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
