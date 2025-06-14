import {
  useFormContext,
  Controller,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";

import { Input, InputProps, Text } from "@ui-kitten/components";
import { ReactElement } from "react";

export interface InputFieldProps extends InputProps {
  name: string;
  render?: ({
    field,
  }: {
    field: ControllerRenderProps<FieldValues, string>;
  }) => ReactElement;
  noCaption?: boolean;
}

export default function InputField({
  name,
  render,
  noCaption,
  ...props
}: InputFieldProps) {
  const form = useFormContext();
  const errors = form.formState.errors;

  return (
    <Controller
      {...form}
      name={name}
      render={
        render ??
        (({ field }) => (
          <Input
            {...field}
            {...props}
            status={errors[name]?.message ? "danger" : "default"}
            onChangeText={(v) => form.setValue(name, v)}
            caption={
              !noCaption && <Text>{errors[name]?.message?.toString()}</Text>
            }
          />
        ))
      }
    />
  );
}
