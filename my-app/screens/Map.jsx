import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useGetAllUsersMutation } from "../redux/storeApi";
import polyline from "@mapbox/polyline";

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
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [nearbyMarkers, setNearbyMarkers] = useState([]);

  // Custom coordinates array
  const customCoordinates = [
    { latitude: 34.052235, longitude: -118.243683 }, // Los Angeles
    { latitude: 40.712776, longitude: -74.005974 }, // New York
    { latitude: 41.878113, longitude: -87.629799 }, // Chicago
    { latitude: 47.606209, longitude: -122.332069 }, // Seattle
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData1 = await AsyncStorage.getItem("userData");
        if (userData1) {
          const parsedData = JSON.parse(userData1);
          setUserData(parsedData);
          const res = await getUserByType({
            userType: parsedData?.data?.userType,
          });
          console.log(res, "redddddd");
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

  useEffect(() => {
    if (currentLocation && data?.data) {
      const nearbyLocations = data.data.filter((location) => {
        const distance = getDistanceFromLatLonInKm(
          currentLocation.latitude,
          currentLocation.longitude,
          location.lat,
          location.long
        );
        return distance <= 10; // Adjust the radius as needed
      });
      setNearbyMarkers(nearbyLocations);
    }
  }, [currentLocation, data]);

  const fetchRoute = async (origin, destination) => {
    const originString = `${origin.latitude},${origin.longitude}`;
    const destinationString = `${destination.latitude},${destination.longitude}`;
    const apiKey = "AIzaSyA7cZCuVvMKML7cS7L-5uzyk5OrSEyqXW8"; // replace with your API key

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originString}&destination=${destinationString}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoords);
      } else {
        console.error("No routes found");
      }
    } catch (error) {
      console.error("Error fetching route: ", error.message);
    }
  };

  const onPlaceSelected = (details) => {
    if (details) {
      const { lat, lng } = details.geometry.location;
      const destinationCoords = { latitude: lat, longitude: lng };
      setDestination(destinationCoords);
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      if (currentLocation) {
        fetchRoute(currentLocation, destinationCoords);
      }
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
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
          key: "AIzaSyA7cZCuVvMKML7cS7L-5uzyk5OrSEyqXW8", // replace with your API key
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
          <Circle
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            radius={10000} // Radius in meters
            fillColor="rgba(0, 0, 255, 0.1)"
            strokeColor="rgba(0, 0, 255, 0.3)"
          />
        )}

        {destination && (
          <>
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="green"
            />
          </>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={2}
          />
        )}

        {nearbyMarkers.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.long),
            }}
            title={item?.name || `User ${index + 1}`}
          />
        ))}

        {customCoordinates.map((coords, index) => (
          <Marker
            key={index}
            coordinate={coords}
            title={`Custom Location ${index + 1}`}
          />
        ))}
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
