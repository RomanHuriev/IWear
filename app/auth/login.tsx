import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "../../firebase/firebaseConfig";
import { Svg, Path } from "react-native-svg";
import { auth as styles } from "@/styles/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log(`id token : ${token}`);
      console.log(`refresh Token: ${user.refreshToken}`);
      await AsyncStorage.setItem("userToken", token);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Something went wrong during login";
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
    } catch (error: any) {
      console.error("Google login error:", error);
      Alert.alert("Error", "Failed to sign in with Google");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authorization</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email:</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password:</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#888"
        />
      </View>

      <Text style={styles.text}>or continue with</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <View style={{ marginRight: 10 }}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3.064 7.51C3.89637 5.85353 5.17282 4.46106 6.7508 3.48806C8.32878 2.51507 10.1462 1.99987 12 2C14.695 2 16.959 2.991 18.69 4.605L15.823 7.473C14.786 6.482 13.468 5.977 12 5.977C9.395 5.977 7.19 7.737 6.405 10.1C6.205 10.7 6.091 11.34 6.091 12C6.091 12.66 6.205 13.3 6.405 13.9C7.191 16.264 9.395 18.023 12 18.023C13.345 18.023 14.49 17.668 15.386 17.068C15.9054 16.726 16.3501 16.2822 16.6932 15.7635C17.0363 15.2448 17.2706 14.6619 17.382 14.05H12V10.182H21.418C21.536 10.836 21.6 11.518 21.6 12.227C21.6 15.273 20.51 17.837 18.618 19.577C16.964 21.105 14.7 22 12 22C10.6866 22.0005 9.38604 21.7422 8.17254 21.2399C6.95905 20.7375 5.85645 20.0009 4.92776 19.0722C3.99907 18.1436 3.2625 17.0409 2.76013 15.8275C2.25777 14.614 1.99948 13.3134 2 12C2 10.386 2.386 8.86 3.064 7.51Z"
              fill="black"
            />
          </Svg>
        </View>
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={styles.textLink}>Don't have an account?{"\n"}Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <Path
            d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
            fill="black"
          />
        </Svg>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
