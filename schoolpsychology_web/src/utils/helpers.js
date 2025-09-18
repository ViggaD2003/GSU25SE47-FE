import api from '../services/api';

export const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;


export function maskEmail(email) {
  if (typeof email !== "string" || !email) return "";
  const at = email.indexOf("@");
  if (at <= 0 || at === email.length - 1) return email; // không đúng format, trả lại nguyên văn
  const name = email.slice(0, at);
  const domain = email.slice(at + 1);
  const masked =
    name.length <= 2
      ? name[0] + "*"
      : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${masked}@${domain}`;
}


export async function apiSendOtp(email) {
    const res = await api.post(`/api/v1/auth/verify-email?email=${email}`);
   return res;
}


export async function apiVerifyOtp(email, otp) {
    // await new Promise((r) => setTimeout(r, 600));
    // return { ok: otp === "123456", message: otp === "123456" ? "OTP valid" : "Invalid OTP (try 123456)" };

    const res = await api.post(`/api/v1/auth/activate-email?token=${otp}`);
    return res;
}


export async function apiResetPassword(email, password, confirm) {
    const res = await api.post(`/api/v1/auth/change-forgot-password?email=${email}`, { newPassword: password, confirmNewPassword: confirm });
    return res;
}


export function getPasswordScore(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(4, score);
}


export const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];