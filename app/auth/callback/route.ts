import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code') // Thường reset password sẽ trả về code
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Đổi code lấy session (đây là cách bảo mật hơn)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Sau khi exchange thành công, Supabase sẽ tự lưu session vào Cookie 
      // (nếu bạn cấu hình createServerClient chuẩn)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Nếu dùng token_hash (OTP/Magic Link)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}