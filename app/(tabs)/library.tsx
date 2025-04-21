import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Svg, Path } from "react-native-svg";
import { styles as styles } from "@/styles/library";
import { FETCH_LATEST_OUTFITS,ITEMS_LIBRARY } from "@/config";
const ITEM_WIDTH = 120;
const ITEM_SPACING = 15;
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

export default function HomeScreen() {
  const router = useRouter();
  const auth = getAuth(app);
  const [items, setItems] = useState<Item[]>([]);
  const [outfitSets, setOutfitSets] = useState<OutfitSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOutfits, setLoadingOutfits] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [city] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const token = await getToken();
      try {
        const response = await fetch(ITEMS_LIBRARY, {
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
        if (data.items.length > 0) {
          setSelectedItemId(data.items[0].id);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOutfitSets = async () => {
      const token = await getToken();
      try {
        const response = await fetch(FETCH_LATEST_OUTFITS, {
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
          if (data.sets.length > 0) {
            setSelectedOutfitId(data.sets[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching outfit sets:", error);
      } finally {
        setLoadingOutfits(false);
      }
    };
    fetchItems();
    fetchOutfitSets();
  }, [city]);

  const renderItemCarousel = ({
    item,
    index,
  }: {
    item: Item;
    index: number;
  }) => {
    const isSelected = item.id === selectedItemId;

    const handlePress = () => {
      if (isSelected) {
        router.push(`/itemPage?id=${item.id}`);
      } else {
        setSelectedItemId(item.id);
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.itemTile,
          {
            width: isSelected ? 120 : 90,
            height: isSelected ? 120 : 90,
            opacity: isSelected ? 1 : 0.5,
            marginTop: isSelected ? 0 : 15,
            borderRadius: isSelected ? 20 : 10,
          },
        ]}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{item.name?.[0] || "?"}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderOutfitSet = (set: OutfitSet, index: number) => {
    const isSelected = set.id === selectedOutfitId;

    const handlePressSet = () => {
      if (isSelected) {
        router.push(`/outfitPage?outfitId=${set.id}`);
      } else {
        setSelectedOutfitId(set.id);
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    };
    return (
      <TouchableOpacity
        onPress={handlePressSet}
        style={[
          styles.itemTile,
          {
            width: isSelected ? 120 : 90,
            height: isSelected ? 120 : 90,
            opacity: isSelected ? 1 : 0.5,
            marginTop: isSelected ? 0 : 15,
            borderRadius: isSelected ? 20 : 10,
          },
        ]}
      >
        <View style={styles.outfitItemsGrid}>
          {[0, 1, 2, 3].map((index) => (
            <View key={`${set.id}-${index}`} style={styles.outfitItem}>
              {set.items && set.items[index] ? (
                set.items[index].imageUrl ? (
                  <Image
                    source={{ uri: set.items[index].imageUrl }}
                    style={styles.outfitItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.outfitItemPlaceholder}>
                    {set.items[index].name?.[0] || "?"}
                  </Text>
                )
              ) : null}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (ITEM_WIDTH + ITEM_SPACING));

    setActiveIndex(index);
  };

  useEffect(() => {
    if (!loading && items.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, [loading]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13.2325 11.25L15.5175 13.535L13.75 15.3038L9.33 10.8837C9.09566 10.6493 8.96402 10.3315 8.96402 10C8.96402 9.66855 9.09566 9.35066 9.33 9.11625L13.75 4.69625L15.5175 6.465L13.2325 8.75H18.75C20.7391 8.75 22.6468 9.54018 24.0533 10.9467C25.4598 12.3532 26.25 14.2609 26.25 16.25C26.25 18.2391 25.4598 20.1468 24.0533 21.5533C22.6468 22.9598 20.7391 23.75 18.75 23.75H5V21.25H18.75C20.0761 21.25 21.3479 20.7232 22.2855 19.7855C23.2232 18.8479 23.75 17.5761 23.75 16.25C23.75 14.9239 23.2232 13.6521 22.2855 12.7145C21.3479 11.7768 20.0761 11.25 18.75 11.25H13.2325Z"
            fill="black"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your outfits</Text>
      <View style={styles.carouselSectionOutfit}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/allOutfits")}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M13 9.8V10.7L11.3 10.9C8.7 11.3 6.8 12.3 5.4 13.6C7.1 13.1 8.9 12.8 11 12.8H13V14.1L15.2 12L13 9.8ZM11 5L18 12L11 19V14.9C6 14.9 2.5 16.5 0 20C1 15 4 10 11 9M17 8V5L24 12L17 19V16L21 12"
              fill="black"
            />
          </Svg>
        </TouchableOpacity>
        {loadingOutfits ? (
          <View style={styles.loadingContainer}>
            <Text>Loading outfits...</Text>
          </View>
        ) : (
          <FlatList
            data={outfitSets}
            renderItem={({ item, index }) => renderOutfitSet(item, index)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={ITEM_WIDTH + ITEM_SPACING}
            snapToAlignment="start"
            decelerationRate={0.95}
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH + ITEM_SPACING,
              offset: (ITEM_WIDTH + ITEM_SPACING) * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING)
              );
              setActiveIndex(newIndex);
            }}
          />
        )}
      </View>

      <Text style={styles.sectionTitle}>Your Items</Text>
      <View style={styles.carouselSectionItem}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/allItems")}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M13 9.8V10.7L11.3 10.9C8.7 11.3 6.8 12.3 5.4 13.6C7.1 13.1 8.9 12.8 11 12.8H13V14.1L15.2 12L13 9.8ZM11 5L18 12L11 19V14.9C6 14.9 2.5 16.5 0 20C1 15 4 10 11 9M17 8V5L24 12L17 19V16L21 12"
              fill="black"
            />
          </Svg>
        </TouchableOpacity>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading items...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={items}
            renderItem={renderItemCarousel}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            snapToInterval={ITEM_WIDTH + ITEM_SPACING}
            snapToAlignment="start"
            decelerationRate={0.95}
            onScroll={handleScroll}
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: ITEM_WIDTH + ITEM_SPACING,
              offset: (ITEM_WIDTH + ITEM_SPACING) * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise((resolve) => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              });
            }}
          />
        )}
      </View>
    </View>
  );
}
