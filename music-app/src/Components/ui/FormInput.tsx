import React from "react";
import { View, Text, TextInput, KeyboardTypeOptions } from "react-native";
import { Control, Controller, FieldError, FieldPath, FieldValues } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  editable?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  editable = true,
}: FormInputProps<T>) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? (
        <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>{label}</Text>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#fff",
              fontSize: 15,
              borderWidth: 1,
              borderColor: error ? "#ff4444" : "#2a2a2a",
            }}
            placeholder={placeholder}
            placeholderTextColor="#555"
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            editable={editable}
          />
        )}
      />
      {error ? (
        <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>{error.message}</Text>
      ) : null}
    </View>
  );
}
