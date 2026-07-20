import {
  Icon,
  Layout,
  Modal,
  Text,
  Button,
  Card,
  Spinner,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { IFile } from "@/types";

interface ScanButtonProps {
  onImageSelected: (file: IFile) => void;
  loading?: boolean;
}

export default function ScanButton({
  onImageSelected,
  loading = false,
}: ScanButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const getFileName = (uri: string) => {
    const parts = uri.split("/");
    return parts[parts.length - 1] || "receipt.jpg";
  };

  const handleCamera = async () => {
    setModalVisible(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const file: IFile = {
        uri,
        name: getFileName(uri),
        type: blob.type || "image/jpeg",
        size: blob.size,
      };

      onImageSelected(file);
    }
  };

  const handleGallery = async () => {
    setModalVisible(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const file: IFile = {
        uri,
        name: getFileName(uri),
        type: blob.type || "image/jpeg",
        size: blob.size,
      };

      onImageSelected(file);
    }
  };

  const handlePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCamera();
          } else if (buttonIndex === 2) {
            handleGallery();
          }
        }
      );
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Icon name="camera" fill="#fff" style={styles.icon} />
            <Text style={styles.text}>Scan Receipt</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropStyle={styles.backdrop}
      >
        <Card style={styles.modalCard}>
          <Text category="h6" style={styles.modalTitle}>
            Select Image Source
          </Text>
          <View style={styles.modalButtons}>
            <Button
              style={styles.modalButton}
              onPress={handleCamera}
              accessoryLeft={<Icon name="camera" />}
            >
              Camera
            </Button>
            <Button
              style={styles.modalButton}
              onPress={handleGallery}
              accessoryLeft={<Icon name="image" />}
            >
              Gallery
            </Button>
          </View>
          <Button appearance="ghost" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
        </Card>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: "#1A7270",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalCard: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});