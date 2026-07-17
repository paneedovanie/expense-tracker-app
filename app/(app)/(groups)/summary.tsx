"use client";
import { Alert, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useGroups, useExport } from "@/hooks";
import { captureImageScript } from "@/hooks/use-export";
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
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const { group, isFetching: isFetchingGroup } = useGroups({
    id: groupId as string,
  });

  const { expenses, isFetching: isFetchingExpenses } = useExpenses({
    groupId: groupId as string,
  });

  const html =
    (group && expenses && generateGroupSummaryHtml(theme, group, expenses)) ?? "";

  const { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage } =
    useExport({
      groupName: group?.name ?? "",
      memberCount: group?.members.length ?? 0,
    });

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data.startsWith("ERROR:")) {
      console.error("WebView capture error:", data);
      Alert.alert("Capture Failed", data.replace("ERROR:", ""));
    } else {
      setBase64Image(data);
    }
  }, []);

  const handleError = useCallback(
    (e: { nativeEvent: { description: string } }) => {
      console.error("WebView error:", e.nativeEvent.description);
      setWebViewError(e.nativeEvent.description);
    },
    []
  );

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

    Alert.alert("Export Summary", "Choose export format", [
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
    ]);
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
    <View style={styles.container}>
      {webViewError && (
        <Layout style={styles.errorBanner}>
          <Text status="danger">WebView error: {webViewError}</Text>
        </Layout>
      )}
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        injectedJavaScript={captureImageScript}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        onMessage={handleMessage}
        onError={handleError}
        onLoadEnd={() => console.log("GroupSummary WebView loaded")}
        allowsBackForwardNavigationGestures={false}
        nestedScrollEnabled={true}
        androidLayerType="software"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorBanner: {
    padding: 8,
    backgroundColor: "#ffebee",
  },
});