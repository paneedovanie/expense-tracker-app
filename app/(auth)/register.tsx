import Avatar from "@/components/avatar/Avatar";
import InputField from "@/components/forms/InputField";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/hooks";
import { TRegisterInput } from "@/types";
import { LoginValidation, RegisterValidation } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout, Text, Button } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const { register, isLoading } = useAuth();

  const form = useForm({
    resolver: zodResolver(RegisterValidation),
  });

  const errors = form.formState.errors;

  const goToLogin = () => {
    router.push("/");
  };

  const submit = (input: TRegisterInput) => {
    register(input, {
      onSuccess: () => {
        router.push("/(auth)");
        toast.showToast({
          status: "success",
          message:
            "Registration successfully. Check your email for the password.",
        });
      },
    });
  };

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <Text category="h1">Register</Text>
        <Layout style={styles.form}>
          <InputField
            name="avatarFile"
            render={({ field }) => (
              <>
                <Avatar
                  onChangeImage={field.onChange}
                  editable
                  style={styles.avatar}
                />
                <Text status="danger">
                  {errors.avatarFile?.message?.toString()}
                </Text>
              </>
            )}
          />
          <InputField
            label="First Name *"
            name="firstName"
            placeholder="Enter your first name"
            disabled={isLoading}
            accessibilityLabel="First name input"
            autoCapitalize="words"
          />

          <InputField
            label="Last Name"
            name="lastName"
            placeholder="Enter your first name"
            disabled={isLoading}
            accessibilityLabel="First name input"
            autoCapitalize="words"
          />

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
            Register
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
  avatar: {
    height: 96,
    width: 96,
  },
});
