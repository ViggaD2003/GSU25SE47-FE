import React from "react";


export default function OtpCell({ index, value, onChange, onBackspace, inputRef }) {
    return (
        <input
            ref={inputRef}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className="h-12 w-10 rounded-xl border border-gray-300 text-center text-lg outline-none focus:border-gray-800"
            aria-label={`Digit ${index + 1}`}
            value={value}
            onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (v.length === 0) onChange("");
                else onChange(v[0]);
            }}
            onKeyDown={(e) => {
                if (e.key === "Backspace" && !value) {
                    e.preventDefault();
                    onBackspace();
                }
            }}
        />
    );
}