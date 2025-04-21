import { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { styles as styles } from "@/styles/outFitPage";
import { newStyles as newStyles } from "@/styles/outFitpageNew";
import {
  ADD_ITEM_TO_OUTFIT,
  ADD_PREWIU_TO_OUTFIT,
  GET_OUTFIT,
  REMOVE_ITEM_FROM_OUTFIT,
  REMOVE_OUTFIT,
} from "@/config";
interface OutfitItem {
  id: string;
  imageUrl: string;
  type: string;
  subtype: string;
  color: string;
  outfit_Style: string;
  name: string;
}

const getToken = async () => {
  return await AsyncStorage.getItem("userToken");
};

const extractStringValue = (field: any): string => {
  if (!field) return "";

  if (typeof field === "string") return field;

  if (field.stringValue) return field.stringValue;

  if (field.valueType === "stringValue") return field.stringValue;

  return "";
};

export default function OutfitDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const outfitId = params.outfitId as string;

  const { width, height } = useWindowDimensions();
  const gridSize = Math.floor(width - 20);
  const itemSize = Math.floor(gridSize / 2);

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [outfitName, setOutfitName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [shouldAddItem, setShouldAddItem] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeScreen, setActiveScreen] = useState("items");

  const flatListRef = useRef<FlatList>(null);

  const { outfitAddTo, itemId, shouldAddItemParam } = useLocalSearchParams<{
    outfitAddTo: string;
    itemId: string;
    shouldAddItemParam: string;
  }>();

  useEffect(() => {
    if (shouldAddItemParam == "True" && itemId) {
      AddItemToOutfit(itemId);
    }
  }, [shouldAddItem, itemId]);

  useEffect(() => {
    const fetchOutfitDetails = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("Token is missing!");
          return;
        }

        if (!outfitId) {
          console.error("OutfitId is missing!");
          return;
        }

        const response = await fetch(GET_OUTFIT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            OutfitId: outfitId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.error("Invalid data format or empty data");
          return;
        }

        const previewObject = data.find(
          (item) => item && typeof item === "object" && "previewUrl" in item
        );

        if (previewObject && previewObject.previewUrl) {
          setPreviewUrl(previewObject.previewUrl);
        }

        let name = "";
        if (typeof data[0] === "object") {
          if (data[0].stringValue) {
            name = data[0].stringValue;
          } else if (data[0].valueType === "stringValue") {
            name = data[0].stringValue;
          }
        }
        setOutfitName(name);

        const transformedItems = data
          .slice(1)
          .filter((item) => !("previewUrl" in item))
          .map((item: any) => {
            const getFieldValue = (itemObj: any, fieldName: string): string => {
              if (!itemObj) return "";

              if (
                itemObj[fieldName] &&
                typeof itemObj[fieldName].stringValue === "string"
              ) {
                return itemObj[fieldName].stringValue;
              }

              if (
                itemObj[fieldName] &&
                itemObj[fieldName].valueType === "stringValue"
              ) {
                return itemObj[fieldName].stringValue;
              }

              return "";
            };

            return {
              id: getFieldValue(item, "id"),
              imageUrl: getFieldValue(item, "imageUrl"),
              type: getFieldValue(item, "type"),
              subtype: getFieldValue(item, "subtype"),
              color: getFieldValue(item, "color"),
              outfit_Style: getFieldValue(item, "outfit_Style"),
              name: getFieldValue(item, "name"),
            };
          });

        setOutfitItems(transformedItems);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    if (outfitId) {
      fetchOutfitDetails();
    }
  }, [outfitId]);

  const AddItemToOutfit = async (itemId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(ADD_ITEM_TO_OUTFIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          OutfitId: outfitAddTo,
          itemId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      router.push(`/outfitPage?outfitId=${outfitAddTo}`);
    } catch (error) {
      console.error("Error saving outfit:", error);
    }
  };

  const removeItemFromOutfit = async (itemId: string) => {
    const itemToRemove = outfitItems.find((item) => item.id === itemId);
    let itemName = "";
    if (itemToRemove) {
      itemName = itemToRemove.name;
    }

    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove "${itemName}" from the outfit?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) {
                console.error("No authentication token found");
                return;
              }

              const response = await fetch(REMOVE_ITEM_FROM_OUTFIT, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  OutfitId: outfitId,
                  name: itemName,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to remove item");
              }

              fetchOutfitDetails();
            } catch (error) {
              console.error("Error removing item:", error);
              Alert.alert("Error", "Failed to remove item. Please try again.");
            }
          },
        },
      ]
    );
  };

  const fetchOutfitDetails = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        console.error("Token is missing!");
        return;
      }

      if (!outfitId) {
        console.error("OutfitId is missing!");
        return;
      }

      const response = await fetch(GET_OUTFIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          OutfitId: outfitId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.error("Invalid data format or empty data");
        return;
      }

      const previewObject = data.find(
        (item) => item && typeof item === "object" && "previewUrl" in item
      );

      if (previewObject && previewObject.previewUrl) {
        setPreviewUrl(previewObject.previewUrl);
      }

      let name = "";
      if (typeof data[0] === "object") {
        if (data[0].stringValue) {
          name = data[0].stringValue;
        } else if (data[0].valueType === "stringValue") {
          name = data[0].stringValue;
        }
      }
      setOutfitName(name);

      const transformedItems = data
        .slice(1)
        .filter((item) => !("previewUrl" in item))
        .map((item: any) => {
          const getFieldValue = (itemObj: any, fieldName: string): string => {
            if (!itemObj) return "";
            if (
              itemObj[fieldName] &&
              typeof itemObj[fieldName].stringValue === "string"
            ) {
              return itemObj[fieldName].stringValue;
            }
            if (
              itemObj[fieldName] &&
              itemObj[fieldName].valueType === "stringValue"
            ) {
              return itemObj[fieldName].stringValue;
            }
            return "";
          };

          return {
            id: getFieldValue(item, "id"),
            imageUrl: getFieldValue(item, "imageUrl"),
            type: getFieldValue(item, "type"),
            subtype: getFieldValue(item, "subtype"),
            color: getFieldValue(item, "color"),
            outfit_Style: getFieldValue(item, "outfit_Style"),
            name: getFieldValue(item, "name"),
          };
        });

      setOutfitItems(transformedItems);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
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
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const uploadPreviewImage = async () => {
    if (!selectedPhoto) {
      Alert.alert("Error", "Please select a photo first");
      return;
    }

    try {
      setIsUploading(true);
      const token = await getToken();
      if (!token) {
        console.error("No authentication token found");
        Alert.alert("Error", "Authentication failed");
        return;
      }

      const formData = new FormData();

      const uriParts = selectedPhoto.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("image", {
        uri: selectedPhoto,
        name: `preview.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      formData.append("OutfitId", outfitId);

      const response = await fetch(ADD_PREWIU_TO_OUTFIT, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload preview image");
      }

      setPreviewUrl(selectedPhoto);
      setSelectedPhoto(null);
      Alert.alert("Success", "Preview image uploaded successfully");
    } catch (error) {
      console.error("Error uploading preview image:", error);
      Alert.alert("Error", "Failed to upload preview image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this outfit? This action cannot be undone.",
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
                console.error("No authentication token found");
                return;
              }

              const response = await fetch(REMOVE_OUTFIT, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  OutfitId: outfitId,
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to delete outfit");
              }

              router.push("/(tabs)");
            } catch (error) {
              console.error("Error deleting outfit:", error);
              Alert.alert(
                "Error",
                "Failed to delete outfit. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const createItemPages = (items: OutfitItem[]) => {
    const pages = [];
    for (let i = 0; i < items.length; i += 4) {
      pages.push(items.slice(i, i + 4));
    }
    return pages;
  };

  const itemPages = createItemPages(outfitItems);

  const renderPage = ({ item }: { item: OutfitItem[] }) => {
    return (
      <View
        style={[styles.gridContainer, { width: gridSize, height: gridSize }]}
      >
        {item.map((outfitItem, index) => (
          <View
            key={outfitItem.id || index}
            style={[styles.item, { width: itemSize, height: itemSize }]}
          >
            <Image source={{ uri: outfitItem.imageUrl }} style={styles.image} />
            <TouchableOpacity
              style={newStyles.removeItemButton}
              onPress={() => removeItemFromOutfit(outfitItem.id)}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const handlePageChange = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.floor(contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const renderOutfitItemsScreen = () => {
    return (
      <View style={newStyles.screenContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/allOutfits")}
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

        <Text style={styles.title}>{outfitName || "Outfit Details"}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading outfit details...</Text>
          </View>
        ) : (
          <View style={{ width: gridSize }}>
            <FlatList
              ref={flatListRef}
              data={itemPages}
              renderItem={renderPage}
              keyExtractor={(_, index) => `page-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handlePageChange}
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={width}
              contentContainerStyle={newStyles.flatListContainer}
            />

            {itemPages.length > 1 && (
              <View style={newStyles.paginationContainer}>
                {itemPages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      newStyles.paginationDot,
                      currentPage === index
                        ? newStyles.paginationDotActive
                        : {},
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.removeButton}
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

                <Text style={styles.buttonText}>Remove{"\n"}set</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  router.push(
                    `/allItems?source=outfitPage&outfitId=${outfitId}&shouldAddItem=True`
                  );
                }}
              >
                <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <Path
                    d="M26 48.75C13.455 48.75 3.25 38.545 3.25 26C3.25 13.455 13.455 3.25 26 3.25C38.545 3.25 48.75 13.455 48.75 26C48.75 38.545 38.545 48.75 26 48.75ZM26 6.5C15.2425 6.5 6.5 15.2425 6.5 26C6.5 36.7575 15.2425 45.5 26 45.5C36.7575 45.5 45.5 36.7575 45.5 26C45.5 15.2425 36.7575 6.5 26 6.5Z"
                    fill="black"
                  />

                  <Path
                    d="M26 37.375C25.09 37.375 24.375 36.66 24.375 35.75V16.25C24.375 15.34 25.09 14.625 26 14.625C26.91 14.625 27.625 15.34 27.625 16.25V35.75C27.625 36.66 26.91 37.375 26 37.375Z"
                    fill="black"
                  />

                  <Path
                    d="M35.75 27.625H16.25C15.34 27.625 14.625 26.91 14.625 26C14.625 25.09 15.34 24.375 16.25 24.375H35.75C36.66 24.375 37.375 25.09 37.375 26C37.375 26.91 36.66 27.625 35.75 27.625Z"
                    fill="black"
                  />
                </Svg>

                <Text style={styles.buttonText}>Add{"\n"}Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPreviewScreen = () => {
    return (
      <View style={newStyles.screenContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/allOutfits")}
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

        <Text style={styles.title}>Preview</Text>

        {selectedPhoto ? (
          <View style={newStyles.previewImageContainer}>
            <Image
              source={{ uri: selectedPhoto }}
              style={newStyles.previewImage}
            />

            <TouchableOpacity
              style={newStyles.uploadButton}
              onPress={uploadPreviewImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={newStyles.uploadButtonText}>Upload Preview</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : previewUrl ? (
          <View style={newStyles.previewImageContainer}>
            <Image
              source={{ uri: previewUrl }}
              style={newStyles.previewImage}
            />

            <TouchableOpacity
              style={newStyles.changePhotoButton}
              onPress={pickImage}
            >
              <Text style={newStyles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={newStyles.emptyPreviewContainer}>
            <TouchableOpacity
              style={newStyles.addPhotoButton}
              onPress={pickImage}
            >
              <Svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 5V19M5 12H19"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={newStyles.addPhotoText}>Add Preview Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        {activeScreen === "items"
          ? renderOutfitItemsScreen()
          : renderPreviewScreen()}
        <View style={newStyles.navigationContainer}>
          <View style={newStyles.arrowsContainer}>
            <TouchableOpacity
              style={[
                newStyles.arrowButton,
                activeScreen === "preview" ? newStyles.activeArrow : {},
              ]}
              onPress={() => setActiveScreen("preview")}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke={activeScreen === "preview" ? "#999" : "#000"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                newStyles.arrowButton,
                activeScreen === "items" ? newStyles.activeArrow : {},
              ]}
              onPress={() => setActiveScreen("items")}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 18L15 12L9 6"
                  stroke={activeScreen === "items" ? "#999" : "#000"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
