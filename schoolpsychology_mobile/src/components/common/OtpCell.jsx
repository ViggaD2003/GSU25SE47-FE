import React from "react";
import { TextInput } from "react-native";


export default function OtpCell({ value, onChange, onBackspace, inputRef, scheme }) {
    return (
        <TextInput
            ref={inputRef}
            keyboardType="number-pad"
            maxLength={1}
            value={value}
            onChangeText={(v) => {
                const vv = v.replace(/\D/g, "");
                if (vv.length === 0) onChange("");
                else onChange(vv[0]);
            }}
            onKeyPress={(e) => {
                if (e.nativeEvent.key === "Backspace" && !value) onBackspace && onBackspace();
            }}
            style={{
                height: 48,
                width: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: scheme === "dark" ? "#4B5563" : "#D1D5DB",
                textAlign: "center",
                fontSize: 18,
                color: scheme === "dark" ? "#F3F4F6" : "#111827",
            }}
        />
    );
}