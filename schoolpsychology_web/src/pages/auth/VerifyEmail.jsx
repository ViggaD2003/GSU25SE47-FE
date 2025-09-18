import React, { useState } from "react";
import { apiSendOtp, emailRegex } from "./../../utils/helpers";


export default function VerifyEmail({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {
        try {
            e.preventDefault();
            setError(null);
            if (!emailRegex.test(email)) {
                setError("Please enter a valid email address.");
                return;
            }
            setLoading(true);
            const res = await apiSendOtp(email);
            if (res.status !== 200) return setError(res.message || "Something went wrong.");
            onSuccess(email);
        } catch (error) {
            console.error("Error sending OTP:", error);
            setError("Could not send verification code.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-800"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-black px-4 py-3 text-white">
                {loading ? "Sending…" : "Send verification code"}
            </button>
            <p className="text-xs text-gray-500">We’ll email a 6‑digit code to verify it’s you.</p>
        </form>
    );
}