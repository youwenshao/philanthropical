import { View, Text, StyleSheet } from "react-native";
import { CameraView } from "@/components/CameraView";

export default function VerifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Impact Verification</Text>
      <Text style={styles.subtitle}>
        Take a photo with geolocation to verify impact
      </Text>
      <CameraView />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
});



