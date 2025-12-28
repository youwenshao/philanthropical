import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useWallet } from "@/hooks/useWallet";

export default function HomeScreen() {
  const { address, isConnected } = useWallet();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Philanthropical</Text>
        <Text style={styles.subtitle}>Impact Verification</Text>

        {isConnected ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Wallet Connected</Text>
            <Text style={styles.cardText}>{address?.slice(0, 10)}...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connect Wallet</Text>
            <Text style={styles.cardText}>
              Connect your wallet to start verifying impact
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
});

