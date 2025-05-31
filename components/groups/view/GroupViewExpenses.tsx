import Avatar from "@/components/avatar/Avatar";
import { useExpenses } from "@/hooks";
import { IExpense } from "@/types";
import { formatCurrency } from "@/utils";
import {
  Layout,
  List,
  ListItem,
  Icon,
  Text,
  Spinner,
} from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";

export default function GroupViewExpenses() {
  const {
    expenses,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useExpenses();

  const renderItem = ({
    item,
    index,
  }: {
    item: IExpense;
    index: number;
  }): React.ReactElement => (
    <ListItem
      style={styles.listItem}
      title={item.description}
      description={`${formatCurrency(item.amount)} paid by ${
        item.paidBy.firstName
      }`}
      accessoryLeft={(props) => (
        <Avatar {...props} style={styles.avatar} shape="rounded" />
      )}
      onPress={() => {
        // router.push({
        //   pathname: "/(app)/(expenses)/view",
        //   params: { id: item.id },
        // });
      }}
    />
  );

  const handleEndReached = async () => {
    console.log(hasNextPage, isFetchingNextPage);
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <Layout style={styles.container}>
      {expenses && expenses.length > 0 ? (
        <List
          style={{ backgroundColor: "white" }}
          data={expenses}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <Spinner size="small" />
              </View>
            ) : null
          }
        />
      ) : isFetching ? (
        <View style={styles.emptyState}>
          <Spinner />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="people-outline" fill="#8F9BB3" style={styles.emptyIcon} />
          <Text appearance="hint" category="s1">
            No expenses found.
          </Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 16,
  },
  listItem: { height: 80 },
  avatar: { width: 60, height: 60 },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
