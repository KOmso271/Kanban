import { NextResponse } from 'next/server'

// 1. IMPORT CHUẨN: Lấy trực tiếp biến supabase từ file lib
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  console.log("🚨 ĐÃ CHẠY VÀO FILE ROUTE.TS THÀNH CÔNG!");
  
  // Lấy toàn bộ URL và bóc tách các tham số sau dấu ?
  const { searchParams, origin } = new URL(request.url)
  
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  // Nếu URL có chứa token_hash và type
  if (token_hash && type) {
    
    // 2. XÁC MINH TRỰC TIẾP: Dùng luôn biến supabase đã import
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    // 3. THÀNH CÔNG VÀ CÓ SESSION
    if (!error && data?.session) {
      // Nối thêm access_token vào URL dạng Hash (#) để Client tự nhận diện
      const redirectUrl = `${origin}${next}#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`
      return NextResponse.redirect(redirectUrl)
    }
  }

  // 4. THẤT BẠI: Mã hết hạn hoặc đã bị sử dụng -> Đá về trang đăng nhập
  return NextResponse.redirect(`${origin}/login?error=
invalid_link`)
}