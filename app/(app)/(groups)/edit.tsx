import { useLocalSearchParams, router } from "expo-router";
import { useGroups } from "@/hooks";
import Avatar from "@/components/avatar/Avatar";
import { Layout, Text, Button, Spinner, Divider } from "@ui-kitten/components";
import { Alert, StyleSheet, View } from "react-native";
import { getFileUrlFromKey } from "@/utils";
import { useForm, FormProvider } from "react-hook-form";
import { IGroup, TUpdateGroupInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useQueryClient } from "react-query";
import { UpdateGroupValidation } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/providers/ToastProvider";

interface IEditGroupFormProps {
  group: IGroup;
  submit: (input: TUpdateGroupInput) => void;
  isLoading: boolean;
  onDelete?: () => void;
}

const EditGroupForm = ({
  group,
  submit,
  onDelete,
  isLoading,
}: IEditGroupFormProps) => {
  const form = useForm<TUpdateGroupInput>({
    resolver: zodResolver(UpdateGroupValidation),
    defaultValues: {
      name: group.name,
      description: group.description,
    },
  });

  const errors = form.formState.errors;

  return (
    <FormProvider {...form}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <InputField
            name="avatarFile"
            render={({ field }) => (
              <>
                <Avatar
                  src={getFileUrlFromKey(group.avatarUrl)}
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

          <InputField name="name" label="Name" />

          <InputField name="description" label="Description" />

          <View style={{ gap: 8, width: "100%" }}>
            <Button
              style={styles.saveButton}
              onPress={form.handleSubmit(submit)}
              disabled={isLoading || !form.formState.isDirty}
            >
              Update Group
            </Button>
            <Divider />
            <Button status="danger" onPress={onDelete} disabled={isLoading}>
              Delete
            </Button>
          </View>
        </View>
      </Layout>
    </FormProvider>
  );
};

export default function EditGroupScreen() {
  const searchParams = useLocalSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const id = searchParams.id as string;
  const { group, isFetching, isLoading, update, remove } = useGroups({ id });

  const submit = (data: TUpdateGroupInput) => {
    update(data, {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"]);
        queryClient.invalidateQueries(["group"]);
        router.back();
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove(undefined, {
              onSuccess: async () => {
                await queryClient.invalidateQueries(["groups"]);
                router.dismissAll();
                toast.showToast({
                  status: "success",
                  message: "Group deleted successfully.",
                });
              },
            });
          },
        },
      ]
    );
  };

  if (isFetching) {
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
    <EditGroupForm
      group={group}
      submit={submit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
