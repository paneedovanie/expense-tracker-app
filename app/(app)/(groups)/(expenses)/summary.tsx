"use client";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useExport } from "@/hooks";
import { generateExpenseSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
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

  const { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage } =
    useExport({
      groupName: expense?.description ?? "Expense",
      memberCount: expense?.group?.members.length ?? 0,
    });

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    setBase64Image(data);
  }, []);

  const extractAsPdf = useCallback(async () => {
    if (!html) return;
    await exportAsPdf(html);
  }, [html, exportAsPdf]);

  const extractAsImage = useCallback(async () => {
    if (!base64Image || !webviewRef.current) return;

    const cleanBase64 = base64Image.replace(/^data:image\/jpeg;base64,/, "");
    await exportAsImage(cleanBase64, expense?.description ?? "export");
  }, [base64Image, exportAsImage, expense?.description]);

  const extract = useCallback(async () => {
    if (!expense?.group || !webviewRef.current) return;

    Alert.alert(
      "Export Summary",
      "Choose export format",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "As PDF",
          onPress: extractAsPdf,
        },
        {
          text: "As Image",
          onPress: extractAsImage,
        },
      ]
    );
  }, [expense?.group, extractAsPdf, extractAsImage]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          appearance="ghost"
          onPress={extract}
          disabled={isExportingPdf || isExportingImage}
        >
          Export
        </Button>
      ),
    });
  }, [navigation, extract, isExportingPdf, isExportingImage]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [navigation]);

  if (isFetching) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

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
      allowsBackForwardNavigationGestures={false}
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
});