import { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Path, Svg } from "react-native-svg";
import { styles as styles } from "@/styles/generate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../../firebase/firebaseConfig";
import { KEY_WEATHER, FETCH_USER_CITY,GENERATE_OUTFIT,GENERATE_OUTFIT_BY_MAIN } from "@/config";
interface WeatherData {
  temperature: number | null;
  description: string | null;
}

export default function generateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const [weather, setWeather] = useState<WeatherData>({
    temperature: null,
    description: null,
  });
  const [activeMethod, setActiveMethod] = useState<"options" | "image">(
    "options"
  );
  const [color_Palette, setColor_Palette] = useState<string>("Warm");
  const [outfit_Style, setOutfit_Style] = useState<string>("Sporty");

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>("none");
  const [selectedItemImage, setSelectedItemImage] = useState<string | null>(
    null
  );

  const [city, setCity] = useState<string | null>(null);
  const auth = getAuth(app);

  useEffect(() => {
    if (!params || !params.id) return;

    const itemId = params.id as string;
    let imageUrl = params.imageUrl as string;
    const itemName = decodeURIComponent(
      (params.name as string) || `Item #${itemId}`
    );

    if (imageUrl) {
      const parts = imageUrl.split("?alt=media");
      if (parts.length === 2) {
        const pathParts = parts[0].split("/o/");
        if (pathParts.length === 2) {
          const encodedPath = pathParts[1].replace(/\//g, "%2F");
          imageUrl = `${pathParts[0]}/o/${encodedPath}?alt=media`;
        }
      }
    }

    setSelectedItemId(itemId);
    setSelectedItemImage(imageUrl);
    setSelectedItemName(itemName);
    setActiveMethod("image");
  }, [params]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) return;

      try {

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KEY_WEATHER}&units=metric`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Error fetching weather data: ${response.statusText}`
          );
        }

        const data = await response.json();
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;

        setWeather({ temperature, description });
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    const fetchUserCity = async () => {
      const token = await getToken();
      try {
        const response = await fetch(
          FETCH_USER_CITY,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching city: ${response.statusText}`);
        }
        const data = await response.json();
        setCity(data.city || "Kyiv");
      } catch (error) {
        console.error("Error fetching city:", error);
        setCity("Kyiv");
      }
    };

    fetchUserCity();
    fetchWeather();
  }, [city]);

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

  const generateOutfit = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(
        GENERATE_OUTFIT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            city,
            color_Pallete: color_Palette,
            outfit_Style: outfit_Style,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }

      await AsyncStorage.setItem("generatedOutfit", JSON.stringify(data));

      const stored = await AsyncStorage.getItem("generatedOutfit");
      console.log("Stored data:", stored);

      router.push("/outfitDetails");
    } catch (error) {
      console.error("Error generating outfit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOutfitByMainItem = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      if (!selectedItemId) {
        console.error("No item selected");
        return;
      }

      const response = await fetch(
        GENERATE_OUTFIT_BY_MAIN,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: selectedItemId,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response for item-based generation:", data);

      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }

      await AsyncStorage.setItem("generatedOutfit", JSON.stringify(data));

      router.push("/outfitDetails");
    } catch (error) {
      console.error("Error generating outfit by main item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const TemperatureIcon = () => (
    <Svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <Path
        d="M9.75 5.41667C9.75 4.55472 10.0924 3.72807 10.7019 3.11857C11.3114 2.50908 12.138 2.16667 13 2.16667C13.862 2.16667 14.6886 2.50908 15.2981 3.11857C15.9076 3.72807 16.25 4.55472 16.25 5.41667V14.0833C17.1595 14.7655 17.8313 15.7164 18.1703 16.8016C18.5093 17.8867 18.4982 19.051 18.1387 20.1296C17.7792 21.2081 17.0895 22.1462 16.1672 22.8109C15.2449 23.4756 14.1369 23.8333 13 23.8333C11.8631 23.8333 10.7551 23.4756 9.83282 22.8109C8.91055 22.1462 8.22081 21.2081 7.8613 20.1296C7.50179 19.051 7.49074 17.8867 7.82972 16.8016C8.16869 15.7164 8.84051 14.7655 9.75 14.0833V5.41667ZM13 4.33334C12.7127 4.33334 12.4371 4.44747 12.234 4.65064C12.0308 4.8538 11.9167 5.12935 11.9167 5.41667V14.6629C11.9167 14.8531 11.8666 15.0399 11.7715 15.2046C11.6764 15.3693 11.5397 15.506 11.375 15.6011C10.7553 15.9587 10.2709 16.5108 9.99703 17.1718C9.72313 17.8328 9.675 18.5657 9.86012 19.2568C10.0452 19.948 10.4532 20.5587 11.0209 20.9943C11.5885 21.4299 12.284 21.666 12.9995 21.666C13.7149 21.666 14.4104 21.4299 14.9781 20.9943C15.5457 20.5587 15.9537 19.948 16.1388 19.2568C16.3239 18.5657 16.2758 17.8328 16.0019 17.1718C15.728 16.5108 15.2436 15.9587 14.6239 15.6011C14.4594 15.5059 14.3229 15.3691 14.228 15.2044C14.1331 15.0397 14.0832 14.853 14.0833 14.6629V5.41667C14.0833 5.12935 13.9692 4.8538 13.766 4.65064C13.5629 4.44747 13.2873 4.33334 13 4.33334Z"
        fill="black"
      />
    </Svg>
  );

  const getWeatherIcon = () => {
    const description = weather.description?.toLowerCase() || "";

    if (description.includes("cloud")) {
      return (
        <Svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <Path
            d="M26 12.1875C26.0001 12.9647 25.7773 13.7257 25.3579 14.3801C24.9385 15.0345 24.3402 15.5549 23.634 15.8795C23.3512 15.3826 22.9951 14.9312 22.5777 14.5405C23.2018 14.3705 23.7328 13.9595 24.0538 13.398C24.3749 12.8365 24.4597 12.1705 24.2897 11.5464C24.1197 10.9224 23.7087 10.3914 23.1472 10.0704C22.5857 9.74931 21.9197 9.66446 21.2956 9.83449C21.1833 9.86493 21.0658 9.87089 20.951 9.85197C20.8362 9.83305 20.7267 9.7897 20.6301 9.72483C20.5335 9.65996 20.452 9.57511 20.391 9.476C20.3301 9.37689 20.2911 9.26584 20.2767 9.15036C20.1618 8.21976 19.781 7.34205 19.1798 6.62244C18.5787 5.90282 17.7828 5.37183 16.8875 5.09313C15.9922 4.81442 15.0356 4.79983 14.1322 5.05108C13.2288 5.30234 12.4171 5.8088 11.7942 6.50974C11.0999 6.47806 10.4042 6.52604 9.72075 6.65273C10.3439 5.50518 11.2981 4.57181 12.4591 3.97412C13.6202 3.37643 14.9343 3.14211 16.2303 3.30166C17.5264 3.46121 18.7444 4.00725 19.7258 4.86868C20.7072 5.73012 21.4065 6.86705 21.7327 8.13149C22.2827 8.10373 22.8325 8.18806 23.3488 8.37935C23.8652 8.57064 24.3372 8.86489 24.7363 9.24424C25.1354 9.62359 25.4532 10.0801 25.6705 10.5861C25.8877 11.092 25.9998 11.6369 26 12.1875Z"
            fill="black"
          />
          <Path
            d="M11.375 8.125C13.174 8.12465 14.9099 8.78744 16.2509 9.98662C17.5919 11.1858 18.4437 12.8372 18.6436 14.625H18.6875C19.7649 14.625 20.7983 15.053 21.5601 15.8149C22.322 16.5767 22.75 17.6101 22.75 18.6875C22.75 19.7649 22.322 20.7983 21.5601 21.5601C20.7983 22.322 19.7649 22.75 18.6875 22.75H4.875C3.61621 22.751 2.40584 22.2649 1.49726 21.3937C0.588679 20.5225 0.052321 19.3336 0.000458233 18.0759C-0.0514045 16.8181 0.385249 15.5891 1.21902 14.646C2.05278 13.7029 3.21903 13.1189 4.47363 13.0163C4.97538 11.5864 5.90896 10.3477 7.14529 9.47145C8.38163 8.59522 9.85964 8.12472 11.375 8.125ZM17.0625 15.4375C17.0635 14.0522 16.5588 12.7142 15.6433 11.6746C14.7277 10.635 13.4642 9.9653 12.0899 9.79117C10.7156 9.61704 9.32503 9.95046 8.17913 10.7289C7.03323 11.5073 6.21082 12.6771 5.86625 14.0189C5.81963 14.2005 5.71164 14.3604 5.56059 14.4714C5.40954 14.5825 5.22474 14.6379 5.0375 14.6282C4.60583 14.6091 4.17468 14.6762 3.76926 14.8256C3.36384 14.9751 2.99229 15.2039 2.67634 15.4986C2.36039 15.7934 2.10639 16.1482 1.9292 16.5423C1.75201 16.9364 1.65518 17.3618 1.64437 17.7938C1.63357 18.2257 1.70901 18.6555 1.86628 19.058C2.02355 19.4604 2.25949 19.8275 2.56031 20.1377C2.86112 20.4478 3.22077 20.6949 3.61821 20.8645C4.01566 21.034 4.44292 21.1226 4.875 21.125H18.6875C19.0331 21.1242 19.3746 21.0499 19.6893 20.9071C20.004 20.7642 20.2848 20.5561 20.5129 20.2964C20.741 20.0368 20.9114 19.7316 21.0126 19.4012C21.1137 19.0707 21.1435 18.7225 21.0998 18.3796C21.0562 18.0368 20.9401 17.7071 20.7593 17.4126C20.5786 17.118 20.3372 16.8652 20.0513 16.6711C19.7654 16.4769 19.4414 16.3457 19.101 16.2863C18.7605 16.2269 18.4113 16.2405 18.0765 16.3264C17.9555 16.3574 17.829 16.36 17.7068 16.3342C17.5845 16.3083 17.4699 16.2547 17.3718 16.1773C17.2738 16.1 17.1948 16.0011 17.1412 15.8882C17.0875 15.7754 17.0606 15.6518 17.0625 15.5269V15.4375Z"
            fill="black"
          />
        </Svg>
      );
    } else if (description.includes("sky")) {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M11.25 4C11.25 4.19891 11.329 4.38968 11.4697 4.53033C11.6103 4.67098 11.8011 4.75 12 4.75C12.1989 4.75 12.3897 4.67098 12.5303 4.53033C12.671 4.38968 12.75 4.19891 12.75 4H11.25ZM12.75 2C12.75 1.80109 12.671 1.61032 12.5303 1.46967C12.3897 1.32902 12.1989 1.25 12 1.25C11.8011 1.25 11.6103 1.32902 11.4697 1.46967C11.329 1.61032 11.25 1.80109 11.25 2H12.75ZM11.25 22C11.25 22.1989 11.329 22.3897 11.4697 22.5303C11.6103 22.671 11.8011 22.75 12 22.75C12.1989 22.75 12.3897 22.671 12.5303 22.5303C12.671 22.3897 12.75 22.1989 12.75 22H11.25ZM12.75 20C12.75 19.8011 12.671 19.6103 12.5303 19.4697C12.3897 19.329 12.1989 19.25 12 19.25C11.8011 19.25 11.6103 19.329 11.4697 19.4697C11.329 19.6103 11.25 19.8011 11.25 20H12.75ZM4 12.75C4.19891 12.75 4.38968 12.671 4.53033 12.5303C4.67098 12.3897 4.75 12.1989 4.75 12C4.75 11.8011 4.67098 11.6103 4.53033 11.4697C4.38968 11.329 4.19891 11.25 4 11.25V12.75ZM2 11.25C1.80109 11.25 1.61032 11.329 1.46967 11.4697C1.32902 11.6103 1.25 11.8011 1.25 12C1.25 12.1989 1.32902 12.3897 1.46967 12.5303C1.61032 12.671 1.80109 12.75 2 12.75V11.25ZM22 12.75C22.1989 12.75 22.3897 12.671 22.5303 12.5303C22.671 12.3897 22.75 12.1989 22.75 12C22.75 11.8011 22.671 11.6103 22.5303 11.4697C22.3897 11.329 22.1989 11.25 22 11.25V12.75ZM20 11.25C19.8011 11.25 19.6103 11.329 19.4697 11.4697C19.329 11.6103 19.25 11.8011 19.25 12C19.25 12.1989 19.329 12.3897 19.4697 12.5303C19.6103 12.671 19.8011 12.75 20 12.75V11.25ZM6.87 18.19C6.94369 18.1213 7.00279 18.0385 7.04378 17.9465C7.08477 17.8545 7.10681 17.7552 7.10859 17.6545C7.11037 17.5538 7.09184 17.4538 7.05412 17.3604C7.0164 17.267 6.96026 17.1822 6.88904 17.111C6.81782 17.0397 6.73299 16.9836 6.6396 16.9459C6.54621 16.9082 6.44618 16.8896 6.34548 16.8914C6.24477 16.8932 6.14546 16.9152 6.05346 16.9562C5.96146 16.9972 5.87866 17.0563 5.81 17.13L6.87 18.19ZM4.4 18.54C4.32631 18.6087 4.26721 18.6915 4.22622 18.7835C4.18523 18.8755 4.16319 18.9748 4.16141 19.0755C4.15963 19.1762 4.17816 19.2762 4.21588 19.3696C4.2536 19.463 4.30974 19.5478 4.38096 19.619C4.45218 19.6903 4.53701 19.7464 4.6304 19.7841C4.72379 19.8218 4.82382 19.8404 4.92452 19.8386C5.02523 19.8368 5.12454 19.8148 5.21654 19.7738C5.30854 19.7328 5.39134 19.6737 5.46 19.6L4.4 18.54ZM18.19 17.13C18.1213 17.0563 18.0385 16.9972 17.9465 16.9562C17.8545 16.9152 17.7552 16.8932 17.6545 16.8914C17.5538 16.8896 17.4538 16.9082 17.3604 16.9459C17.267 16.9836 17.1822 17.0397 17.111 17.111C17.0397 17.1822 16.9836 17.267 16.9459 17.3604C16.9082 17.4538 16.8896 17.5538 16.8914 17.6545C16.8932 17.7552 16.9152 17.8545 16.9562 17.9465C16.9972 18.0385 17.0563 18.1213 17.13 18.19L18.19 17.13ZM18.54 19.6C18.6087 19.6737 18.6915 19.7328 18.7835 19.7738C18.8755 19.8148 18.9748 19.8368 19.0755 19.8386C19.1762 19.8404 19.2762 19.8218 19.3696 19.7841C19.463 19.7464 19.5478 19.6903 19.619 19.619C19.6903 19.5478 19.7464 19.463 19.7841 19.3696C19.8218 19.2762 19.8404 19.1762 19.8386 19.0755C19.8368 18.9748 19.8148 18.8755 19.7738 18.7835C19.7328 18.6915 19.6737 18.6087 19.6 18.54L18.54 19.6ZM5.46 4.4C5.31783 4.26752 5.12978 4.1954 4.93548 4.19882C4.74118 4.20225 4.55579 4.28097 4.41838 4.41838C4.28097 4.55579 4.20225 4.74118 4.19882 4.93548C4.1954 5.12978 4.26752 5.31783 4.4 5.46L5.46 4.4ZM5.81 6.87C5.95218 7.00248 6.14022 7.0746 6.33452 7.07118C6.52882 7.06775 6.71421 6.98903 6.85162 6.85162C6.98903 6.71421 7.06775 6.52882 7.07118 6.33452C7.0746 6.14022 7.00248 5.95218 6.87 5.81L5.81 6.87ZM12.75 4V2H11.25V4H12.75ZM12.75 22V20H11.25V22H12.75ZM4 11.25H2V12.75H4V11.25ZM22 11.25H20V12.75H22V11.25ZM5.81 17.13L4.4 18.54L5.46 19.6L6.87 18.19L5.81 17.13ZM18.54 4.4L17.13 5.81L18.19 6.87L19.6 5.46L18.54 4.4ZM17.13 18.19L18.54 19.6L19.6 18.54L18.19 17.13L17.13 18.19ZM4.4 5.46L5.81 6.87L6.87 5.81L5.46 4.4L4.4 5.46ZM15.25 12C15.25 12.862 14.9076 13.6886 14.2981 14.2981C13.6886 14.9076 12.862 15.25 12 15.25V16.75C13.2598 16.75 14.468 16.2496 15.3588 15.3588C16.2496 14.468 16.75 13.2598 16.75 12H15.25ZM12 15.25C11.138 15.25 10.3114 14.9076 9.7019 14.2981C9.09241 13.6886 8.75 12.862 8.75 12H7.25C7.25 13.2598 7.75045 14.468 8.64124 15.3588C9.53204 16.2496 10.7402 16.75 12 16.75V15.25ZM8.75 12C8.75 11.138 9.09241 10.3114 9.7019 9.7019C10.3114 9.09241 11.138 8.75 12 8.75V7.25C10.7402 7.25 9.53204 7.75045 8.64124 8.64124C7.75045 9.53204 7.25 10.7402 7.25 12H8.75ZM12 8.75C12.862 8.75 13.6886 9.09241 14.2981 9.7019C14.9076 10.3114 15.25 11.138 15.25 12H16.75C16.75 10.7402 16.2496 9.53204 15.3588 8.64124C14.468 7.75045 13.2598 7.25 12 7.25V8.75Z"
            fill="black"
          />
        </Svg>
      );
    } else if (description.includes("snow")) {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9.41699 2.476C9.55602 2.33395 9.74576 2.25289 9.94451 2.25064C10.1433 2.24839 10.3348 2.32513 10.477 2.464L12 3.95L13.523 2.463C13.6666 2.33171 13.8556 2.26136 14.0501 2.26682C14.2446 2.27227 14.4294 2.3531 14.5654 2.49223C14.7014 2.63136 14.778 2.81791 14.7791 3.01248C14.7801 3.20705 14.7055 3.39441 14.571 3.535L12.75 5.315V10.715L17.563 8L18.23 5.57C18.2874 5.38386 18.4149 5.22735 18.5857 5.13358C18.7564 5.03982 18.9569 5.01615 19.1448 5.0676C19.3327 5.11906 19.4932 5.24158 19.5923 5.40925C19.6914 5.57693 19.7215 5.77659 19.676 5.966L19.128 7.966L21.19 8.506C21.3825 8.55639 21.5472 8.68121 21.6477 8.85299C21.7482 9.02478 21.7764 9.22946 21.726 9.422C21.6756 9.61455 21.5508 9.77919 21.379 9.87971C21.2072 9.98023 21.0025 10.0084 20.81 9.958L18.308 9.302L13.526 12L18.308 14.698L20.81 14.042C21.0017 13.9937 21.2047 14.0231 21.3749 14.1237C21.5451 14.2243 21.6686 14.388 21.7187 14.5793C21.7688 14.7705 21.7413 14.9738 21.6423 15.1449C21.5433 15.316 21.3808 15.4411 21.19 15.493L19.128 16.033L19.676 18.033C19.705 18.1288 19.7145 18.2295 19.7039 18.329C19.6934 18.4286 19.663 18.525 19.6146 18.6126C19.5662 18.7003 19.5007 18.7773 19.4221 18.8393C19.3434 18.9012 19.2532 18.9468 19.1566 18.9733C19.0601 18.9998 18.9592 19.0067 18.86 18.9936C18.7607 18.9805 18.6651 18.9477 18.5788 18.897C18.4924 18.8464 18.4171 18.779 18.3572 18.6988C18.2973 18.6186 18.254 18.5272 18.23 18.43L17.563 16L12.75 13.284V18.684L14.57 20.464C14.6456 20.5315 14.7068 20.6136 14.7498 20.7053C14.7929 20.7971 14.8168 20.8966 14.8203 20.9979C14.8238 21.0992 14.8067 21.2001 14.7701 21.2946C14.7335 21.3891 14.6781 21.4752 14.6073 21.5478C14.5365 21.6203 14.4517 21.6777 14.3581 21.7165C14.2645 21.7553 14.164 21.7748 14.0626 21.7737C13.9613 21.7726 13.8612 21.7509 13.7685 21.7101C13.6757 21.6692 13.5922 21.61 13.523 21.536L12 20.05L10.477 21.537C10.3334 21.6683 10.1444 21.7386 9.94989 21.7332C9.7554 21.7277 9.57063 21.6469 9.43461 21.5078C9.2986 21.3686 9.22197 21.1821 9.22092 20.9875C9.21988 20.793 9.29448 20.6056 9.42899 20.465L11.249 18.685V13.285L6.43799 16L5.77099 18.43C5.71848 18.6219 5.59189 18.7851 5.41908 18.8836C5.24626 18.9822 5.04138 19.008 4.84949 18.9555C4.65761 18.903 4.49445 18.7764 4.3959 18.6036C4.29735 18.4308 4.27148 18.2259 4.32399 18.034L4.87299 16.034L2.81099 15.494C2.61845 15.4436 2.4538 15.3188 2.35328 15.147C2.25276 14.9752 2.2246 14.7705 2.27499 14.578C2.32539 14.3855 2.4502 14.2208 2.62199 14.1203C2.79377 14.0198 2.99845 13.9916 3.19099 14.042L5.69299 14.698L10.473 12L5.69299 9.302L3.19099 9.958C3.09538 9.98401 2.99557 9.99081 2.89731 9.97801C2.79905 9.96521 2.70431 9.93307 2.61855 9.88345C2.53278 9.83382 2.45771 9.7677 2.39765 9.68889C2.33759 9.61008 2.29374 9.52015 2.26864 9.4243C2.24354 9.32845 2.23768 9.22857 2.2514 9.13044C2.26512 9.03231 2.29814 8.93787 2.34857 8.85258C2.399 8.76729 2.46583 8.69283 2.5452 8.63352C2.62457 8.5742 2.71491 8.5312 2.81099 8.507L4.87299 7.967L4.32399 5.967C4.27706 5.77713 4.30615 5.57644 4.40507 5.40771C4.50399 5.23898 4.66491 5.11557 4.85351 5.06378C5.04212 5.012 5.2435 5.03595 5.4147 5.13051C5.58591 5.22508 5.7134 5.38278 5.76999 5.57L6.43699 8L11.25 10.716V5.316L9.42899 3.536C9.28694 3.39697 9.20588 3.20724 9.20363 3.00849C9.20138 2.80973 9.27812 2.61821 9.41699 2.476Z"
            fill="black"
          />
        </Svg>
      );
    } else if (description.includes("rain")) {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M17.625 16.5H6.375C5.1723 16.4924 4.01488 16.0404 3.12524 15.2311C2.2356 14.4217 1.67656 13.312 1.5556 12.1154C1.43463 10.9188 1.76028 9.71968 2.46994 8.74864C3.1796 7.7776 4.22316 7.10316 5.4 6.855C5.72378 5.34489 6.55563 3.99148 7.75674 3.0206C8.95784 2.04972 10.4556 1.5201 12 1.5201C13.5444 1.5201 15.0422 2.04972 16.2433 3.0206C17.4444 3.99148 18.2762 5.34489 18.6 6.855C19.7768 7.10316 20.8204 7.7776 21.5301 8.74864C22.2397 9.71968 22.5654 10.9188 22.4444 12.1154C22.3234 13.312 21.7644 14.4217 20.8748 15.2311C19.9851 16.0404 18.8277 16.4924 17.625 16.5ZM12 3C10.7202 3.00127 9.48497 3.46997 8.52647 4.31798C7.56797 5.16599 6.95223 6.33491 6.795 7.605L6.75 8.25H6.105C5.2099 8.2858 4.36567 8.67572 3.75806 9.33397C3.15044 9.99223 2.8292 10.8649 2.865 11.76C2.9008 12.6551 3.29072 13.4993 3.94897 14.1069C4.60723 14.7146 5.47989 15.0358 6.375 15H17.625C18.5201 15.0358 19.3928 14.7146 20.051 14.1069C20.7093 13.4993 21.0992 12.6551 21.135 11.76C21.1708 10.8649 20.8496 9.99223 20.2419 9.33397C19.6343 8.67572 18.7901 8.2858 17.895 8.25H17.25L17.175 7.635C17.0252 6.36458 16.4167 5.19258 15.4638 4.33912C14.5109 3.48566 13.2792 3.00947 12 3ZM10.5 22.5C10.3823 22.5014 10.2662 22.473 10.1625 22.4175C9.98586 22.3276 9.85199 22.1714 9.79015 21.9831C9.72832 21.7948 9.74354 21.5896 9.8325 21.4125L11.3325 18.4125C11.3721 18.3173 11.431 18.2313 11.5054 18.1598C11.5798 18.0884 11.6681 18.0331 11.7648 17.9973C11.8616 17.9616 11.9647 17.9462 12.0676 17.952C12.1706 17.9579 12.2712 17.985 12.3633 18.0315C12.4553 18.078 12.5368 18.1431 12.6025 18.2225C12.6683 18.3019 12.717 18.3941 12.7456 18.4932C12.7741 18.5923 12.7819 18.6962 12.7685 18.7985C12.7551 18.9007 12.7207 18.9991 12.6675 19.0875L11.1675 22.0875C11.1052 22.2112 11.0098 22.3152 10.892 22.388C10.7742 22.4608 10.6385 22.4996 10.5 22.5ZM15 22.5C14.8823 22.5014 14.7662 22.473 14.6625 22.4175C14.4859 22.3276 14.352 22.1714 14.2902 21.9831C14.2283 21.7948 14.2435 21.5896 14.3325 21.4125L15.8325 18.4125C15.8721 18.3173 15.931 18.2313 16.0054 18.1598C16.0798 18.0884 16.1681 18.0331 16.2649 17.9973C16.3616 17.9616 16.4647 17.9462 16.5676 17.952C16.6706 17.9579 16.7712 17.985 16.8633 18.0315C16.9553 18.078 17.0368 18.1431 17.1025 18.2225C17.1683 18.3019 17.217 18.3941 17.2456 18.4932C17.2741 18.5923 17.2819 18.6962 17.2685 18.7985C17.2551 18.9007 17.2207 18.9991 17.1675 19.0875L15.6675 22.0875C15.6052 22.2112 15.5098 22.3152 15.392 22.388C15.2742 22.4608 15.1385 22.4996 15 22.5ZM6 22.5C5.88234 22.5014 5.76624 22.473 5.6625 22.4175C5.48586 22.3276 5.35199 22.1714 5.29015 21.9831C5.22832 21.7948 5.24354 21.5896 5.3325 21.4125L6.8325 18.4125C6.87215 18.3173 6.93101 18.2313 7.0054 18.1598C7.07979 18.0884 7.16811 18.0331 7.26485 17.9973C7.36159 17.9616 7.46466 17.9462 7.56763 17.952C7.6706 17.9579 7.77124 17.985 7.86328 18.0315C7.95532 18.078 8.03677 18.1431 8.10255 18.2225C8.16832 18.3019 8.21701 18.3941 8.24556 18.4932C8.27411 18.5923 8.28191 18.6962 8.26848 18.7985C8.25505 18.9007 8.22067 18.9991 8.1675 19.0875L6.6675 22.0875C6.60518 22.2112 6.50982 22.3152 6.392 22.388C6.27418 22.4608 6.1385 22.4996 6 22.5Z"
            fill="black"
          />
        </Svg>
      );
    }
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.weatherContainer}>
        <View style={styles.weatherItem}>
          <TemperatureIcon />
          <Text style={styles.weatherText}>
            {weather.temperature !== null
              ? `${weather.temperature}°C`
              : "Loading..."}
          </Text>
        </View>

        <View style={styles.weatherItem}>
          {getWeatherIcon()}
          <Text style={styles.weatherText}>
            {weather.description
              ? weather.description.charAt(0).toUpperCase() +
                weather.description.slice(1)
              : "Loading..."}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, isLoading && { opacity: 0.5 }]}>
        Generate an outfit based on chosen option
      </Text>

      <View
        style={{
          opacity: isLoading ? 0.5 : activeMethod === "image" ? 0.5 : 1,
          width: "100%",
        }}
      >
        {renderPicker(
          "Outfit Style:",
          outfit_Style,
          (val) => activeMethod === "options" && setOutfit_Style(val),
          ["Sporty", "Casual", "Official"],
          () => setActiveMethod("options"),
          activeMethod === "options" && !isLoading
        )}
        {renderPicker(
          "Color Palette:",
          color_Palette,
          (val) => activeMethod === "options" && setColor_Palette(val),
          ["Warm", "Cold", "Neutral"],
          () => setActiveMethod("options"),
          activeMethod === "options" && !isLoading
        )}
      </View>

      <Text style={[styles.text, isLoading && { opacity: 0.5 }]}>
        or generate based on main item
      </Text>

      <View
        style={{
          opacity: isLoading ? 0.5 : activeMethod === "options" ? 0.5 : 1,
          width: "100%",
        }}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              if (!isLoading) {
                setActiveMethod("image");
                router.push("/allItems?source=generate");
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.inputLabel}>Item:</Text>
            <Text style={styles.inputField}>{selectedItemName}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => {
              if (!isLoading) {
                router.push("/allItems?source=generate");
              }
            }}
          >
            <Svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: 5 }}
            >
              <Path
                d="M20.625 3H7.125C6.62772 3 6.15081 3.19754 5.79917 3.54917C5.44754 3.90081 5.25 4.37772 5.25 4.875V6.75H3.375C2.87772 6.75 2.40081 6.94754 2.04917 7.29917C1.69754 7.65081 1.5 8.12772 1.5 8.625V19.125C1.5 19.6223 1.69754 20.0992 2.04917 20.4508C2.40081 20.8025 2.87772 21 3.375 21H16.875C17.3723 21 17.8492 20.8025 18.2008 20.4508C18.5525 20.0992 18.75 19.6223 18.75 19.125V17.25H20.625C21.1223 17.25 21.5992 17.0525 21.9508 16.7008C22.3025 16.3492 22.5 15.8723 22.5 15.375V4.875C22.5 4.37772 22.3025 3.90081 21.9508 3.54917C21.5992 3.19754 21.1223 3 20.625 3ZM16.5 9V10.5H3.75V9H16.5ZM16.5 18.75H3.75V12.75H16.5V18.75ZM20.25 15H18.75V8.625C18.75 8.12772 18.5525 7.65081 18.2008 7.29917C17.8492 6.94754 17.3723 6.75 16.875 6.75H7.5V5.25H20.25V15Z"
                fill="black"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.imageField,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {selectedItemImage && activeMethod === "image" && (
          <Image
            source={{ uri: selectedItemImage }}
            style={{
              width: "90%",
              height: "90%",
              borderRadius: 8,
              resizeMode: "cover",
            }}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            if (activeMethod === "options") {
              generateOutfit();
            } else if (selectedItemId) {
              generateOutfitByMainItem();
            } else {
              router.push("/allItems?source=generate");
            }
          }}
          disabled={isLoading}
        >
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
  );
}

const renderPicker = (
  label: string,
  selectedValue: string,
  onValueChange: (val: string) => void,
  items: string[],
  onContainerPress: () => void,
  isActive: boolean
) => {
  const pickerRef = useRef<Picker<string> | null>(null);

  return (
    <View style={styles.inputContainer} onTouchStart={onContainerPress}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.selectedValue}>{selectedValue}</Text>
        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <Path
            d="M8.16675 11.6667L14.0001 17.5L19.8334 11.6667H8.16675Z"
            fill="black"
          />
        </Svg>
      </View>
      <Picker
        ref={pickerRef}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[styles.picker, { display: !isActive ? "none" : "flex" }]}
        enabled={isActive}
      >
        {items.map((item) => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>
    </View>
  );
};
