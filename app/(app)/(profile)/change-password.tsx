import InputField from "@/components/forms/InputField";
import { useAuth } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout, Text, Button } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { TChangePasswordInput } from "@/types";
import { ChangePasswordValidation } from "@/validations";
import { useToast } from "@/components/providers/ToastProvider";

export default function ChangePasswordScreen() {
  const { changePassword, isLoading } = useAuth(); // You must implement changePassword in your hook
  const router = useRouter();
  const toast = useToast();

  const form = useForm<TChangePasswordInput>({
    resolver: zodResolver(ChangePasswordValidation),
  });

  const submit = (input: TChangePasswordInput) => {
    changePassword(input, {
      onSuccess: () => {
        router.back();
        toast.showToast({
          status: "success",
          message: "Password changed successfully!",
        });
      },
    });
  };

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <Layout style={styles.form}>
          <InputField
            label="Current Password *"
            name="currentPassword"
            placeholder="Enter current password"
            textContentType="password"
            secureTextEntry
            disabled={isLoading}
            accessibilityLabel="Current password input"
          />
          <InputField
            label="New Password *"
            name="newPassword"
            placeholder="Enter new password"
            textContentType="newPassword"
            secureTextEntry
            disabled={isLoading}
            accessibilityLabel="New password input"
          />
          <InputField
            label="Confirm New Password *"
            name="confirmPassword"
            placeholder="Confirm new password"
            textContentType="newPassword"
            secureTextEntry
            disabled={isLoading}
            accessibilityLabel="Confirm new password input"
          />
          <Button
            onPress={form.handleSubmit(submit)}
            disabled={isLoading || !form.formState.isDirty}
            style={styles.button}
          >
            Change Password
          </Button>
        </Layout>
      </Layout>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, gap: 32 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  errorText: { marginBottom: 8, color: "#FF3D71" },
  button: { marginTop: 8 },
});
