import { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Button,
  Text,
  FlatList,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";
import { styles as styles } from "@/styles/addItem";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { EnchantingIcon, BackButton } from "../icons";
import { IMAGE_ANALYZE_API } from "../../config"

const auth = getAuth(app);

const checkAuthState = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        if (user) {
          const token = await user.getIdToken(true);
          await AsyncStorage.setItem("userToken", token);
          resolve(token);
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
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

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [photo, setPhoto] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const router = useRouter();

  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isLoading) {
      opacity.value = 1;

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1
      );
    } else {
      opacity.value = withTiming(1);
    }
  }, [isLoading]);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library was denied");
      }
    })();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!permission) {
    return <View />;
  }

  const guidelines = [
    "Place the clothing item in the center of the frame.",
    "Only one item per photo.",
    "Ensure good lighting for clear visibility.",
  ];

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Photo Guidelines </Text>
        <FlatList
          data={guidelines}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.listItem}>• {item}</Text>
          )}
        />
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/permission.png")}
            style={styles.image}
          />
        </View>

        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      if (photoData) {
        setPhoto(photoData.uri);
      } else {
        console.error("Photo capture failed");
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const resetPhoto = () => setPhoto(null);

  const analyzePhoto = async (photoUri: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      const photoBase64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: "base64",
      });

      const formData = new FormData();
      formData.append("image", {
        uri: photoUri,
        name: `${Math.floor(Math.random() * 100000000) + 1}`,
        type: "image/jpeg",
      } as unknown as Blob);

      
      const response = await fetch(
        IMAGE_ANALYZE_API,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok)
        throw new Error(`Failed to analyze image: ${response.status}`);

      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error analyzing photo:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (!photo) return;
    setIsLoading(true);
    const analysisData = await analyzePhoto(photo);
    setIsLoading(false);
    if (analysisData) {
      router.push({
        pathname: "/itemDetails",
        params: { analysis: JSON.stringify(analysisData) },
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingScreen}>
          <Animated.View style={animatedStyle}>
            <EnchantingIcon />
          </Animated.View>
          <Text style={styles.loadingText}>Enchanting...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <BackButton />
      </TouchableOpacity>

      <View style={styles.cameraWrapper}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={[
              styles.camera,
              facing === "front" && { transform: [{ scaleX: -1 }] },
            ]}
          />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, photo ? null : styles.disabledButton]}
          onPress={resetPhoto}
          disabled={!photo}
        >
          <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <Path
              d="M4.33331 26C4.33331 31.1717 6.38777 36.1316 10.0447 39.7886C13.7017 43.4455 18.6616 45.5 23.8333 45.5C29.0116 45.5 33.9733 43.4633 37.7 39.8667L34.45 36.6167C33.0859 38.0612 31.4398 39.2104 29.6137 39.9931C27.7875 40.7757 25.8201 41.1751 23.8333 41.1667C10.3133 41.1667 3.55331 24.83 13.1083 15.275C22.6633 5.72 39 12.5017 39 26H32.5L41.1666 34.6667H41.3833L49.8333 26H43.3333C43.3333 20.8283 41.2789 15.8684 37.6219 12.2114C33.9649 8.55446 29.005 6.5 23.8333 6.5C18.6616 6.5 13.7017 8.55446 10.0447 12.2114C6.38777 15.8684 4.33331 20.8283 4.33331 26Z"
              fill={photo ? "black" : "gray"}
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, photo ? styles.disabledButton : null]}
          onPress={takePhoto}
          disabled={!!photo}
        >
          <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <Path
              d="M26 4.33118C37.9686 4.33118 47.671 14.0335 47.671 26.0022C47.671 37.9687 37.9686 47.671 26 47.671C14.0313 47.671 4.32898 37.9687 4.32898 26.0022C4.32898 14.0335 14.0313 4.33118 26 4.33118ZM26 7.58118C23.5642 7.55476 21.1474 8.01169 18.8895 8.92553C16.6315 9.83937 14.5772 11.192 12.8454 12.905C11.1137 14.6181 9.73887 16.6576 8.80059 18.9056C7.86232 21.1535 7.3792 23.5652 7.3792 26.0011C7.3792 28.437 7.86232 30.8487 8.80059 33.0966C9.73887 35.3446 11.1137 37.3841 12.8454 39.0971C14.5772 40.8102 16.6315 42.1628 18.8895 43.0767C21.1474 43.9905 23.5642 44.4474 26 44.421C30.836 44.3468 35.4489 42.3736 38.8426 38.9275C42.2363 35.4814 44.1385 30.8388 44.1385 26.0022C44.1385 21.1656 42.2363 16.523 38.8426 13.0768C35.4489 9.6307 30.836 7.65536 26 7.58118ZM25.9913 13C29.438 13 32.7435 14.3692 35.1806 16.8064C37.6178 19.2435 38.987 22.549 38.987 25.9957C38.987 29.4423 37.6178 32.7478 35.1806 35.185C32.7435 37.6222 29.438 38.9913 25.9913 38.9913C22.5446 38.9913 19.2391 37.6222 16.802 35.185C14.3648 32.7478 12.9956 29.4423 12.9956 25.9957C12.9956 22.549 14.3648 19.2435 16.802 16.8064C19.2391 14.3692 22.5446 13 25.9913 13Z"
              fill={photo ? "gray" : "black"}
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, photo ? styles.disabledButton : null]}
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          disabled={!!photo}
        >
          <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <Path
              d="M46.0417 16.25C46.4344 16.25 46.8138 16.3922 47.1097 16.6503C47.4057 16.9084 47.5981 17.265 47.6515 17.654L47.6667 17.875V36.2917C47.6668 38.0903 46.9787 39.8208 45.7434 41.1282C44.5082 42.4356 42.8195 43.2207 41.0237 43.3225L40.625 43.3333H13.1322L14.6922 44.8933C14.9671 45.1688 15.134 45.5337 15.1626 45.9217C15.1913 46.3098 15.0797 46.6952 14.8482 47.008L14.69 47.19C14.4149 47.4652 14.0501 47.6325 13.6621 47.6616C13.274 47.6906 12.8884 47.5794 12.5754 47.3482L12.3934 47.19L8.06004 42.8567L7.92137 42.7007L7.90621 42.679L8.06004 42.8567C7.81199 42.6081 7.64895 42.2859 7.59934 41.9383C7.54974 41.5907 7.61407 41.2363 7.78271 40.9283C7.85834 40.7938 7.95161 40.6699 8.06004 40.56L12.3934 36.2267C12.6837 35.9386 13.072 35.7706 13.4807 35.7562C13.8895 35.7418 14.2886 35.8821 14.5985 36.149C14.9084 36.416 15.1062 36.7899 15.1525 37.1963C15.1988 37.6027 15.0901 38.0116 14.8482 38.3413L14.69 38.5233L13.13 40.0833H40.625C41.577 40.0833 42.494 39.7251 43.1941 39.0801C43.8941 38.435 44.3259 37.5502 44.4037 36.6015L44.4167 36.2917V17.875C44.4167 17.444 44.5879 17.0307 44.8927 16.726C45.1974 16.4212 45.6107 16.25 46.0417 16.25ZM39.4247 4.65184L39.6067 4.81001L43.94 9.14334C43.9944 9.19904 44.0458 9.25762 44.0939 9.31884L43.94 9.14334C44.2429 9.44653 44.4159 9.85705 44.4175 10.2856C44.4191 10.7141 44.2514 11.1259 43.9509 11.4313L43.94 11.44L39.6067 15.7733C39.3164 16.0614 38.9281 16.2294 38.5193 16.2438C38.1106 16.2582 37.7115 16.1179 37.4016 15.851C37.0917 15.5841 36.8939 15.2101 36.8476 14.8037C36.8013 14.3973 36.91 13.9885 37.1519 13.6587L37.31 13.4767L38.8657 11.9167H11.375C10.4235 11.9167 9.50669 12.2745 8.80669 12.9192C8.1067 13.5638 7.67468 14.448 7.59637 15.3963L7.58337 15.7083V34.125C7.58325 34.5367 7.42684 34.933 7.14577 35.2339C6.86469 35.5347 6.47989 35.7177 6.06913 35.7457C5.65837 35.7738 5.25227 35.6449 4.93289 35.3851C4.61351 35.1253 4.40466 34.7539 4.34854 34.346L4.33337 34.125V15.7083C4.33326 13.9097 5.02141 12.1792 6.25666 10.8718C7.49192 9.56447 9.18063 8.77934 10.9764 8.67751L11.375 8.66668H38.8679L37.3079 7.10668C37.033 6.83126 36.8661 6.46636 36.8374 6.07829C36.8088 5.69023 36.9204 5.30478 37.1519 4.99201L37.31 4.81001C37.5852 4.53481 37.95 4.36748 38.338 4.33845C38.7261 4.30943 39.1117 4.42063 39.4247 4.65184ZM26 17.3333C28.2986 17.3333 30.503 18.2464 32.1283 19.8718C33.7536 21.4971 34.6667 23.7015 34.6667 26C34.6667 28.2986 33.7536 30.503 32.1283 32.1283C30.503 33.7536 28.2986 34.6667 26 34.6667C23.7015 34.6667 21.4971 33.7536 19.8718 32.1283C18.2465 30.503 17.3334 28.2986 17.3334 26C17.3334 23.7015 18.2465 21.4971 19.8718 19.8718C21.4971 18.2464 23.7015 17.3333 26 17.3333Z"
              fill={photo ? "gray" : "black"}
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, photo ? styles.disabledButton : null]}
          onPress={pickImage}
          disabled={!!photo}
        >
          <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <Path
              d="M41.1667 6.5H10.8333C8.53167 6.5 6.5 8.53167 6.5 10.8333V41.1667C6.5 43.4683 8.53167 45.5 10.8333 45.5H41.1667C43.4683 45.5 45.5 43.4683 45.5 41.1667V10.8333C45.5 8.53167 43.4683 6.5 41.1667 6.5ZM10.8333 10.8333H41.1667V30.3333L34.3083 23.475C33.8883 23.0767 33.3217 22.8583 32.725 22.88C32.1283 22.88 31.5617 23.1417 31.1417 23.5617L23.4 31.3033L18.9583 26.8617C18.5383 26.4417 17.9717 26.2233 17.375 26.2233C16.7783 26.2233 16.2117 26.4417 15.7917 26.8617L10.8333 31.82V10.8333ZM10.8333 41.1667V38.2167L17.375 31.675L21.8167 36.1167C22.2367 36.5367 22.8033 36.755 23.4 36.755C23.9967 36.755 24.5633 36.5367 24.9833 36.1167L32.725 28.3967L41.1667 36.8383V41.1667H10.8333Z"
              fill={photo ? "gray" : "black"}
            />
            <Path
              d="M17.3334 24.9167C19.3634 24.9167 21.6667 22.6133 21.6667 20.5833C21.6667 18.5533 19.3634 16.25 17.3334 16.25C15.3034 16.25 13 18.5533 13 20.5833C13 22.6133 15.3034 24.9167 17.3334 24.9167Z"
              fill={photo ? "gray" : "black"}
            />
          </Svg>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, photo ? null : styles.disabledButton]}
        onPress={handleNext}
        disabled={!photo}
      >
        <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <Path
            d="M22.36 8.84001L36.9199 23.4H5.19995V28.6H36.9199L22.36 43.16L26 46.8L46.7999 26L26 5.20001L22.36 8.84001Z"
            fill={photo ? "black" : "gray"}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}
