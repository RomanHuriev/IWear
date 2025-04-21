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
import { styles as styles } from "@/styles/allOutfits";
import { FETCH_ALL_OUTFITS } from "@/config";

interface Item {
  id: string;
  name?: string;
  imageUrl?: string;
  type?: string;
  subtype?: string;
  color?: string;
  outfit_Style?: string;
}

interface OutfitSet {
  id: string;
  name: string;
  itemCount: number;
  items: Item[];
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

export default function AllOutfitsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [outfitSets, setOutfitSets] = useState<OutfitSet[]>([]);
  const [loading, setLoading] = useState(true);

  const sourceScreen = (params.source as string) || "library";

  useEffect(() => {
    const fetchOutfitSets = async () => {
      const token = await getToken();
      try {
        const response = await fetch(FETCH_ALL_OUTFITS, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching outfit sets: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status === "success" && data.sets) {
          setOutfitSets(data.sets);
        }
      } catch (error) {
        console.error("Error fetching outfit sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfitSets();
  }, []);

  const handleOutfitPress = (outfitId: string) => {
    router.push(`/outfitPage?outfitId=${outfitId}`);
  };

  const renderOutfitSet = ({ item }: { item: OutfitSet | "addNew" }) => {
    if (item === "addNew") {
      return (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => router.push(`/allItems?source=allOutfits`)}
        >
          <View style={[styles.imageContainer, styles.addNewContainer]}>
            <Text style={styles.addNewText}>+</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleOutfitPress(item.id)}
      >
        <View style={styles.imageContainer}>
          <View style={styles.outfitItemsGrid}>
            {[0, 1, 2, 3].map((index) => (
              <View key={`${item.id}-${index}`} style={styles.outfitItem}>
                {item.items && item.items[index] ? (
                  item.items[index].imageUrl ? (
                    <Image
                      source={{ uri: item.items[index].imageUrl }}
                      style={styles.outfitItemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.outfitItemPlaceholder}>
                      {item.items[index].name?.[0] || "?"}
                    </Text>
                  )
                ) : null}
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/library")}
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

      <Text style={styles.title}>All Outfits</Text>
      <View style={styles.itemContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading outfits...</Text>
          </View>
        ) : (
          <FlatList
            data={[...outfitSets, "addNew"]}
            renderItem={renderOutfitSet}
            keyExtractor={(item) =>
              typeof item === "string" ? "add-new" : item.id
            }
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}
      </View>
    </View>
  );
}
