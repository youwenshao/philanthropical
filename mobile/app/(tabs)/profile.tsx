import { View, Text, StyleSheet } from "react-native";
import { useWallet } from "@/hooks/useWallet";

export default function ProfileScreen() {
  const { address, isConnected } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {isConnected ? (
        <View style={styles.card}>
          <Text style={styles.label}>Wallet Address</Text>
          <Text style={styles.value}>{address}</Text>
        </View>
      ) : (
        <Text style={styles.text}>Please connect your wallet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontFamily: "monospace",
  },
  text: {
    fontSize: 16,
    color: "#666",
  },
});

