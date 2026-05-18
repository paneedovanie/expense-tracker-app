import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  CheckBox,
  Icon,
  Modal,
  Text,
} from "@ui-kitten/components";
import { IUser } from "@/types";
import { map } from "lodash";

export interface IUsersSelectorProps {
  icon?: string;
  buttonText?: string;
  users: IUser[];
  value: string[]; // array of userIds
  onChange: (userIds: string[]) => void;
}

export default function UsersSelector({
  icon = "edit-outline",
  buttonText = "Edit List",
  users,
  value,
  onChange,
}: IUsersSelectorProps) {
  const [visible, setVisible] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value ?? []);

  React.useEffect(() => {
    setSelected(value ?? []);
  }, [value]);

  const toggleUser = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDone = () => {
    onChange(selected);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Button
        appearance="ghost"
        onPress={() => setVisible(true)}
        accessoryLeft={(props) => <Icon {...props} name={icon} />}
      >
        {buttonText}
      </Button>

      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setVisible(false)}
      >
        <Card style={styles.card}>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <CheckBox
                checked={selected.length === users.length && users.length > 0}
                indeterminate={
                  selected.length > 0 && selected.length < users.length
                }
                onChange={() => {
                  if (selected.length === users.length) {
                    setSelected([]);
                  } else {
                    setSelected(users.map((u) => u.id));
                  }
                }}
              />
              <Text>Select All</Text>
            </View>
            {map(users, (u) => {
              const checked = selected.includes(u.id);

              return (
                <View
                  key={u.id}
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <CheckBox
                    checked={checked}
                    onChange={() => toggleUser(u.id)}
                    disabled={checked && selected.length === 1}
                  />
                  <Text>{u.fullName}</Text>
                </View>
              );
            })}
            <Button onPress={handleDone} appearance="ghost">
              Done
            </Button>
          </View>
        </Card>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: 280,
  },
});
