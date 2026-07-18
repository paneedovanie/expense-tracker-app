"use client";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useExpenses, useGroups, useExport } from "@/hooks";
import { generateGroupSummaryHtml } from "@/utils";
import { Button, Layout, Spinner, Text, useTheme } from "@ui-kitten/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Alert } from "react-native";
import SummaryTable from "@/components/groups/SummaryTable";
import ImageCaptureView, {
  ImageCaptureRef,
} from "@/components/groups/ImageCaptureView";

export default function GroupSummaryScreen() {
  const theme = useTheme();
  const { groupId } = useLocalSearchParams();
  const navigation = useNavigation();
  const imageCaptureRef = useRef<ImageCaptureRef>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isCapturing, setIsCapturing] = useState(false);

  const { group, isFetching: isFetchingGroup } = useGroups({
    id: groupId as string,
  });

  const { expenses, isFetching: isFetchingExpenses } = useExpenses({
    groupId: groupId as string,
  });

  const html = useMemo(
    () =>
      group && expenses ? generateGroupSummaryHtml(theme, group, expenses) : "",
    [group, expenses, theme]
  );

  const { exportAsPdf, exportAsImage, isExportingPdf, isExportingImage } =
    useExport({
      groupName: group?.name ?? "",
      memberCount: group?.members.length ?? 0,
    });

  const extractAsPdf = useCallback(async () => {
    if (!html) return;
    await exportAsPdf(html);
  }, [html, exportAsPdf]);

  const extractAsImage = useCallback(async () => {
    if (!html || !imageCaptureRef.current) return;

    setIsCapturing(true);
    try {
      const webViewWidth = 400 + 80 * (group?.members.length ?? 0);
      const webViewHeight = 600 + (group?.members.length ?? 0) * 40;

      const base64Image = await imageCaptureRef.current.captureImage(
        html,
        webViewWidth,
        webViewHeight
      );
      await exportAsImage(base64Image, group?.name ?? "export");
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Export Failed", "Could not capture the image.");
    } finally {
      setIsCapturing(false);
    }
  }, [html, group?.name, group?.members.length, exportAsImage]);

  const extract = useCallback(async () => {
    if (!expenses) return;

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
      <SummaryTable group={group} expenses={expenses ?? []} />
      <ImageCaptureView
        ref={imageCaptureRef}
        memberCount={group.members.length}
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
