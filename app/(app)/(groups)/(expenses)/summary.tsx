"use client";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useExport } from "@/hooks";
import { generateExpenseSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Alert } from "react-native";
import SummaryTable from "@/components/groups/SummaryTable";
import ImageCaptureView, { ImageCaptureRef } from "@/components/groups/ImageCaptureView";

export default function ExpenseSummaryScreen() {
  const theme = useTheme();
  const { expenseId } = useLocalSearchParams();
  const navigation = useNavigation();
  const imageCaptureRef = useRef<ImageCaptureRef>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { expense, isFetching } = useExpenses({
    id: expenseId as string,
  });

  const html = useMemo(
    () => (expense?.group ? generateExpenseSummaryHtml(theme, expense) : ""),
    [expense, theme]
  );

  const { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage } =
    useExport({
      groupName: expense?.description ?? "Expense",
      memberCount: expense?.group?.members.length ?? 0,
    });

  const extractAsPdf = useCallback(async () => {
    if (!html) return;
    await exportAsPdf(html);
  }, [html, exportAsPdf]);

  const extractAsImage = useCallback(async () => {
    if (!html || !imageCaptureRef.current) return;

    setIsCapturing(true);
    try {
      const webViewWidth = 400 + 80 * (expense?.group?.members.length ?? 0);
      const webViewHeight = 600 + (expense?.group?.members.length ?? 0) * 40;

      const base64Image = await imageCaptureRef.current.captureImage(
        html,
        webViewWidth,
        webViewHeight
      );
      await exportAsImage(base64Image, expense?.description ?? "export");
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Export Failed", "Could not capture the image.");
    } finally {
      setIsCapturing(false);
    }
  }, [html, expense?.description, expense?.group?.members.length, exportAsImage]);

  const extract = useCallback(async () => {
    if (!expense?.group) return;

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
          disabled={isExportingPdf || isExportingImage || isCapturing}
        >
          Export
        </Button>
      ),
    });
  }, [navigation, extract, isExportingPdf, isExportingImage, isCapturing]);

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
    <View style={styles.container}>
      <SummaryTable group={expense.group} expenses={[expense]} />
      <ImageCaptureView
        ref={imageCaptureRef}
        memberCount={expense.group.members.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});