import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";

export default function PaymentScreen({ navigation }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [currency, setCurrency] = useState("eur");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (clientSecret) {
      initializePaymentSheet();
    }
  }, [clientSecret]);

  const fetchPaymentSheetParams = async () => {
    try {
      let data = {
        currency: currency,
        amount: parseInt(amount, 10) * 100, // Convert to smallest currency unit
      };

      const response = await fetch("http://192.168.1.104:3000/payment-sheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { paymentIntent, ephemeralKey, customer } = await response.json();
      return {
        paymentIntent,
        ephemeralKey,
        customer,
      };
    } catch (err) {
      console.error(err);
      Alert.alert("Payment setup failed", err.message);
      return null;
    }
  };

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams();

    if (!paymentIntent) {
      setProcessing(false);
      return;
    }

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: "Merchant Name",
    });

    if (error) {
      Alert.alert("Payment initialization failed", error.message);
      setProcessing(false);
    } else {
      setProcessing(false);
      handlePresentPaymentSheet();
    }
  };

  const handlePresentPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert("Payment failed", error.message);
    } else {
      Alert.alert("Success", "Your payment was successful!");
    }

    setProcessing(false);
  };

  const handlePayPress = async () => {
    setProcessing(true);
    await initializePaymentSheet();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Screen</Text>

      <TextInput
        style={styles.input}
        placeholder="Currency (e.g., eur)"
        value={currency}
        onChangeText={setCurrency}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayPress}
        disabled={processing}
      >
        <Text style={styles.payButtonText}>
          {processing ? "Processing..." : "Pay"}
        </Text>
      </TouchableOpacity>
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => navigation.navigate("Map")}
        >
          <Text style={styles.payButtonText}>Go to map</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => navigation.navigate("register")}
        >
          <Text style={styles.payButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  payButton: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});
