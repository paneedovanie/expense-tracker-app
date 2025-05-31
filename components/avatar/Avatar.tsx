import {
  Avatar as BaseAvatar,
  AvatarProps as BaseAvatarProps,
} from "@ui-kitten/components";
import {
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { IFile } from "@/types";

const getFileName = (uri: string) => {
  const parts = uri.split("/");
  return parts[parts.length - 1] || "avatar.jpg";
};

interface AvatarProps extends BaseAvatarProps {
  editable?: boolean;
  onChangeImage?: (file: IFile) => void; // Changed to File type
}

export default function Avatar({
  src,
  source,
  editable = false,
  onChangeImage,
  ...props
}: AvatarProps) {
  const [imageUri, setImageUri] = useState<
    string | ImageSourcePropType | undefined
  >(!!src ? { uri: src } : source);

  const defaultSource =
    imageUri ?? require("../../assets/images/default-avatar.jpg");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri({ uri });

      // Convert to File object (works in Expo Go web, not native, but provides a fallback)
      if (onChangeImage) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();

          const file: IFile = {
            uri,
            name: getFileName(uri),
            type: blob.type,
            size: blob.size,
          };
          onChangeImage(file);
        } catch (e) {
          // fallback: call with undefined if conversion fails
          onChangeImage(undefined as unknown as IFile);
        }
      }
    }
  };

  if (editable) {
    return (
      <TouchableOpacity onPress={pickImage} style={styles.editable}>
        <BaseAvatar {...props} source={defaultSource} />
        {/* Optionally, add an edit icon overlay here */}
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    if (!!src) {
      setImageUri({ uri: src });
    }
  }, [src]);

  return <BaseAvatar {...props} source={defaultSource} />;
}

const styles = StyleSheet.create({
  editable: {
    alignSelf: "center",
  },
});
