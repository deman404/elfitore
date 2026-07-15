/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "igmmnfxhqhguesgwzggo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn.youcan.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "elfitor.ma",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.elfitor.ma",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
