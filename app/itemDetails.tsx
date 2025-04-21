import { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";
import { styles as styles } from "@/styles/itemDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../firebase/firebaseConfig";
import { UPLOAD_ITEM } from "@/config";

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

const generateUniqueName = () => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return `Item_${randomString}`;
};

const capitalizeEachWord = (str: string) => {
  if (!str || str === "null") return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const ColorIcon = ({ color }: { color: string }) => {
  const normalizedColor =
    color === "null" || !color ? "#000000" : String(color).toLowerCase();

  return (
    <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <Path
        d="M8.25992 13.125C8.39804 12.1933 8.76701 11.311 9.33325 10.5583L5.16825 6.40498C3.5208 8.27908 2.52598 10.6372 2.33325 13.125H8.25992ZM10.5583 9.33331C11.3121 8.77124 12.1943 8.40631 13.1249 8.27165V2.33331C10.6371 2.52604 8.27902 3.52086 6.40492 5.16831L10.5583 9.33331ZM14.8749 2.33331V8.16665C15.8359 8.32275 16.7401 8.72464 17.4999 9.33331L21.6533 5.17998C19.7651 3.51666 17.3845 2.5169 14.8749 2.33331ZM9.33325 17.5C8.77118 16.7462 8.40625 15.8639 8.27159 14.9333H2.33325C2.51285 17.4156 3.49104 19.7731 5.12159 21.6533L9.33325 17.5ZM13.1249 19.74C12.1932 19.6019 11.3109 19.2329 10.5583 18.6666L6.40492 22.8316C8.27902 24.4791 10.6371 25.4739 13.1249 25.6666V19.74ZM18.6666 10.5583C19.2287 11.3121 19.5936 12.1944 19.7283 13.125H25.5616C25.382 10.6427 24.4038 8.28522 22.7733 6.40498L18.6666 10.5583ZM17.4999 18.6666C16.7461 19.2287 15.8639 19.5936 14.9333 19.7283V25.5616C17.4155 25.382 19.773 24.4039 21.6533 22.7733L17.4999 18.6666ZM19.7399 14.875C19.6113 15.827 19.2418 16.7305 18.6666 17.5L22.8199 21.6533C24.4832 19.7652 25.483 17.3846 25.6666 14.875H19.7399Z"
        fill={normalizedColor}
      />
    </Svg>
  );
};

export default function ItemDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState<string>(generateUniqueName());
  const [type, setType] = useState<string>("null");
  const [subtype, setSubtype] = useState<string>("null");
  const [color, setColor] = useState<string>("null");
  const [outfit_Style, setOutfit_Style] = useState<string>("null");
  const [tempFilePath, setTempFilePath] = useState<string>("");

  const subtypesByType: { [key: string]: string[] } = {
    "T-shirt": ["Oversized T-shirt", "Polo Shirt", "Henley"],
    Shirt: ["Classic Dress Shirt", "Casual Button-Up Shirt", "Flannel Shirt"],
    Top: ["Tank Top", "Blouse", "Crop Top", "Camisole"],
    Sweater: [
      "Pullover Hoodie",
      "Zip-Up Hoodie",
      "Turtleneck Sweater",
      "Sweater",
      "Zip Sweater",
    ],
    Jacket: [
      "Leather Jacket",
      "Denim Jacket",
      "Puffer",
      "Windbreaker",
      "Fleece Jacket",
      "Vest",
      "Blazer",
    ],
    Trousers: ["Jeans", "Dress Pants", "Cargo Pants", "Joggers"],
    Shorts: ["Denim Shorts", "Chino Shorts", "Athletic Shorts"],
    Skirt: ["Skirt", "Mini Skirt", "Denim Skirt"],
    Dress: ["Dress"],
    Boots: ["Boots", "Chelsea Boots", "Ugg Boots"],
    "Classic shoes": ["Dress Shoes", "Loafers", "Pumps", "Wedges"],
    "Sports shoes": ["Sneakers"],
    "Summer shoes": ["Flip-Flops", "Ballet Flats"],
    Headdress: ["Bucket Hat", "Baseball Cap", "Beanie"],
  };

  useEffect(() => {
    try {
      if (params.analysis) {
        const analysisData = JSON.parse(params.analysis as string);
        if (analysisData?.analysis) {
          const newType = analysisData.analysis.type || type;
          setType(newType);

          const newSubtype = analysisData.analysis.subtype;
          if (
            newType !== "null" &&
            subtypesByType[newType]?.includes(newSubtype)
          ) {
            setSubtype(newSubtype);
          } else if (
            newType !== "null" &&
            subtypesByType[newType]?.length > 0
          ) {
            setSubtype(subtypesByType[newType][0].toLowerCase());
          }

          setColor(analysisData.analysis.color || color);
          setOutfit_Style(analysisData.analysis.outfit_Style || outfit_Style);
        }
        if (analysisData?.tempFilePath) {
          setTempFilePath(analysisData.tempFilePath);
        }
      }
    } catch (error) {
      console.error("Error parsing analysis data:", error);
    }
  }, [params.analysis]);

  useEffect(() => {
    if (type === "null") {
      setSubtype("null");
    } else if (subtypesByType[type] && subtypesByType[type].length > 0) {
      setSubtype(subtypesByType[type][0].toLowerCase());
    } else {
      setSubtype("null");
    }
  }, [type]);

  const handleSaveItem = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) throw new Error("No token available");
      let finalSubtype = subtype;
      if (type !== "null" && (!finalSubtype || finalSubtype === "null")) {
        finalSubtype = subtypesByType[type]?.[0]?.toLowerCase() || "null";
      }

      const itemData = {
        tempFilePath,
        name,
        color: color,
        type: type,
        subtype: capitalizeEachWord(finalSubtype),
        outfit_Style: outfit_Style,
      };

      const response = await fetch(UPLOAD_ITEM, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save item: ${response.status}`);
      }

      router.push("/(tabs)/library");
    } catch (error) {
      console.error("Error saving item:", error);
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={[styles.container, isLoading && { opacity: 0.5 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <Path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M13.2325 11.25L15.5175 13.535L13.75 15.3038L9.33 10.8837C9.09566 10.6493 8.96402 10.3315 8.96402 10C8.96402 9.66855 9.09566 9.35066 9.33 9.11625L13.75 4.69625L15.5175 6.465L13.2325 8.75H18.75C20.7391 8.75 22.6468 9.54018 24.0533 10.9467C25.4598 12.3532 26.25 14.2609 26.25 16.25C26.25 18.2391 25.4598 20.1468 24.0533 21.5533C22.6468 22.9598 20.7391 23.75 18.75 23.75H5V21.25H18.75C20.0761 21.25 21.3479 20.7232 22.2855 19.7855C23.2232 18.8479 23.75 17.5761 23.75 16.25C23.75 14.9239 23.2232 13.6521 22.2855 12.7145C21.3479 11.7768 20.0761 11.25 18.75 11.25H13.2325Z"
                fill="black"
              />
            </Svg>
          </TouchableOpacity>

          <Text style={styles.title}>Automatically determine parameters</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.inputField}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#888"
              editable={!isLoading}
            />
          </View>

          {renderPicker(
            "Type:",
            type,
            setType,
            ["null", ...Object.keys(subtypesByType)],
            isLoading
          )}
          {renderPicker(
            "Subtype:",
            subtype,
            setSubtype,
            type !== "null" && subtypesByType[type]
              ? [
                  "null",
                  ...subtypesByType[type].map((item) => item.toLowerCase()),
                ]
              : ["null"],
            isLoading
          )}
          {renderColorPicker(
            "Color:",
            color,
            setColor,
            [
              "null",
              "Black",
              "White",
              "Gray",
              "Red",
              "Blue",
              "Green",
              "Yellow",
              "Brown",
              "Beige",
              "Pink",
              "Purple",
              "Orange",
            ],
            isLoading
          )}
          {renderPicker(
            "Outfit Style:",
            outfit_Style,
            setOutfit_Style,
            ["null", "Sporty", "Casual", "Official"],
            isLoading
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSaveItem} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#000000" />
              ) : (
                <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <Path
                    d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
                    fill="black"
                  />
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const renderPicker = (
  label: string,
  selectedValue: string,
  onValueChange: (val: string) => void,
  items: string[],
  isLoading: boolean
) => {
  const pickerRef = useRef<Picker<string> | null>(null);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => !isLoading && pickerRef.current?.focus()}
        disabled={isLoading}
      >
        <Text style={styles.selectedValue}>
          {selectedValue === "null"
            ? selectedValue
            : typeof selectedValue === "string"
            ? selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)
            : selectedValue}
        </Text>
        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <Path
            d="M8.16675 11.6667L14.0001 17.5L19.8334 11.6667H8.16675Z"
            fill="black"
          />
        </Svg>
      </TouchableOpacity>

      <Picker
        ref={pickerRef}
        selectedValue={selectedValue}
        onValueChange={(val) => !isLoading && onValueChange(val)}
        style={styles.picker}
        enabled={!isLoading}
      >
        {items.map((item) => (
          <Picker.Item
            key={item}
            label={item === "null" ? "null" : item}
            value={item}
          />
        ))}
      </Picker>
    </View>
  );
};

const renderColorPicker = (
  label: string,
  selectedValue: string,
  onValueChange: (val: string) => void,
  items: string[],
  isLoading: boolean
) => {
  const pickerRef = useRef<Picker<string> | null>(null);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => !isLoading && pickerRef.current?.focus()}
        disabled={isLoading}
      >
        <Text style={styles.selectedColor}>
          {selectedValue === "null"
            ? "null"
            : typeof selectedValue === "string"
            ? selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)
            : selectedValue}
        </Text>
        <ColorIcon color={selectedValue} />
      </TouchableOpacity>

      <Picker
        ref={pickerRef}
        selectedValue={selectedValue}
        onValueChange={(val) => !isLoading && onValueChange(val)}
        style={styles.picker}
        enabled={!isLoading}
      >
        {items.map((item) => (
          <Picker.Item
            key={item}
            label={item === "null" ? "null" : item}
            value={item === "null" ? "null" : item.toLowerCase()}
          />
        ))}
      </Picker>
    </View>
  );
};
