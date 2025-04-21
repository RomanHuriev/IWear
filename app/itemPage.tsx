import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Svg, Path } from "react-native-svg";
import { app } from "../firebase/firebaseConfig";
import { Styles as localStyles } from "@/styles/itemPage";
import { Picker } from "@react-native-picker/picker";
import { GET_ITEM, REMOVE_ITEM, UPDATE_ITEM } from "@/config";
const auth = getAuth(app);

interface ItemDetails {
  imageUrl?: string;
  type?: string;
  subtype?: string;
  color?: string;
  outfit_Style?: string;
  name?: string;
  id?: string;
}

const getToken = async () => {
  try {
    let token = await AsyncStorage.getItem("userToken");
    if (!token) {
      const user = auth.currentUser;
      if (user) {
        token = await user.getIdToken(true);
        await AsyncStorage.setItem("userToken", token);
      }
    }
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export default function ItemPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const itemId = params.id as string;

  const [itemDetails, setItemDetails] = useState<ItemDetails>({
    type: "T-shirt",
    subtype: "Oversized T-shirt",
    color: "Black",
    outfit_Style: "Casual",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const colors = [
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
  ];
  const outfitStyles = ["null", "Sporty", "Casual", "Official"];

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) {
        setError("No item ID provided");
        setLoading(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(GET_ITEM, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemId }),
        });

        if (!response.ok) {
          throw new Error(
            `Error fetching item details: ${response.statusText}`
          );
        }

        const data = await response.json();

        let type = data.type || "T-shirt";
        let subtype = data.subtype;

        if (!subtypesByType[type]) {
          type = "T-shirt";
          subtype = subtypesByType["T-shirt"][0];
        } else if (!subtypesByType[type].includes(subtype)) {
          subtype = subtypesByType[type][0];
        }

        setItemDetails({ ...data, type, subtype, id: itemId });
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId]);

  const handleRemove = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const token = await getToken();
              if (!token) {
                setError("Authentication required");
                setLoading(false);
                return;
              }

              const response = await fetch(REMOVE_ITEM, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ itemId }),
              });

              if (!response.ok) {
                throw new Error(`Error removing item: ${response.statusText}`);
              }
              router.back();
            } catch (error) {
              console.error("Error removing item:", error);
              setError("Failed to remove item");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const { id, name, type, subtype, color, outfit_Style } = itemDetails;

      const response = await fetch(UPDATE_ITEM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: id,
          name,
          type,
          subtype,
          color,
          outfit_Style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating item: ${response.statusText}`);
      }

      router.back();
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item");
      setLoading(false);
    }
  };

  return (
    <View style={localStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <TouchableOpacity
        style={localStyles.backButton}
        onPress={() => router.back()}
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

      {loading ? (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={localStyles.errorContainer}>
          <Text style={localStyles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={localStyles.detailsContainer}>
          <View style={localStyles.imageContainer}>
            {itemDetails.imageUrl ? (
              <Image
                source={{ uri: itemDetails.imageUrl }}
                style={localStyles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={localStyles.placeholderImage}>
                <Text style={localStyles.placeholderText}>
                  {itemDetails.name?.[0] || "?"}
                </Text>
              </View>
            )}
          </View>

          <TextInput
            style={[localStyles.itemId, { textAlign: "center" }]}
            value={itemDetails.name || ""}
            onChangeText={(text) =>
              setItemDetails({ ...itemDetails, name: text })
            }
            placeholder="Unnamed Item"
            placeholderTextColor="#999"
          />

          <View style={localStyles.fieldsContainer}>
            <View style={localStyles.inputContainer}>
              <Text style={localStyles.inputLabel}>Type:</Text>
              <View style={localStyles.pickerContainer}>
                <Text style={localStyles.selectedValue}>
                  {itemDetails.type}
                </Text>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M4 6L8 10L12 6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Picker
                  selectedValue={itemDetails.type}
                  style={localStyles.picker}
                  onValueChange={(itemValue) =>
                    setItemDetails({
                      ...itemDetails,
                      type: itemValue,
                      subtype:
                        subtypesByType[
                          itemValue as keyof typeof subtypesByType
                        ][0],
                    })
                  }
                >
                  {Object.keys(subtypesByType).map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={localStyles.inputContainer}>
              <Text style={localStyles.inputLabel}>Subtype:</Text>
              <View style={localStyles.pickerContainer}>
                <Text style={localStyles.selectedValue}>
                  {itemDetails.subtype}
                </Text>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M4 6L8 10L12 6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Picker
                  selectedValue={itemDetails.subtype}
                  style={localStyles.picker}
                  onValueChange={(itemValue) =>
                    setItemDetails({ ...itemDetails, subtype: itemValue })
                  }
                >
                  {itemDetails.type &&
                    subtypesByType[
                      itemDetails.type as keyof typeof subtypesByType
                    ]?.map((subtype) => (
                      <Picker.Item
                        key={subtype}
                        label={subtype}
                        value={subtype}
                      />
                    ))}
                </Picker>
              </View>
            </View>

            <View style={localStyles.inputContainer}>
              <Text style={localStyles.inputLabel}>Color:</Text>
              <View style={localStyles.pickerContainer}>
                <Text style={localStyles.selectedValue}>
                  {itemDetails.color}
                </Text>
                {itemDetails.color !== "null" && (
                  <View
                    style={[
                      localStyles.colorCircle,
                      { backgroundColor: itemDetails.color?.toLowerCase() },
                    ]}
                  />
                )}
                <Picker
                  selectedValue={itemDetails.color}
                  style={localStyles.picker}
                  onValueChange={(itemValue) =>
                    setItemDetails({ ...itemDetails, color: itemValue })
                  }
                >
                  {colors.map((color) => (
                    <Picker.Item key={color} label={color} value={color} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={localStyles.inputContainer}>
              <Text style={localStyles.inputLabel}>Outfit Style:</Text>
              <View style={localStyles.pickerContainer}>
                <Text style={localStyles.selectedValue}>
                  {itemDetails.outfit_Style}
                </Text>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M4 6L8 10L12 6"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Picker
                  selectedValue={itemDetails.outfit_Style}
                  style={localStyles.picker}
                  onValueChange={(itemValue) =>
                    setItemDetails({ ...itemDetails, outfit_Style: itemValue })
                  }
                >
                  {outfitStyles.map((style) => (
                    <Picker.Item key={style} label={style} value={style} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={localStyles.buttonsContainer}>
            <TouchableOpacity
              style={localStyles.removeButton}
              onPress={handleRemove}
            >
              <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <Path
                  d="M28.3255 26L35.3455 18.98C35.5821 18.7037 35.7058 18.3483 35.6917 17.9847C35.6777 17.6212 35.527 17.2763 35.2697 17.0191C35.0125 16.7618 34.6677 16.6111 34.3041 16.5971C33.9406 16.5831 33.5851 16.7067 33.3088 16.9434L26.2888 23.8911L19.2255 16.8278C18.9492 16.5912 18.5937 16.4675 18.2302 16.4815C17.8667 16.4956 17.5218 16.6463 17.2646 16.9035C17.0073 17.1608 16.8566 17.5056 16.8426 17.8692C16.8285 18.2327 16.9522 18.5881 17.1888 18.8645L24.2377 26L17.3333 32.8178C17.1821 32.9473 17.0593 33.1066 16.9726 33.2858C16.8859 33.465 16.8371 33.6602 16.8294 33.8592C16.8218 34.0581 16.8553 34.2565 16.9279 34.4418C17.0005 34.6272 17.1107 34.7955 17.2514 34.9363C17.3922 35.0771 17.5606 35.1872 17.7459 35.2598C17.9313 35.3324 18.1296 35.366 18.3286 35.3583C18.5275 35.3506 18.7227 35.3019 18.9019 35.2152C19.0811 35.1285 19.2404 35.0057 19.3699 34.8545L26.2599 27.9645L33.1066 34.8111C33.3829 35.0478 33.7384 35.1714 34.1019 35.1574C34.4654 35.1433 34.8103 34.9926 35.0675 34.7354C35.3248 34.4781 35.4755 34.1333 35.4895 33.7698C35.5036 33.4062 35.3799 33.0508 35.1433 32.7745L28.3255 26Z"
                  fill="black"
                />
                <Path
                  d="M26 49.1111C21.4291 49.1111 16.9608 47.7557 13.1602 45.2162C9.35959 42.6767 6.39738 39.0673 4.64815 34.8443C2.89893 30.6213 2.44125 25.9744 3.333 21.4913C4.22475 17.0082 6.42587 12.8902 9.65801 9.65801C12.8902 6.42587 17.0082 4.22475 21.4913 3.333C25.9744 2.44125 30.6213 2.89893 34.8443 4.64815C39.0673 6.39738 42.6767 9.35959 45.2162 13.1602C47.7557 16.9608 49.1111 21.4291 49.1111 26C49.1111 32.1295 46.6762 38.0079 42.3421 42.3421C38.0079 46.6762 32.1295 49.1111 26 49.1111ZM26 5.77782C22.0005 5.77782 18.0907 6.96383 14.7652 9.18587C11.4396 11.4079 8.84771 14.5662 7.31714 18.2613C5.78657 21.9565 5.3861 26.0225 6.16638 29.9452C6.94666 33.8679 8.87264 37.4712 11.7008 40.2993C14.5289 43.1274 18.1322 45.0534 22.0549 45.8337C25.9776 46.614 30.0436 46.2135 33.7387 44.6829C37.4339 43.1524 40.5922 40.5604 42.8142 37.2349C45.0362 33.9094 46.2223 29.9996 46.2223 26C46.2223 20.6368 44.0917 15.4932 40.2993 11.7008C36.5069 7.90836 31.3633 5.77782 26 5.77782Z"
                  fill="black"
                />
              </Svg>

              <Text style={localStyles.buttonText}>Remove Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={localStyles.saveButton}
              onPress={handleSave}
            >
              <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <Path
                  d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
                  fill="black"
                />
              </Svg>
              <Text style={localStyles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
