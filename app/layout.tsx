import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const title = "北疆在路上 · 乌鲁木齐到伊宁自驾助手";
  const description = "7月31日至8月6日北疆单程自驾行程、进度、住宿、票务与双地图快速导航。";
  return {
    metadataBase: base,
    title,
    description,
    applicationName: "北疆在路上",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "北疆行程", statusBarStyle: "black-translucent" },
    formatDetection: { telephone: true },
    icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
    openGraph: { title, description, type: "website", images: [{ url: new URL("/og.png", base).toString(), width: 1200, height: 630, alt: "北疆在路上" }] },
    twitter: { card: "summary_large_image", title, description, images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><head><meta name="theme-color" content="#173d32"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/></head><body>{children}</body></html>;
}
