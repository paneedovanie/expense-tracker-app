import { Layout, Text, Button, Spinner } from "@ui-kitten/components";
import { Href, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "@/components/forms/InputField";
import { zodResolver } from "@hookform/resolvers/zod";
import { TLoginInput } from "@/types";
import { LoginValidation } from "@/validations";
import { useAuth } from "@/hooks";
import { useToast } from "@/components/providers/ToastProvider";
import DevLogin from "@/components/dev/DevLogin";
import { useSetAtom } from "jotai";
import { accessTokenStore } from "@/stores";

export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const setAccessToken = useSetAtom(accessTokenStore);
  const { login, devLogin, isLoading } = useAuth();

  const form = useForm({
    resolver: zodResolver(LoginValidation),
  });

  const submit = (input: TLoginInput) => {
    login(input, {
      onSuccess: () => {
        form.reset();
        toast.showToast({
          status: "success",
          message: "Logged in successfully. Check your email to login.",
        });
      },
    });
  };

  const submitDev = (input: TLoginInput) => {
    devLogin(input, {
      onSuccess: ({ accessToken }) => {
        setAccessToken(accessToken);
        form.reset();
        toast.showToast({
          status: "success",
          message: "Logged in successfully.",
        });
      },
    });
  };

  const goToRegister = () => {
    router.push("/register" as Href);
  };

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <Text category="h1" accessibilityRole="header">
          Welcome
        </Text>
        <Layout style={styles.form}>
          <InputField
            label="Email *"
            name="email"
            placeholder="Enter your email"
            textContentType="emailAddress"
            disabled={isLoading}
            accessibilityLabel="Email input"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={form.handleSubmit(submit)}
            disabled={isLoading}
            accessoryLeft={
              isLoading ? () => <Spinner size="tiny" /> : undefined
            }
            accessibilityLabel="Login"
          >
            Login
          </Button>
          <DevLogin
            isLoading={isLoading}
            onSubmit={form.handleSubmit(submitDev)}
          />
          <View style={styles.divider} />
          <Button
            appearance="ghost"
            onPress={goToRegister}
            disabled={isLoading}
            accessibilityLabel="Register"
          >
            Register
          </Button>
        </Layout>
      </Layout>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, justifyContent: "center", gap: 32 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  forgotPassword: {
    display: "flex",
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
});
