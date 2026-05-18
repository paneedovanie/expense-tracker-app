import { Text, ListItem, useTheme } from "@ui-kitten/components";
import { formatCurrency } from "@/utils";
import Avatar from "@/components/avatar/Avatar";
import { StyleSheet } from "react-native";

export interface UserSharesItemProps {
  fullname: string;
  amount: number;
  avatarUrl?: string;
  onSettleUp?: () => void;
}

export default function UserSharesItem({
  fullname,
  avatarUrl,
  amount,
  onSettleUp,
}: UserSharesItemProps) {
  const theme = useTheme();
  const owes = amount < 0;

  return (
    <ListItem
      style={styles.listItem}
      title={fullname}
      description={owes && "Tap to settle up"}
      accessoryLeft={(props) => (
        <Avatar
          {...props}
          src={avatarUrl}
          style={styles.avatar}
          variants={["circle"]}
        />
      )}
      accessoryRight={(props) => (
        <Text
          {...props}
          style={{
            color: owes
              ? theme["color-danger-500"]
              : theme["color-success-500"],
          }}
        >
          {amount ? formatCurrency(amount, "PHP") : "Settled"}
        </Text>
      )}
      onPress={() => {
        if (!owes) return;
        onSettleUp?.();
      }}
    />
  );
}

// Styles for the screen
const styles = StyleSheet.create({
  listItem: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
});
