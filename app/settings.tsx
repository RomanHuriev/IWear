import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getAuth,
  signOut,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { app } from "../firebase/firebaseConfig";
import { Svg, Path } from "react-native-svg";
import { auth as baseStyles } from "@/styles/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FETCH_USER_CITY } from "@/config";

export default function SettingsScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    fetchUserCity();
    fetchUserEmail();
  }, []);

  const fetchUserEmail = () => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || "");
      setCurrentEmail(user.email || "");
    }
  };

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) {
      return await checkAuthState();
    }

    const token = await user.getIdToken(true);
    await AsyncStorage.setItem("userToken", token);
    return token;
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.replace("/auth/login");
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error checking auth state:", error);
      router.replace("/auth/login");
      return null;
    }
  };

  const fetchUserCity = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(FETCH_USER_CITY, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success" && data.city) {
        setCity(data.city);
      }
    } catch (error) {
      console.error("Error fetching city:", error);
      Alert.alert("Помилка", "Не вдалося отримати дані міста");
    } finally {
      setLoading(false);
    }
  };

  const updateUserCity = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(FETCH_USER_CITY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert("Success", "City updated successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to update city");
      }
    } catch (error) {
      console.error("Error updating city:", error);
      Alert.alert("Error", "Failed to update city data");
    } finally {
      setLoading(false);
    }
  };

  const changeUserEmail = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      if (email === currentEmail) {
        return;
      }

      if (oldPassword) {
        const credential = EmailAuthProvider.credential(
          currentEmail,
          oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        await updateEmail(user, email);
        setCurrentEmail(email);
        return true;
      } else {
        Alert.alert(
          "Error",
          "Please enter your current password to change email"
        );
        return false;
      }
    } catch (error: any) {
      console.error("Error updating email:", error);
      let errorMessage = "Error updating email";

      if (error.code === "auth/requires-recent-login") {
        errorMessage = "Recent authentication is required to change email";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      }

      Alert.alert("Error", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      if (!user.email) throw new Error("User email not found");

      if (!oldPassword || !newPassword) {
        Alert.alert("Error", "Please enter both the old and new passwords");
        return false;
      }

      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setOldPassword("");
      setNewPassword("");
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);

      let errorMessage = "Error changing password";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect current password";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Recent authentication is required to change password";
      }

      Alert.alert("Error", errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    let success = true;

    if (city) {
      await updateUserCity();
    }
    if (email !== currentEmail) {
      const emailSuccess = await changeUserEmail();
      if (!emailSuccess) success = false;
    }

    if (oldPassword && newPassword) {
      const passwordSuccess = await changePassword();
      if (!passwordSuccess) success = false;
    }

    setLoading(false);

    if (success) {
      Alert.alert("Success", "Settings saved successfully");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userToken");
      Alert.alert("Success", "You have logged out successfully");
      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  const styles = {
    ...baseStyles,
    ...customStyles,
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.2325 11.25L15.5175 13.535L13.75 15.3038L9.33 10.8837C9.09566 10.6493 8.96402 10.3315 8.96402 10C8.96402 9.66855 9.09566 9.35066 9.33 9.11625L13.75 4.69625L15.5175 6.465L13.2325 8.75H18.75C20.7391 8.75 22.6468 9.54018 24.0533 10.9467C25.4598 12.3532 26.25 14.2609 26.25 16.25C26.25 18.2391 25.4598 20.1468 24.0533 21.5533C22.6468 22.9598 20.7391 23.75 18.75 23.75H5V21.25H18.75C20.0761 21.25 21.3479 20.7232 22.2855 19.7855C23.2232 18.8479 23.75 17.5761 23.75 16.25C23.75 14.9239 23.2232 13.6521 22.2855 12.7145C21.3479 11.7768 20.0761 11.25 18.75 11.25H13.2325Z"
              fill="black"
            />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email:</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City:</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your city"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Old Password:</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter old password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password:</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#888"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveChanges}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
            <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <Path
                d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
                fill="black"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.logoutText}>Log out</Text>
            <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <Path
                d="M21.25 8.75L19.4875 10.5125L22.7125 13.75H10V16.25H22.7125L19.4875 19.475L21.25 21.25L27.5 15L21.25 8.75ZM5 6.25H15V3.75H5C3.625 3.75 2.5 4.875 2.5 6.25V23.75C2.5 25.125 3.625 26.25 5 26.25H15V23.75H5V6.25Z"
                fill="black"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const customStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    position: "relative",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  backButton: {
    position: "absolute",
    top: 20,
    right: 46,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 92,
    marginLeft: 22,
    textAlign: "left",
  },
  formContainer: {
    marginTop: 40,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "black",
    fontWeight: "500",
    fontSize: 16,
    marginRight: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 5,
  },
});
