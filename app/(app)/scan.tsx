import {
  Layout,
  Text,
  Spinner,
  Icon,
  Select,
  SelectItem,
  IndexPath,
} from "@ui-kitten/components";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useOcr, useGroups } from "@/hooks";
import { IFile, IOcrResultData, IGroup } from "@/types";
import { useToast } from "@/components/providers/ToastProvider";
import * as ImagePicker from "expo-image-picker";

export default function ScanScreen() {
  const toast = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<IFile | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<IndexPath | undefined>(
    undefined
  );
  const { mutateAsync: scanReceipt } = useOcr();
  const { groups, isFetching: isFetchingGroups } = useGroups();

  const getFileName = (uri: string) => {
    const parts = uri.split("/");
    return parts[parts.length - 1] || "receipt.jpg";
  };

  const handleImageSelected = async (file: IFile) => {
    const selectedGroup = selectedGroupIndex !== undefined
      ? groups?.[selectedGroupIndex.row]
      : groups?.[0];

    if (!selectedGroup) {
      toast.showToast({
        status: "warning",
        message: "Please select a group first to add expense",
      });
      return;
    }

    setSelectedImage(file);
    setIsScanning(true);

    try {
      const result = await scanReceipt(file);

      if (result.success && result.data) {
        const ocrData: IOcrResultData = result.data;
        const encodedData = encodeURIComponent(JSON.stringify(ocrData));

        router.push({
          pathname: "/(app)/(groups)/(expenses)/add",
          params: {
            groupId: selectedGroup.id,
            ocrData: encodedData,
          },
        });
      } else {
        toast.showToast({
          status: "danger",
          message: result.error || "Failed to scan receipt",
        });
      }
    } catch (error) {
      toast.showToast({
        status: "danger",
        message: "Failed to scan receipt. Please try again.",
      });
    } finally {
      setIsScanning(false);
      setSelectedImage(null);
    }
  };

  const handleCamera = async () => {
    const selectedGroup = selectedGroupIndex !== undefined
      ? groups?.[selectedGroupIndex.row]
      : groups?.[0];

    if (!selectedGroup) {
      toast.showToast({
        status: "warning",
        message: "Please select a group first to add expense",
      });
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.showToast({
        status: "warning",
        message: "Camera permission is required to scan receipts",
      });
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

      handleImageSelected(file);
    }
  };

  const handleGallery = async () => {
    const selectedGroup = selectedGroupIndex !== undefined
      ? groups?.[selectedGroupIndex.row]
      : groups?.[0];

    if (!selectedGroup) {
      toast.showToast({
        status: "warning",
        message: "Please select a group first to add expense",
      });
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.showToast({
        status: "warning",
        message: "Gallery permission is required to select images",
      });
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

      handleImageSelected(file);
    }
  };

  const handleScan = () => {
    const selectedGroup = selectedGroupIndex
      ? groups?.[selectedGroupIndex.row]
      : groups?.[0];

    if (!selectedGroup) {
      toast.showToast({
        status: "warning",
        message: "Please select a group first",
      });
      return;
    }

    handleCamera();
  };

  if (isScanning) {
    return (
      <Layout style={styles.container}>
        <View style={styles.loadingContainer}>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.loadingOverlay}>
            <Spinner size="giant" />
            <Text style={styles.loadingText}>Scanning receipt...</Text>
            <Text style={styles.loadingSubtext}>
              Extracting expense data
            </Text>
          </View>
        </View>
      </Layout>
    );
  }

  const groupsList = groups || [];
  const selectedGroupName = selectedGroupIndex
    ? groupsList[selectedGroupIndex.row]?.name
    : groupsList[0]?.name || "Select Group";

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Text category="h4" style={styles.title}>
          Scan Receipt
        </Text>
        <Text category="p2" appearance="hint" style={styles.subtitle}>
          Take a photo or select from gallery to automatically extract expense
          data
        </Text>
      </View>

      <View style={styles.groupSelectorContainer}>
        <Text category="s1" style={styles.groupSelectorLabel}>
          Add to Group
        </Text>
        <Select
          style={styles.groupSelector}
          placeholder="Select a group"
          value={selectedGroupName}
          selectedIndex={selectedGroupIndex}
          onSelect={(index) => setSelectedGroupIndex(index as IndexPath)}
        >
          {isFetchingGroups ? (
            <SelectItem title="Loading..." />
          ) : groupsList.length > 0 ? (
            groupsList.map((group: IGroup, index: number) => (
              <SelectItem key={group.id} title={group.name} />
            ))
          ) : (
            <SelectItem title="No groups available" />
          )}
        </Select>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            !selectedGroupName && styles.optionCardDisabled,
          ]}
          onPress={handleCamera}
        >
          <View style={styles.optionIconContainer}>
            <Icon name="camera" fill="#1A7270" style={styles.optionIcon} />
          </View>
          <Text category="s1" style={styles.optionTitle}>
            Camera
          </Text>
          <Text category="p2" appearance="hint" style={styles.optionDescription}>
            Take a photo of your receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            !selectedGroupName && styles.optionCardDisabled,
          ]}
          onPress={handleGallery}
        >
          <View style={styles.optionIconContainer}>
            <Icon name="image" fill="#1A7270" style={styles.optionIcon} />
          </View>
          <Text category="s1" style={styles.optionTitle}>
            Gallery
          </Text>
          <Text category="p2" appearance="hint" style={styles.optionDescription}>
            Select from your photos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoCard}>
          <Icon name="info" fill="#8F9BB3" style={styles.infoIcon} />
          <Text category="p2" appearance="hint" style={styles.infoText}>
            Supported formats: JPEG, PNG
          </Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    color: "#222B45",
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#8F9BB3",
  },
  groupSelectorContainer: {
    marginBottom: 24,
  },
  groupSelectorLabel: {
    color: "#222B45",
    fontWeight: "600",
    marginBottom: 8,
  },
  groupSelector: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  optionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    shadowColor: "#222",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  optionIcon: {
    width: 32,
    height: 32,
  },
  optionTitle: {
    color: "#222B45",
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#8F9BB3",
    textAlign: "center",
  },
  footer: {
    paddingVertical: 24,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#222",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  infoText: {
    color: "#8F9BB3",
  },
  loadingContainer: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  loadingOverlay: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  loadingSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 4,
  },
});