import { useCallback, useState } from "react";
import { File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import * as Print from "expo-print";
import dayjs from "dayjs";

interface UseExportProps {
  groupName: string;
  memberCount: number;
}

export function useExport({ groupName, memberCount }: UseExportProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const exportAsPdf = useCallback(
    async (html: string) => {
      if (!html || html.trim() === "") {
        Alert.alert("Error", "No content to export.");
        return;
      }

      setIsExportingPdf(true);
      try {
        const { uri } = await Print.printToFileAsync({
          html,
          width: 400 + 80 * memberCount,
        });

        const safeName = groupName.replace(/[^a-zA-Z0-9 _-]/g, "_");
        const targetFile = new File(
          Paths.cache,
          `${safeName}_${dayjs().format("MM-DD-YYYY")}.pdf`
        );

        if (targetFile.exists) {
          targetFile.delete();
        }

        const sourceFile = new File(uri);
        sourceFile.copy(targetFile);

        await Sharing.shareAsync(targetFile.uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      } catch (error) {
        console.error("Error exporting PDF:", error);
        Alert.alert("Export Failed", "Could not export the summary as PDF.");
      } finally {
        setIsExportingPdf(false);
      }
    },
    [groupName, memberCount]
  );

  const exportAsImage = useCallback(
    async (base64Data: string, fileName: string) => {
      if (!base64Data) {
        Alert.alert("Error", "No image data.");
        return;
      }

      setIsExportingImage(true);
      try {
        const safeName = fileName.replace(/[^a-zA-Z0-9 _-]/g, "_");
        const targetUri =
          FileSystemLegacy.cacheDirectory +
          `${safeName}_${dayjs().format("MM-DD-YYYY")}.jpg`;

        const info = await FileSystemLegacy.getInfoAsync(targetUri);
        if (info.exists) {
          await FileSystemLegacy.deleteAsync(targetUri, { idempotent: true });
        }

        await FileSystemLegacy.writeAsStringAsync(targetUri, base64Data, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });

        await Sharing.shareAsync(targetUri, {
          mimeType: "image/jpeg",
        });
      } catch (error) {
        console.error("Error exporting image:", error);
        Alert.alert("Export Failed", "Could not export the image.");
      } finally {
        setIsExportingImage(false);
      }
    },
    []
  );

  return { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage };
}
