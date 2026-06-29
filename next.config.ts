// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextConfig: any = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
