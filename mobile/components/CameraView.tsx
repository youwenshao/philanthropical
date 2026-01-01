import { useState } from "react";
import { View, Text, StyleSheet, Button, Image, Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocation } from "@/hooks/useLocation";
import { uploadToIPFS } from "@/lib/ipfs";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { queueForSync } from "@/lib/offline";
import { isOnline } from "@/lib/offline";

export function CameraView() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
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
      quality: 0.7, // Reduced quality for compression
      exif: true, // Include EXIF data (GPS, etc.)
    });

    if (!result.canceled && result.assets[0]) {
      // Compress image before storing
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1920 } }], // Resize to max width
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhoto(compressed.uri);
      setError(null);
    }
  };

  const uploadPhoto = async (retry = false) => {
    if (!photo) return;

    setUploading(true);
    setError(null);

    try {
      const online = await isOnline();
      
      if (!online) {
        // Queue for sync when online
        await queueForSync("upload_verification", {
          photoUri: photo,
          location,
        });
        Alert.alert(
          "Queued for Upload",
          "You're offline. This will be uploaded when you're back online."
        );
        setPhoto(null);
        return;
      }

      // Retry logic with exponential backoff
      let lastError: Error | null = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const ipfsHash = await uploadToIPFS(photo, location);
          Alert.alert("Success", `Photo uploaded to IPFS: ${ipfsHash}`);
          setPhoto(null);
          setRetryCount(0);
          return;
        } catch (err: any) {
          lastError = err;
          if (attempt < maxRetries - 1) {
            // Wait before retry (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }

      // All retries failed
      throw lastError || new Error("Upload failed after retries");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to upload photo";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
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

  if (uploading) {
    return <LoadingState message="Uploading photo..." />;
  }

  if (error && retryCount < 3) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setRetryCount(retryCount + 1);
          uploadPhoto(true);
        }}
      />
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
            <Button title="Retake" onPress={() => {
              setPhoto(null);
              setError(null);
              setRetryCount(0);
            }} />
            <Button
              title="Upload to IPFS"
              onPress={() => uploadPhoto()}
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

