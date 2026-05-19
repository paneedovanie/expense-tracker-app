'use client';
import { shareAsync } from "expo-sharing";
import { Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useExpenses, useGroups } from "@/hooks";
import { generateGroupSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import * as Print from "expo-print";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import dayjs from "dayjs";

export default function GroupSummaryScreen() {
  const theme = useTheme();
  const { groupId } = useLocalSearchParams();
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const { group, isFetching: isFetchingGroup } = useGroups({
    id: groupId as string,
  });

  const { expenses, isFetching: isFetchingExpenses } = useExpenses({
    groupId: groupId as string,
  });

  const html =
    (group && generateGroupSummaryHtml(theme, group, expenses)) ?? "";

  const extractAsPdf = useCallback(async () => {
    if (!expenses || !group) return;
    try {
      // On iOS/android prints the given html. On web prints the HTML from the current page.
      const { uri } = await Print.printToFileAsync({
        html,
        width: 400 + 80 * (group?.members.length ?? 0),
      });

      // Move the generated PDF to the target location using the new File API
      const sourceFile = new FileSystem.File(uri);
      // Sanitize filename to avoid invalid characters
      const safeName = group.name.replace(/[^a-zA-Z0-9 _-]/g, '_');
      const targetFile = new FileSystem.File(
        FileSystem.Paths.cache,
        `${safeName}_${dayjs().format("MM-DD-YYYY")}.pdf`
      );
      
      // Delete existing file if it exists to prevent FileAlreadyExistsException
      if (targetFile.exists) {
        targetFile.delete();
      }
      
      sourceFile.move(targetFile);

      console.log("File has been saved to:", targetFile.uri);
      await shareAsync(targetFile.uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      Alert.alert("Export Failed", "Could not export the summary as PDF.");
    }
  }, [expenses, html, group]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    setBase64Image(data);
    console.log(data);
  }, []);

  const extractAsImage = useCallback(async () => {
    if (!expenses || !webviewRef.current) return;

    try {
      // Write image using new File API
      const file = new FileSystem.File(
        FileSystem.Paths.cache,
        `${group?.name}_${dayjs().format("MM-DD-YYYY")}.jpeg`
      );
      file.write((base64Image ?? "").replace(/^data:image\/jpeg;base64,/, ""), {
        encoding: "base64",
      });

      console.log("File has been saved to:", file.uri);
      await shareAsync(file.uri, {
        mimeType: "image/jpeg",
      });
    } catch (error) {
      console.error("Error capturing webview as image:", error);
    }
  }, [expenses, html, webviewRef.current, base64Image, group?.name]);

  const extract = useCallback(async () => {
    if (!expenses || !webviewRef.current) return;

    Alert.alert(
      "Export as Image",
      "Are you sure you want to export this summary?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "As Pdf",
          onPress: extractAsPdf,
        },
        {
          text: "As Image",
          onPress: extractAsImage,
        },
      ]
    );
  }, [extractAsPdf, extractAsImage]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button appearance="ghost" onPress={extract}>
          Export
        </Button>
      ),
    });
  }, [navigation, extract]);

  if (isFetchingGroup || isFetchingExpenses) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  // Group not found
  if (!group) {
    return (
      <Layout style={styles.centered}>
        <Text status="danger">Group not found.</Text>
      </Layout>
    );
  }

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={handleMessage}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  summaryCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#222",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#222B45",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#8F9BB3",
  },
  summaryValue: {
    fontSize: 14,
    color: "#222B45",
    fontWeight: "600",
  },
  exportRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  exportButton: {
    backgroundColor: "#1A7270",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
