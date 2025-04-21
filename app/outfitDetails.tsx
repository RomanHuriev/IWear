import { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ScrollView,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";
import { styles as styles } from "@/styles/outfitDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAVE_OUTFIT } from "@/config";

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

export default function OutfitDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const gridSize = Math.floor(width - 20);
  const itemSize = Math.floor(gridSize / 2);

  const ITEM_SPACING = 10;
  const PAGE_WIDTH = gridSize + ITEM_SPACING;

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [outfitName, setOutfitName] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    const loadOutfit = async () => {
      try {
        const storedOutfit = await AsyncStorage.getItem("generatedOutfit");
        if (storedOutfit) {
          const parsedOutfit = JSON.parse(storedOutfit);
          setOutfitItems(Array.isArray(parsedOutfit) ? parsedOutfit : []);
        }
      } catch (error) {
        console.error("Error loading outfit:", error);
        setOutfitItems([]);
      }
    };
    loadOutfit();
  }, []);

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const storedOutfit = await AsyncStorage.getItem("generatedOutfit");
      if (!storedOutfit) {
        console.error("No outfit data found");
        return;
      }

      const items = JSON.parse(storedOutfit);
      const response = await fetch(SAVE_OUTFIT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          setName: outfitName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save outfit");
      }

      await AsyncStorage.removeItem("generatedOutfit");
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error saving outfit:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemPages = () => {
    if (!Array.isArray(outfitItems) || outfitItems.length === 0) {
      return [];
    }

    const pages = [];
    for (let i = 0; i < outfitItems.length; i += 4) {
      pages.push(outfitItems.slice(i, i + 4));
    }
    return pages;
  };

  const pages = getItemPages();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / PAGE_WIDTH);
    setActiveIndex(index);
  };

  const renderPage = ({
    item,
    index,
  }: {
    item: OutfitItem[];
    index: number;
  }) => {
    return (
      <View
        style={[
          styles.gridContainer,
          { width: gridSize, height: gridSize, marginRight: ITEM_SPACING },
        ]}
      >
        {item.map((outfitItem, itemIndex) => (
          <View
            key={outfitItem.id || `${index}-${itemIndex}`}
            style={[styles.item, { width: itemSize, height: itemSize }]}
          >
            <Image source={{ uri: outfitItem.imageUrl }} style={styles.image} />
          </View>
        ))}
      </View>
    );
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <View>
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

                {outfitItems.length > 0 && (
                  <>
                    <FlatList
                      ref={flatListRef}
                      data={pages}
                      renderItem={renderPage}
                      keyExtractor={(_, index) => `page-${index}`}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      snapToInterval={PAGE_WIDTH}
                      decelerationRate="fast"
                      contentContainerStyle={styles.carouselContainer}
                    />
                    {pages.length > 1 && renderPaginationDots()}
                  </>
                )}

                <View style={[styles.inputContainer, styles.inputShadow]}>
                  <TextInput
                    style={styles.inputField}
                    placeholderTextColor="#818181"
                    placeholder="Write a set name"
                    value={outfitName}
                    onChangeText={setOutfitName}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSave}
                    disabled={!outfitName}
                  >
                    <Svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                      <Path
                        d="M22.36 8.9275L36.92 23.6317H5.2V28.8831H36.92L22.36 43.5873L26 47.2633L46.8 26.2574L26 5.25146L22.36 8.9275Z"
                        fill="black"
                      />
                    </Svg>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
