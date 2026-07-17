import { useCallback, useState } from "react";
import * as Print from "expo-print";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import dayjs from "dayjs";

export const captureImageScript =
  "(function(){" +
  "var retries=20;" +
  "function attempt(){" +
  "var node=document.querySelector('#body');" +
  "if(!node){window.ReactNativeWebView.postMessage('ERROR:#body not found');return;}" +
  "window.domtoimage.toJpeg(node,{quality:0.95})" +
  ".then(function(dataUrl){window.ReactNativeWebView.postMessage(dataUrl);})" +
  ".catch(function(err){window.ReactNativeWebView.postMessage('ERROR:'+err.message);});" +
  "}" +
  "function check(){" +
  "if(window.domtoimage){attempt();}" +
  "else if(retries-->0){setTimeout(check,200);}" +
  "else{window.ReactNativeWebView.postMessage('ERROR:domtoimage failed to load');}" +
  "}" +
  "check();" +
  "})();" +
  "true;";

interface UseExportProps {
  groupName: string;
  memberCount: number;
}

export function useExport({ groupName, memberCount }: UseExportProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const exportAsPdf = useCallback(
    async (html: string) => {
      if (!html) return;

      setIsExportingPdf(true);
      try {
        const { uri } = await Print.printToFileAsync({
          html,
          width: 400 + 80 * memberCount,
        });

        const safeName = groupName.replace(/[^a-zA-Z0-9 _-]/g, "_");
        const targetUri =
          FileSystemLegacy.cacheDirectory +
          `${safeName}_${dayjs().format("MM-DD-YYYY")}.pdf`;

        const info = await FileSystemLegacy.getInfoAsync(targetUri);
        if (info.exists) {
          await FileSystemLegacy.deleteAsync(targetUri, { idempotent: true });
        }

        await FileSystemLegacy.moveAsync({ from: uri, to: targetUri });

        await Sharing.shareAsync(targetUri, {
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
        Alert.alert("No Image", "Please capture an image first.");
        return;
      }

      setIsExportingImage(true);
      try {
        const safeName = fileName.replace(/[^a-zA-Z0-9 _-]/g, "_");
        const fileUri =
          FileSystemLegacy.cacheDirectory +
          `${safeName}_${dayjs().format("MM-DD-YYYY")}.jpeg`;

        await FileSystemLegacy.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystemLegacy.EncodingType.Base64,
        });

        await Sharing.shareAsync(fileUri, {
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