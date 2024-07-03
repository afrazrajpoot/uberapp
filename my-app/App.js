import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Alert } from "react-native";
import PaymentScreen from "./screens/Payment";
import Map from "./screens/Map"; // Make sure the path is correct
import Register from "./screens/Register";

import { Provider } from "react-redux";
import { store } from "./redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import useLocation from "./customHooks/useLocation";
import { GlobalContextProvider } from "./context/GlobalStateProvider";
import CheckLogin from "./screens/CheckLogin";

const Stack = createStackNavigator();

export default function App() {
  const [userData, setUserData] = useState(null);

  const { currentLocation } = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData1 = await AsyncStorage.getItem("userData");
        if (userData1) {
          const parsedData = JSON.parse(userData1);

          setUserData(parsedData);
          if (
            (parsedData?.data?._id && currentLocation?.latitude) ||
            currentLocation?.longitude
          ) {
            await axios.post(
              "http://192.168.1.102:3000/api/v1/getUserLocation",
              {
                id: parsedData.data._id,
                lat: currentLocation?.latitude,
                long: currentLocation?.longitude,
              }
            );
          }
        }
      } catch (error) {
        // console.error("Error retrieving data kkkk: ", error.message);
        alert("please login again");
      }
    };

    fetchData();
  }, [currentLocation]);
  // console.log(userData, "myData");

  return (
    <Provider store={store}>
      <GlobalContextProvider>
        <StripeProvider publishableKey="pk_test_51PQFreRvJI1ePtmLcNj1cfOWDLO7hiiJ7We2fNJxyAOOrqDse9wNZSvxSII3f6PyDBIz4LakPITeYQGaRfrM4rb900i2aZENEZ">
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Payment">
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Map" component={Map} />
              <Stack.Screen name="register" component={Register} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </StripeProvider>
      </GlobalContextProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
