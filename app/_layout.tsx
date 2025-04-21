import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Slot } from "expo-router";

export default function Layout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem("userToken");

      if (isLoggedIn) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/register");
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);


  useEffect(() => {
    const checkStoredToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth/login");
      }
    };
  
    checkStoredToken();
  }, []);

  return (
    <>
      <Slot />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
