import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
const CheckLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();
  async function fetchData() {
    const data = await AsyncStorage.getItem("userData");
    console.log(data, "kk");
    if (JSON.parse(data)) {
      setIsLoggedIn(true);
    }
  }
  async function logout() {
    await AsyncStorage.removeItem("userData");
    setIsLoggedIn(false);
    navigation.navigate("register");
  }
  useEffect(() => {
    fetchData();
    // logout();
    if (!isLoggedIn) {
      navigation.navigate("register");
    }
  }, [isLoggedIn, setIsLoggedIn]);
  return <View></View>;
};

export default CheckLogin;
