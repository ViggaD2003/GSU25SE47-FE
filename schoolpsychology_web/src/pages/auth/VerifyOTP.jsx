import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiVerifyOtp, apiSendOtp, maskEmail } from "./../../utils/helpers";
import OtpCell from "./../../utils/OtpCell";


export default function VerifyOtp({ email, onSuccess, onBack }) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [counter, setCounter] = useState(60);
    const refs = Array.from({ length: 6 }, () => useRef(null));


    useEffect(() => {
        if (counter <= 0) return;
        const t = setTimeout(() => setCounter((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [counter]);


    const code = useMemo(() => digits.join(""), [digits]);


    async function handleSubmit(e) {
        try {
            e.preventDefault();
            setError(null);
            if (code.length !== 6) return setError("Enter the 6-digit code.");
            setLoading(true);
            const res = await apiVerifyOtp(email, code);
            if (res.status !== 200) return setError(res.message || "Invalid code.");
            onSuccess();
        } catch (error) {
            console.error("Error verifying OTP:", error);
        } finally {
            setLoading(false);
        }
    }


    function handlePaste(e) {
        const text = e.clipboardData.getData("text").replace(/\D/g, "");
        if (text.length === 6) {
            e.preventDefault();
            setDigits(text.split(""));
            refs[5].current && refs[5].current.focus();
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6" onPaste={handlePaste}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <button type="button" onClick={onBack} className="rounded-xl border px-2 py-1 hover:bg-gray-50">Back</button>
                <span>Changing password for <span className="font-medium">{maskEmail(email || "")}</span></span>
            </div>


            {!email && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    Missing email context. Please go back and verify your email again.
                </div>
            )}
            <div className="flex items-center justify-center gap-2">
                {digits.map((d, i) => (
                    <OtpCell
                        key={i}
                        index={i}
                        value={d}
                        inputRef={refs[i]}
                        onChange={(v) => {
                            const next = [...digits];
                            next[i] = v;
                            setDigits(next);
                            if (v && i < 5) refs[i + 1].current && refs[i + 1].current.focus();
                        }}
                        onBackspace={() => {
                            if (i > 0) refs[i - 1].current && refs[i - 1].current.focus();
                        }}
                    />
                ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-black px-4 py-3 text-white">
                {loading ? "Verifying…" : "Verify code"}
            </button>
            <div className="flex items-center justify-between text-sm text-gray-600">
                <p>Didn’t receive the code?</p>
                <button
                    type="button"
                    disabled={counter > 0}
                    onClick={() => { setCounter(60); apiSendOtp(email).catch(() => { }); }}
                    className="underline disabled:no-underline disabled:opacity-50"
                >
                    {counter > 0 ? `Resend in ${counter}s` : "Resend now"}
                </button>
            </div>
        </form>
    );
}