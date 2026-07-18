"use client";
import { StyleSheet, ScrollView, View } from "react-native";
import { Text, useTheme } from "@ui-kitten/components";
import { forEach, map, reduce, round } from "lodash";
import dayjs from "dayjs";
import { EDiscountType, IExpense, IGroup } from "@/types";
import { formatCurrency } from "@/utils/number";

interface MemberAmount {
  userId: string;
  paid: number;
  owes: number;
}

interface SummaryRow {
  type: "expense" | "payment";
  id: string;
  description: string;
  amount: number;
  discount: number;
  discountType?: EDiscountType;
  paidByUserId: string;
  paidBySharesLength: number;
  createdAt: Date;
  memberAmounts: MemberAmount[];
}

interface SummaryTableProps {
  group: IGroup;
  expenses: IExpense[];
}

const MEMBER_COLUMNS_START_INDEX = 5;

const getPaidByMapper = (expense: IExpense): Record<string, number> =>
  reduce(
    expense?.paidByShares,
    (acc, share) => ({ ...acc, [share.userId]: share.amount }),
    {} as Record<string, number>
  );

const getPaidForMapper = (expense: IExpense): Record<string, number> =>
  reduce(
    expense?.paidForShares,
    (acc, share) => ({ ...acc, [share.userId]: share.amount }),
    {} as Record<string, number>
  );

interface AmountCellProps {
  paid: number;
  owes: number;
  successColor: string;
  dangerColor: string;
}

const AmountCell = ({
  paid,
  owes,
  successColor,
  dangerColor,
}: AmountCellProps) => (
  <View style={amountCellStyles.container}>
    <Text style={[{ color: successColor }, amountCellStyles.text]}>
      {paid ? formatCurrency(paid, "PHP") : ""}
    </Text>
    <Text style={[{ color: dangerColor }, amountCellStyles.text]}>
      {owes ? formatCurrency(owes, "PHP") : ""}
    </Text>
  </View>
);

const amountCellStyles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: 70,
  },
  text: {
    fontSize: 10,
  },
});

interface TotalCellProps {
  total: number;
  successColor: string;
  dangerColor: string;
}

const TotalCell = ({ total, successColor, dangerColor }: TotalCellProps) => {
  let color = "#000";
  if (total > 0) color = successColor;
  if (total < 0) color = dangerColor;

  return (
    <Text style={[totalCellStyles.text, { color }]}>
      {formatCurrency(round(total, 2), "PHP")}
    </Text>
  );
};

const totalCellStyles = StyleSheet.create({
  text: {
    textAlign: "right",
    paddingRight: 8,
    fontWeight: "600",
    fontSize: 11,
  },
});

export default function SummaryTable({ group, expenses }: SummaryTableProps) {
  const theme = useTheme();
  const successColor = theme["color-success-400"];
  const dangerColor = theme["color-danger-400"];
  const warningBg = theme["color-warning-100"];

  const memberNames = map(group.members, ({ userId }) => {
    const member = group.members.find((m) => m.userId === userId);
    return member?.user.fullName || "Unknown";
  });

  const columns = [
    "Description",
    "Amount",
    "Discount",
    "By",
    "Created on",
    ...memberNames,
  ];

  const totalMapper: Record<string, number> = {};

  const buildRows = (): SummaryRow[] => {
    const rows: SummaryRow[] = [];

    forEach(expenses, (expense) => {
      const paidByMapper = getPaidByMapper(expense);
      const paidForMapper = getPaidForMapper(expense);

      const memberAmounts = map(group.members, ({ userId }) => {
        const paid = round(Number(paidByMapper[userId] ?? 0), 2);
        const owes = round(Number(paidForMapper[userId] ?? 0) * -1, 2);
        totalMapper[userId] = (totalMapper[userId] ?? 0) + paid + owes;
        return { userId, paid, owes };
      });

      rows.push({
        type: "expense",
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        discount: expense.discount,
        discountType: expense.discountType,
        paidByUserId: expense.paidByShares[0]?.userId ?? "",
        paidBySharesLength: expense.paidByShares?.length ?? 0,
        createdAt: expense.createdAt,
        memberAmounts,
      });

      forEach(expense.payments, (payment) => {
        const paymentMemberAmounts = map(group.members, ({ userId }) => {
          if (userId === payment.payerUserId) {
            totalMapper[userId] =
              (totalMapper[userId] ?? 0) + round(Number(payment.amount), 2);
            return { userId, paid: round(Number(payment.amount), 2), owes: 0 };
          }
          if (userId === payment.receiverUserId) {
            totalMapper[userId] =
              (totalMapper[userId] ?? 0) - round(Number(payment.amount), 2);
            return { userId, paid: 0, owes: round(Number(payment.amount), 2) };
          }
          return { userId, paid: 0, owes: 0 };
        });

        rows.push({
          type: "payment",
          id: payment.id,
          description: "Payment",
          amount: payment.amount,
          discount: 0,
          paidByUserId: payment.payerUserId,
          paidBySharesLength: 1,
          createdAt: payment.createdAt,
          memberAmounts: paymentMemberAmounts,
        });
      });
    });

    return rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const rows = buildRows();

  const getPaidByFullname = (userId: string) => {
    const member = group.members.find((m) => m.userId === userId);
    return member?.user.fullName || "Unknown";
  };

  const renderDiscount = (row: SummaryRow) => {
    if (row.type === "payment")
      return <Text style={tableStyles.cellText}>-</Text>;
    if (!Number(row.discount))
      return <Text style={tableStyles.cellText}>-</Text>;

    if (row.discountType === EDiscountType.Exact) {
      return (
        <Text style={{ color: successColor }}>
          {formatCurrency(row.discount, "PHP")}
        </Text>
      );
    }

    return (
      <Text style={{ color: successColor }}>
        {formatCurrency(row.discount)}%
      </Text>
    );
  };

  const renderHeaderCell = (column: string, index: number) => {
    const isMemberColumn = index >= MEMBER_COLUMNS_START_INDEX;
    return (
      <View
        key={index}
        style={[
          tableStyles.headerCell,
          isMemberColumn && {
            backgroundColor: warningBg,
            width: 80,
            minWidth: 80,
          },
          !isMemberColumn && { minWidth: 100, width: 100 },
        ]}
      >
        <Text style={tableStyles.headerText} numberOfLines={1}>
          {column}
        </Text>
      </View>
    );
  };

  const renderCell = (
    value: React.ReactNode,
    index: number,
    isTotalRow = false
  ) => {
    const isMemberColumn = index >= MEMBER_COLUMNS_START_INDEX;
    return (
      <View
        key={index}
        style={[
          tableStyles.cell,
          isMemberColumn && {
            backgroundColor: warningBg,
            width: 80,
            minWidth: 80,
          },
          !isMemberColumn && { minWidth: 100, width: 100 },
          isTotalRow && tableStyles.totalCell,
        ]}
      >
        {value}
      </View>
    );
  };

  return (
    <View style={containerStyles.wrapper}>
      <ScrollView horizontal style={containerStyles.horizontalScroll}>
        <View>
          <View style={tableStyles.headerRow}>
            {map(columns, (col, i) => renderHeaderCell(col, i))}
          </View>

          <ScrollView style={containerStyles.verticalScroll}>
            {map(rows, (row) => (
              <View key={row.id} style={tableStyles.row}>
                {renderCell(
                  <Text style={tableStyles.cellText} numberOfLines={1}>
                    {row.description}
                  </Text>,
                  0
                )}
                {renderCell(
                  <Text style={tableStyles.cellText}>
                    {formatCurrency(row.amount, "PHP")}
                  </Text>,
                  1
                )}
                {renderCell(renderDiscount(row), 2)}
                {renderCell(
                  <Text style={tableStyles.cellText} numberOfLines={1}>
                    {row.paidBySharesLength > 1
                      ? `${getPaidByFullname(row.paidByUserId)} +${
                          row.paidBySharesLength - 1
                        }`
                      : getPaidByFullname(row.paidByUserId)}
                  </Text>,
                  3
                )}
                {renderCell(
                  <Text style={tableStyles.cellText}>
                    {dayjs(row.createdAt).format("MMM DD, YYYY")}
                  </Text>,
                  4
                )}
                {map(row.memberAmounts, ({ paid, owes }, i) =>
                  renderCell(
                    <AmountCell
                      paid={paid}
                      owes={owes}
                      successColor={successColor}
                      dangerColor={dangerColor}
                    />,
                    MEMBER_COLUMNS_START_INDEX + i
                  )
                )}
              </View>
            ))}

            <View style={[tableStyles.row, tableStyles.totalRow]}>
              {renderCell(<Text style={tableStyles.cellText}></Text>, 0)}
              {renderCell(<Text style={tableStyles.cellText}></Text>, 1)}
              {renderCell(<Text style={tableStyles.cellText}></Text>, 2)}
              {renderCell(<Text style={tableStyles.cellText}></Text>, 3)}
              {renderCell(<Text style={tableStyles.cellText}></Text>, 4)}
              {map(group.members, ({ userId }, i) =>
                renderCell(
                  <TotalCell
                    total={totalMapper[userId] ?? 0}
                    successColor={successColor}
                    dangerColor={dangerColor}
                  />,
                  MEMBER_COLUMNS_START_INDEX + i,
                  true
                )
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const containerStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  horizontalScroll: {
    flex: 1,
  },
  verticalScroll: {
    maxHeight: 500,
  },
});

const tableStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1A7270",
  },
  headerCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "600",
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 11,
  },
  totalCell: {
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  totalRow: {
    backgroundColor: "#f5f5f5",
  },
});
