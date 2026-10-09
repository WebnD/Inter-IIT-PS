/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Internal portal: keep it out of search engines.
    return [
      { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        // PDFs sit behind the password gate, so only the viewer's own browser may cache them.
        source: "/pdfs/:file*",
        headers: [
          { key: "Cache-Control", value: "private, max-age=86400" },
          { key: "Content-Disposition", value: "inline" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
export default nextConfig;
