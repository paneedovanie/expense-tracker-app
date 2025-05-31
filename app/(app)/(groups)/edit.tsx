import { useLocalSearchParams, router } from "expo-router";
import { useGroups } from "@/hooks";
import Avatar from "@/components/avatar/Avatar";
import { Layout, Text, Button, Spinner } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { getFileUrlFromKey } from "@/utils";
import { useForm, FormProvider } from "react-hook-form";
import { IGroup, TUpdateGroupInput } from "@/types";
import InputField from "@/components/forms/InputField";
import { useQueryClient } from "react-query";
import { UpdateGroupValidation } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";

interface IEditGroupFormProps {
  group: IGroup;
  submit: (input: TUpdateGroupInput) => void;
  isLoading: boolean;
}

const EditGroupForm = ({ group, submit, isLoading }: IEditGroupFormProps) => {
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

          <Button
            style={styles.saveButton}
            onPress={form.handleSubmit(submit)}
            disabled={isLoading}
          >
            Save
          </Button>
        </View>
      </Layout>
    </FormProvider>
  );
};

export default function EditGroupScreen() {
  const searchParams = useLocalSearchParams();
  const queryClient = useQueryClient();
  const id = searchParams.id as string;
  const { group, isFetching, isLoading, update } = useGroups({ id });

  const submit = (data: TUpdateGroupInput) => {
    update(data, {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"]);
        queryClient.invalidateQueries(["group"]);
        router.back();
      },
    });
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

  return <EditGroupForm group={group} submit={submit} isLoading={isLoading} />;
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
