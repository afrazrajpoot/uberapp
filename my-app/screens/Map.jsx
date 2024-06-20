import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useGetAllUsersMutation } from "../redux/storeApi";

export default function Map() {
  const [userData, setUserData] = useState({});
  const [getUserByType, { isError, isLoading, data }] =
    useGetAllUsersMutation();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData1 = await AsyncStorage.getItem("userData");
        if (userData1) {
          const parsedData = JSON.parse(userData1);
          setUserData(parsedData);
          getUserByType({ userType: parsedData?.data?.userType });
        }
      } catch (error) {
        console.error("Error retrieving data: ", error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error fetching location: ", error.message);
      }
    };

    fetchCurrentLocation();
  }, []);

  const onPlaceSelected = (details) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        fetchDetails={true}
        onPress={(data, details = null) => onPlaceSelected(details)}
        query={{
          key: "YOUR_GOOGLE_MAPS_API_KEY",
          language: "en",
        }}
        styles={{
          container: {
            position: "absolute",
            top: 10,
            width: "90%",
            zIndex: 1,
          },
          listView: {
            backgroundColor: "white",
          },
        }}
      />

      <MapView style={styles.map} initialRegion={region} region={region}>
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}

        {currentLocation && (
          <Circle
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            radius={50}
            fillColor="rgba(0, 0, 255, 0.1)"
            strokeColor="rgba(0, 0, 255, 0.3)"
          />
        )}

        {data?.data?.map(
          (item, index) =>
            item?.lat &&
            item?.long && (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(item?.lat),
                  longitude: parseFloat(item?.long),
                }}
                title={item?.name || `User ${index + 1}`}
              />
            )
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
