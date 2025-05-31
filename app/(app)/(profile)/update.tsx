import Avatar from "@/components/avatar/Avatar";
import { useAuth } from "@/hooks";
import { Layout, Text, Button } from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateAuthUserValidation } from "@/validations";
import { TUpdateAuthUserInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useSetAtom } from "jotai";
import { userStore } from "@/stores";
import { getFileUrlFromKey } from "@/utils";
import { useToast } from "@/components/providers/ToastProvider";

export default function UpdateProfileScreen() {
  const { user, updateUser, isLoading } = useAuth();
  const setUser = useSetAtom(userStore);
  const toast = useToast();

  const form = useForm<TUpdateAuthUserInput>({
    resolver: zodResolver(UpdateAuthUserValidation),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const errors = form.formState.errors;

  const submit = (input: TUpdateAuthUserInput) => {
    updateUser(input, {
      onSuccess(user) {
        setUser(user);
        router.back();
        toast.showToast({
          status: "success",
          message: `Profile updated successfully`,
        });
      },
    });
  };

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <InputField
            name="avatarFile"
            render={({ field }) => (
              <>
                <Avatar
                  src={getFileUrlFromKey(user?.avatarUrl)}
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

          <InputField name="firstName" label="First Name" />

          <InputField name="lastName" label="Last Name" />

          <Button
            style={styles.saveButton}
            onPress={form.handleSubmit(submit)}
            disabled={isLoading || !form.formState.isDirty}
          >
            Update
          </Button>
        </View>
      </Layout>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  name: {
    marginTop: 16,
    fontWeight: "bold",
  },
  email: {
    marginTop: 4,
    color: "#888",
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
    width: "100%",
  },
});
