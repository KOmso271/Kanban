"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // THÊM MỚI: Bắt Token từ URL và Ép tạo Session
  // ==========================================
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      // 1. Bóc tách Hash thành các biến
      const params = new URLSearchParams(hash.substring(1)); // Bỏ dấu #
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        // 2. Chủ động bắt Supabase Client thiết lập Session ngay lập tức
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (error) {
              console.error("Lỗi set session:", error.message);
            } else {
              // 3. (Tùy chọn UX) Dọn dẹp URL: Xóa cục token dài ngoằng đi cho URL sạch đẹp
              window.history.replaceState(null, "", window.location.pathname);
            }
          });
      }
    }
  }, []);
  // ==========================================

  const validations = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isAllValid = Object.values(validations).every(Boolean);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllValid) return;

    setError("");
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      // Xóa Session cũ để bảo mật
      await supabase.auth.signOut();

      // KHÔNG CẦN setSuccess(true) NỮA
      // CHUYỂN HƯỚNG NGAY LẬP TỨC VỀ TRANG CHỦ (Nơi chứa form Đăng nhập)
      router.push("/?message=change password successfully");
    } catch (err: any) {
      setError(
        err.message ||
          "Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng tải lại trang và thử click lại link trong email.",
      );
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <li
      className={`flex items-center space-x-2 text-[13px] transition-colors duration-200 ${isValid ? "text-green-600" : "text-gray-500"}`}
    >
      {isValid ? (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 flex-shrink-0 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
        </svg>
      )}
      <span>{text}</span>
    </li>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Tạo Mật Khẩu Mới
        </h2>

        {success ? (
          <div className="rounded border border-green-200 bg-green-50 p-4 text-green-700 text-center">
            Cập nhật mật khẩu thành công! Đang chuyển hướng...
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-[14px] rounded-md border border-gray-300 p-3 pr-10 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Nhập mật khẩu..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-4 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                Yêu cầu mật khẩu:
              </p>
              <ul className="space-y-2.5">
                <RequirementItem
                  isValid={validations.length}
                  text="Ít nhất 6 ký tự"
                />
                <RequirementItem
                  isValid={validations.uppercase}
                  text="Ít nhất 1 chữ viết hoa (A-Z)"
                />
                <RequirementItem
                  isValid={validations.lowercase}
                  text="Ít nhất 1 chữ viết thường (a-z)"
                />
                <RequirementItem
                  isValid={validations.number}
                  text="Ít nhất 1 chữ số (0-9)"
                />
                <RequirementItem
                  isValid={validations.special}
                  text="Ít nhất 1 ký tự đặc biệt (!@#...)"
                />
              </ul>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500 text-center">
                {error}
              </p>
            )}

            <button
              disabled={!isAllValid || loading}
              type="submit"
              className={`w-full rounded-md py-3 font-semibold text-white transition-all duration-300 
                ${
                  isAllValid
                    ? "bg-green-600 hover:bg-green-700 shadow-md cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
