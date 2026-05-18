import { Icon, Input, Text } from "@ui-kitten/components";
import InputField from "./InputField";
import { useFormContext } from "react-hook-form";
import { EDiscountType, TExpenseInput } from "@/types";
import { normalizeNumberInput } from "@/utils";
import { RenderProp } from "@ui-kitten/components/devsupport";
import { ImageProps, TouchableWithoutFeedback } from "react-native";

export default function DiscountInput() {
  const form = useFormContext<TExpenseInput>();
  const errors = form.formState.errors;

  const discountType = form.watch("discountType");

  const toggle = () => {
    form.setValue(
      "discountType",
      discountType === EDiscountType.Percentage
        ? EDiscountType.Exact
        : EDiscountType.Percentage
    );
  };

  const renderIcon: RenderProp<Partial<ImageProps>> = (props) => (
    <TouchableWithoutFeedback onPress={toggle}>
      <Icon
        {...props}
        name={
          discountType === EDiscountType.Percentage
            ? "percent-outline"
            : "hash-outline"
        }
      />
    </TouchableWithoutFeedback>
  );

  return (
    <InputField
      name="discount"
      placeholder="Enter amount"
      render={({ field }) => (
        <Input
          {...field}
          label="Discount"
          value={field.value?.toString() ?? ""}
          status={errors.discount?.message ? "danger" : "default"}
          onChangeText={(val) => field.onChange(normalizeNumberInput(val))}
          accessoryRight={renderIcon}
          keyboardType="decimal-pad"
          caption={<Text>{errors.discount?.message?.toString()}</Text>}
        />
      )}
    />
  );
}
