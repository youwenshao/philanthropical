import { useState } from "react";
import { View, Text, StyleSheet, Button, Image, Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocation } from "@/hooks/useLocation";
import { uploadToIPFS } from "@/lib/ipfs";

export function CameraView() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { location, getLocation } = useLocation();

  const takePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission denied", "Camera permission is required");
        return;
      }
    }

    // Get location first
    await getLocation();

    // For now, use ImagePicker as a simpler alternative
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      exif: true, // Include EXIF data (GPS, etc.)
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;

    setUploading(true);
    try {
      const ipfsHash = await uploadToIPFS(photo, location);
      Alert.alert("Success", `Photo uploaded to IPFS: ${ipfsHash}`);
      setPhoto(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.preview}>
          <Image source={{ uri: photo }} style={styles.image} />
          {location && (
            <Text style={styles.location}>
              Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          )}
          <View style={styles.buttons}>
            <Button title="Retake" onPress={() => setPhoto(null)} />
            <Button
              title={uploading ? "Uploading..." : "Upload to IPFS"}
              onPress={uploadPhoto}
              disabled={uploading}
            />
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Button title="Take Photo" onPress={takePhoto} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },
  location: {
    padding: 16,
    fontSize: 14,
    color: "#666",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
});

