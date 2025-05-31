import Avatar from "@/components/avatar/Avatar";
import { useGroups } from "@/hooks";
import { Layout, Text, Button } from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGroupValidation } from "@/validations";
import { TCreateGroupInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useToast } from "@/components/providers/ToastProvider";
import { useQueryClient } from "react-query";

export default function AddGroupScreen() {
  const queryClient = useQueryClient();
  const { create, isLoading } = useGroups();
  const toast = useToast();

  const form = useForm<TCreateGroupInput>({
    resolver: zodResolver(CreateGroupValidation),
  });

  const errors = form.formState.errors;

  const submit = (input: TCreateGroupInput) => {
    create(input, {
      async onSuccess(group) {
        queryClient.refetchQueries(["groups"]);
        router.replace({
          pathname: "/(app)/(groups)/view",
          params: { id: group.id },
        });
        toast.showToast({
          status: "success",
          message: `Group created successfully`,
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
          <InputField name="name" label="Name *" placeholder="Enter name" />

          <InputField
            name="description"
            label="Description"
            placeholder="Enter description"
          />

          <Button
            style={styles.saveButton}
            onPress={form.handleSubmit(submit)}
            disabled={isLoading || !form.formState.isDirty}
          >
            Add
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
