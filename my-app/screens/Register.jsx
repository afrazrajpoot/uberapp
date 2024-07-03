import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRegisterUserMutation } from "../redux/storeApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import useLocation from "../customHooks/useLocation";
import axios from "axios";

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [password, setPassword] = useState("");
  const [registerUser, { isError, isLoading, isSuccess }] =
    useRegisterUserMutation();
  const [userData, setUserData] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !userType || !password) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    try {
      const response = await registerUser({
        name,
        email,
        userType: userType.toLocaleLowerCase(),
        password,
      });
      // console.log(response.data, "fffffff");
      if (response.data) {
        await AsyncStorage.setItem("userData", JSON.stringify(response.data));
        Alert.alert("Success", "User registered successfully");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to register user");
    }
  };
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
        console.error("Error retrieving data: ", error.message);
      }
    };

    fetchData();
  }, [currentLocation]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register User</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="User Type"
        value={userType}
        onChangeText={setUserType}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} disabled={isLoading} />
      {isLoading && <Text>Loading...</Text>}
      {isSuccess && <Text>User registered successfully!</Text>}
      {isError && <Text>Failed to register user</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Register;
