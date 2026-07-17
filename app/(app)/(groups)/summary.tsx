"use client";
import { Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useGroups, useExport } from "@/hooks";
import { generateGroupSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";
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

  const { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage } =
    useExport({
      groupName: group?.name ?? "",
      memberCount: group?.members.length ?? 0,
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
    await exportAsImage(cleanBase64, group?.name ?? "export");
  }, [base64Image, exportAsImage, group?.name]);

  const extract = useCallback(async () => {
    if (!expenses || !webviewRef.current) return;

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
  }, [expenses, extractAsPdf, extractAsImage]);

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

  if (isFetchingGroup || isFetchingExpenses) {
    return (
      <Layout style={styles.centered}>
        <Spinner />
      </Layout>
    );
  }

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