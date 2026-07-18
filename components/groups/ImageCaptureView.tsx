"use client";
import { useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { domtoimageLib } from "@/utils/domtoimage";

export interface ImageCaptureRef {
  captureImage: (html: string, width: number, height: number) => Promise<string>;
}

interface ImageCaptureViewProps {
  memberCount: number;
}

const ImageCaptureView = forwardRef<ImageCaptureRef, ImageCaptureViewProps>(
  ({ memberCount }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const containerRef = useRef<View>(null);
    const [currentHtml, setCurrentHtml] = useState("");
    const [webViewHeight, setWebViewHeight] = useState(600 + memberCount * 40);
    const webViewWidth = 400 + 80 * memberCount;

    const capturePromiseRef = useRef<{ resolve?: (value: string) => void; reject?: (error: Error) => void } | null>(null);

    const captureScript = `
      (function() {
        var retries = 20;
        function attempt() {
          var node = document.querySelector('#body');
          if (!node) {
            window.ReactNativeWebView.postMessage('ERROR:#body not found');
            return;
          }
          window.domtoimage.toJpeg(node, {quality: 0.95})
            .then(function(dataUrl) {
              window.ReactNativeWebView.postMessage(dataUrl);
            })
            .catch(function(err) {
              window.ReactNativeWebView.postMessage('ERROR:' + err.message);
            });
        }
        function check() {
          if (window.domtoimage) {
            attempt();
          } else if (retries-- > 0) {
            setTimeout(check, 200);
          } else {
            window.ReactNativeWebView.postMessage('ERROR:domtoimage failed to load');
          }
        }
        check();
      })();
      true;
    `;

    const handleMessage = useCallback((event: WebViewMessageEvent) => {
      const data = event.nativeEvent.data;
      if (data.startsWith("ERROR:")) {
        if (capturePromiseRef.current?.reject) {
          capturePromiseRef.current.reject(new Error(data.replace("ERROR:", "")));
          capturePromiseRef.current = null;
        }
      } else if (data.startsWith("data:")) {
        const cleanBase64 = data.replace(/^data:image\/jpeg;base64,/, "");
        if (capturePromiseRef.current?.resolve) {
          capturePromiseRef.current.resolve(cleanBase64);
          capturePromiseRef.current = null;
        }
      }
    }, []);

    useImperativeHandle(ref, () => ({
      captureImage: async (html: string, width: number, height: number) => {
        if (!webViewRef.current) {
          throw new Error("WebView not ready");
        }

        setCurrentHtml(html);
        setWebViewHeight(height);

        return new Promise((resolve, reject) => {
          capturePromiseRef.current = { resolve, reject };

          const timeout = setTimeout(() => {
            const promise = capturePromiseRef.current;
            if (promise?.reject) {
              promise.reject(new Error("Capture timed out"));
              capturePromiseRef.current = null;
            }
          }, 10000);

          setTimeout(() => {
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(captureScript);
            }
          }, 500);
        });
      },
    }));

    const fullHtml = currentHtml
      ? `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #fff; font-family: Helvetica Neue, Arial, sans-serif; }
    #body { min-width: max-content; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px #0001; padding: 32px; }
  </style>
</head>
<body>
  <div id="body">${currentHtml}</div>
  <script>${domtoimageLib}</script>
</body>
</html>`
      : `<!DOCTYPE html><html><head></head><body></body></html>`;

    return (
      <View
        ref={containerRef}
        style={[
          styles.container,
          { width: webViewWidth, height: webViewHeight },
        ]}
      >
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: fullHtml }}
          style={styles.webview}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={false}
        />
      </View>
    );
  }
);

ImageCaptureView.displayName = "ImageCaptureView";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -9999,
    left: -9999,
    opacity: 0,
    zIndex: -9999,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default ImageCaptureView;