import InputField from "@/components/forms/InputField";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/hooks";
import { TPasswordResetInput } from "@/types";
import { PasswordResetValidation } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout, Text, Button } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { passwordReset, isLoading } = useAuth();
  const toast = useToast();

  const form = useForm({
    resolver: zodResolver(PasswordResetValidation),
  });

  const submit = (input: TPasswordResetInput) => {
    passwordReset(input, {
      onSuccess: () => {
        toast.showToast({
          status: "success",
          message: "Password reset is sent successfully!",
        });
        form.reset();
      },
    });
  };

  const goToLogin = () => {
    router.push("/");
  };

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <Text category="h1">Forgot Password</Text>
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

          <Button onPress={form.handleSubmit(submit)} disabled={isLoading}>
            Submit
          </Button>
          <View style={styles.divider} />
          <Button appearance="ghost" onPress={goToLogin}>
            Login
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
