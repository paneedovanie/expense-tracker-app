import { shareAsync } from "expo-sharing";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useExpenses } from "@/hooks";
import { generateExpenseSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import * as Print from "expo-print";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import dayjs from "dayjs";
import { Alert } from "react-native";

export default function ExpenseSummaryScreen() {
  const theme = useTheme();
  const { expenseId } = useLocalSearchParams();
  const navigation = useNavigation();
  const webviewRef = useRef(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const { expense, isFetching } = useExpenses({
    id: expenseId as string,
  });

  const html = (expense && generateExpenseSummaryHtml(theme, expense)) ?? "";

  const extractAsPdf = useCallback(async () => {
    if (!expense?.group) return;
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const { uri } = await Print.printToFileAsync({
      html,
      width: 400 + 80 * expense.group.members.length,
    });

    // New file name
    const newFileName = `${FileSystem.documentDirectory}${
      expense.description
    }_${dayjs().format("MM-DD-YYYY")}.pdf`;

    // Rename the PDF file
    await FileSystem.moveAsync({
      from: uri,
      to: newFileName,
    });

    console.log("File has been saved to:", newFileName);
    await shareAsync(newFileName, { UTI: ".pdf", mimeType: "application/pdf" });
  }, [expense?.group, html]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    setBase64Image(data);
  }, []);

  const extractAsImage = useCallback(async () => {
    if (!expense?.group || !webviewRef.current) return;

    try {
      // New file name
      const newFileName = `${FileSystem.documentDirectory}${
        expense.description
      }_${dayjs().format("MM-DD-YYYY")}.jpeg`;

      // Rename the PDF file
      await FileSystem.writeAsStringAsync(
        newFileName,
        (base64Image ?? "").replace(/^data:image\/jpeg;base64,/, ""),
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      console.log("File has been saved to:", newFileName);
      await shareAsync(newFileName, {
        mimeType: "image/jpeg",
      });
    } catch (error) {
      console.error("Error capturing webview as image:", error);
    }
  }, [expense?.group, html, webviewRef.current]);

  const extract = useCallback(async () => {
    if (!expense?.group || !webviewRef.current) return;

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

  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

  // Expense not found
  if (!expense) {
    return (
      <Layout style={styles.centered}>
        <Text status="danger">Expense not found.</Text>
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
