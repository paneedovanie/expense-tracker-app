import { EDiscountType, IExpense, IGroup } from "@/types";
import { ThemeType } from "@ui-kitten/components";
import { forEach, join, map, round } from "lodash";
import { getPaidByMapper, getPaidForMapper } from "./expense";
import { formatCurrency } from "./number";
import dayjs from "dayjs";

export const getGroupMemberFullname = (group: IGroup, userId: string) => {
  const members = group.members;
  return members.find((m) => m.user.id === userId)?.user.fullName || "Unknown";
};

export const generateGroupSummaryHtml = (
  theme: ThemeType,
  group: IGroup,
  expenses: IExpense[]
) => {
  const columns = [
    "Description",
    "Amount",
    "Discount",
    "By",
    "Created on",
    ...map(group.members, ({ userId }) =>
      getGroupMemberFullname(group, userId)
    ),
  ];

  let rows: string[][] = [];

  const totalMapper: Record<string, number> = {};

  const getAmountCell = (paid: number, owes: number) => {
    return `<div style="display: flex; justify-content: space-between;"><span style="color: ${
      theme["color-success-400"]
    }">${paid || ""}</span><span style="color: ${theme["color-danger-400"]}">${
      owes || ""
    }</span></div>`;
  };

  forEach(expenses, (expense) => {
    const paidByMapper = getPaidByMapper(expense);
    const paidForMapper = getPaidForMapper(expense);

    rows.push([
      expense.description,
      formatCurrency(expense.amount, "PHP"),
      !!Number(expense.discount)
        ? expense.discountType === EDiscountType.Exact
          ? `<span style="color: ${
              theme["color-success-400"]
            }">${formatCurrency(expense.discount, "PHP")}</span>`
          : `<span style="color: ${
              theme["color-success-400"]
            }">${formatCurrency(expense.discount)}%</span>`
        : "-",
      `${getGroupMemberFullname(group, expense.paidByShares[0]?.userId)}${
        expense.paidByShares?.length > 1
          ? ` +${expense.paidByShares?.length - 1}`
          : ""
      }`,
      expense.createdAt.toString(),
      ...map(group.members, ({ userId }) => {
        const paid = round(Number(paidByMapper[userId] ?? 0), 2);
        const owes = round(Number(paidForMapper[userId] ?? 0) * -1, 2);
        totalMapper[userId] = (totalMapper[userId] ?? 0) + paid + owes;
        return getAmountCell(paid, owes);
      }),
    ]);

    forEach(expense.payments, (payment) => {
      rows.push([
        "Payment",
        formatCurrency(payment.amount, "PHP"),
        "-",
        getGroupMemberFullname(group, payment.payerUserId),
        payment.createdAt.toString(),
        ...map(group.members, ({ userId }) => {
          if (userId === payment.payerUserId) {
            totalMapper[userId] =
              (totalMapper[userId] ?? 0) + round(Number(payment.amount), 2);
            return getAmountCell(payment.amount, 0);
          }

          if (userId === payment.receiverUserId) {
            totalMapper[userId] =
              (totalMapper[userId] ?? 0) - round(Number(payment.amount), 2);
            return getAmountCell(0, payment.amount * -1);
          }

          return "";
        }),
      ]);
    });
  });

  rows = rows.sort(
    (a, b) => new Date(b[4]).getTime() - new Date(a[4]).getTime()
  );

  rows = map(rows, (row) => {
    row[4] = dayjs(row[4]).format("MMM DD, YYYY");
    return row;
  });

  return `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="font-family: Helvetica Neue, Arial, sans-serif; background: #fff; color: #222; padding: 0; margin: 0;">
      <div id="body" style="min-width: max-content; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px #0001; padding: 32px;">
        <h1 style="font-size: 2em; margin-bottom: 0.5em;">${
          group.name
        } - ${dayjs().format("MMMM DD, YYYY")}</h1>
        <table style="border-collapse: collapse; margin-bottom: 1em;">
          <thead>
            <tr>
              ${join(
                map(
                  columns,
                  (column, i) =>
                    `<th style="padding: 8px 16px; border-bottom: 2px solid #1A7270; ${
                      i > 4
                        ? `background: ${theme["color-warning-100"]}; width: 80px;`
                        : "width: 100px"
                    }">${column}</th>`
                ),
                ""
              )}
            </tr>
          </thead>
          <tbody>
            ${join(
              map(
                rows,
                (row) =>
                  `<tr >${join(
                    map(
                      row,
                      (item, i) =>
                        `<td style="padding: 8px 16px; ${
                          i > 4
                            ? `background: ${theme["color-warning-100"]}; width: 80px;`
                            : ""
                        }">${item}</td>`
                    ),
                    ""
                  )}</tr>`
              ),
              ""
            )}
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              ${join(
                map(group.members, ({ userId }) => {
                  const total = totalMapper[userId] ?? 0;
                  let color = "black";

                  if (total > 0) {
                    color = theme["color-success-400"];
                  }

                  if (total < 0) {
                    color = theme["color-danger-400"];
                  }

                  return `<td  style="text-align: right; padding: 8px 16px; border-top: 1px black solid; color: ${color}">${formatCurrency(
                    total,
                    "PHP"
                  )}</td>`;
                }),
                ""
              )}
            </tr>
          </tbody>
        </table>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/dom-to-image@2.6.0/dist/dom-to-image.min.js"></script>
      <script>
        (async () => {
          const node = document.querySelector('#body');
          try {
            const dataUrl = await window.domtoimage.toJpeg(node, { quality: 0.95 });
            window.ReactNativeWebView.postMessage(dataUrl);
          } catch (error) {
            window.ReactNativeWebView.postMessage(error.message);
          }
        })();
      </script>
    </body>
  </html>
  `;
};
