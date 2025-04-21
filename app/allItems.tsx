import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Svg, Path } from "react-native-svg";
import { app } from "../firebase/firebaseConfig";
import { styles as styles } from "@/styles/allItems";
import { FETCH_ALL_ITEMS } from "@/config";

interface Item {
  id: string;
  name?: string;
  imageUrl?: string;
  type?: string;
  subtype?: string;
  color?: string;
  outfit_Style?: string;
}

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

export default function AllItemsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [addButoton, setAddButoton] = useState(false);

  const shouldAddItem = params.shouldAddItem as string;

  const outfitId = params.outfitId as string;
  const sourceScreen = (params.source ?? "library") as string;

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  useEffect(() => {
    if (sourceScreen == "allOutfits") {
      setAddButoton(true);
    }
  }, [sourceScreen]);

  useEffect(() => {
    const fetchItems = async () => {
      const token = await getToken();
      try {
        const response = await fetch(FETCH_ALL_ITEMS, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching items: ${response.statusText}`);
        }

        const data = await response.json();
        setItems(data.items);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleItemPress = (itemId: string) => {
    router.push(`/itemPage?id=${itemId}`);
  };

  const handleItemSelect = (item: Item) => {
    const itemName = item.name ? encodeURIComponent(item.name) : "Item";

    router.push(
      `/generate?id=${encodeURIComponent(item.id)}&imageUrl=${
        item.imageUrl
      }&name=${itemName}`
    );
  };

  const handleItemToOutFitSelect = (item: Item) => {
    router.push(
      `/outfitPage?outfitAddTo=${outfitId}&itemId=${item.id}&shouldAddItemParam=${shouldAddItem}`
    );
  };

  const handleItemsCreateTo = async () => {
    try {
      await AsyncStorage.setItem(
        "generatedOutfit",
        JSON.stringify(selectedItems)
      );

      router.push("/outfitDetails");
    } catch (error) {
      console.error("Error storing selected items:", error);
    }
  };

  const handleItemAction = (item: Item) => {
    if (sourceScreen === "generate") {
      handleItemSelect(item);
    } else if (sourceScreen === "outfitPage") {
      handleItemToOutFitSelect(item);
    } else if (sourceScreen === "allOutfits") {
      const isSelected = selectedItems.some(
        (selectedItem) => selectedItem.id === item.id
      );

      if (isSelected) {
        setSelectedItems((prevSelectedItems) =>
          prevSelectedItems.filter(
            (selectedItem) => selectedItem.id !== item.id
          )
        );
      } else {
        setSelectedItems((prevSelectedItems) => [...prevSelectedItems, item]);
      }
    } else {
      handleItemPress(item.id);
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = selectedItems.some(
      (selectedItem) => selectedItem.id === item.id
    );

    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.selectedItemCard]}
        onPress={() => handleItemAction(item)}
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {item.name?.[0] || "?"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = ({ item, index }: { item: number; index: number }) => {
    const startIndex = index * 3;
    const rowItems = items.slice(startIndex, startIndex + 3);

    return (
      <View style={styles.gridContainer}>
        {rowItems.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.itemCard,
              idx === rowItems.length - 1 && { marginRight: 0 },
            ]}
          >
            {renderItem({ item })}
          </View>
        ))}
      </View>
    );
  };

  const numRows = Math.ceil(items.length / 3);
  const rowIndices = Array.from({ length: numRows }, (_, i) => i);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.2325 11.25L15.5175 13.535L13.75 15.3038L9.33 10.8837C9.09566 10.6493 8.96402 10.3315 8.96402 10C8.96402 9.66855 9.09566 9.35066 9.33 9.11625L13.75 4.69625L15.5175 6.465L13.2325 8.75H18.75C20.7391 8.75 22.6468 9.54018 24.0533 10.9467C25.4598 12.3532 26.25 14.2609 26.25 16.25C26.25 18.2391 25.4598 20.1468 24.0533 21.5533C22.6468 22.9598 20.7391 23.75 18.75 23.75H5V21.25H18.75C20.0761 21.25 21.3479 20.7232 22.2855 19.7855C23.2232 18.8479 23.75 17.5761 23.75 16.25C23.75 14.9239 23.2232 13.6521 22.2855 12.7145C21.3479 11.7768 20.0761 11.25 18.75 11.25H13.2325Z"
            fill="black"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>All Items</Text>
      <View style={styles.itemContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading items...</Text>
          </View>
        ) : (
          <FlatList<number>
            data={rowIndices}
            renderItem={renderRow}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {addButoton && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleItemsCreateTo()}>
            <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <Path
                d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
                fill="black"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
