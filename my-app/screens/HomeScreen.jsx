import React from "react";
import { Button, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Animatable.Text animation="slideInLeft">Home</Animatable.Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("Details", { itemId: "Afraz" })}
      />
      <Button
        title="Go to payment"
        onPress={() => navigation.navigate("payment")}
      />
    </View>
  );
};

export default HomeScreen;
