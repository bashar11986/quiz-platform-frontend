import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // هذه التعليمة تمنع Next.js من حذف الـ (/) في نهاية الروابط
  trailingSlash: true,
async rewrites() {
   return [
      // القاعدة الأولى: مخصصة للحفاظ على الشرطة المائلة (/) في نهاية الرابط لطلبات Django
      {
        source: '/api/:path*/',
        destination: 'https://ahmadghdeeb.pythonanywhere.com/api/:path*/',
      },
      // القاعدة الثانية: احتياطية للطلبات العادية
      {
        source: '/api/:path*',
        destination: 'https://ahmadghdeeb.pythonanywhere.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
