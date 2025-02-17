/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
        serverActions: {
            allowedOrigins: ["localhost:3000","c5qxs3h3-3000.use2.devtunnels.ms", "*.c5qxs3h3-3000.use2.devtunnels.ms", "mundobebeja.com"]
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ykd3fgwmeqmcdsmq.public.blob.vercel-storage.com",
                port: "",
            }
        ]
    }
}

export default nextConfig
