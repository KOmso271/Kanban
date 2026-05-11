"use client";

import { useState } from "react";
// Lưu ý: Thay đổi đường dẫn import supabase này cho đúng với file config của dự án em
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Lấy domain hiện tại (sẽ tự động chạy đúng dù ở localhost hay Vercel)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 👇 SỬA Ở ĐÂY: Trỏ thẳng về trang Update Password
      redirectTo: `${window.location.origin}/update-password`
    });

    if (error) {
      setMessage(`Lỗi: ${error.message}`);
    } else {
      setMessage("Vui lòng kiểm tra hòm thư Email của bạn để nhận liên kết khôi phục!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Quên Mật Khẩu
        </h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nhập Email của bạn
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="example@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-green-600 dark:text-green-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}