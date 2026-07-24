import type { ReactNode } from "react";
import { LogoMark } from "@/components/LogoMark";

// Foto placeholder sementara dari Unsplash — ganti `src` di bawah dengan asset toko kamu sendiri kapan pun siap.
const PLACEHOLDER_PHOTO_URL = "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&q=70&grayscale";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Foto + overlay graphite: full-bleed di semua ukuran layar, supaya branding tetap terasa di mobile juga (bukan cuma desktop). */}
      <img
        src={PLACEHOLDER_PHOTO_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover brightness-90 contrast-[1.1] grayscale"
      />
      <div className="absolute inset-0 bg-linear-to-b from-[#1e1e21]/90 via-[#1e1e21]/85 to-[#141416]/95" />
      {/* Di layar besar, sisi kanan ditutup panel putih supaya jadi zona form yang terang. Di mobile, form melayang sebagai card di atas foto gelap. */}
      <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-background lg:block" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="flex items-center gap-2.5 p-6 lg:flex lg:w-[55%] lg:flex-col lg:items-stretch lg:justify-between lg:p-10">
          <LogoMark className="hidden h-8 w-8 text-white lg:block" />
          <div className="flex items-center gap-2.5 lg:hidden">
            <LogoMark className="h-7 w-7 text-white" />
            <span className="text-base font-semibold text-white">POS Kasir</span>
          </div>

          <div className="hidden text-white lg:block">
            <p className="text-lg font-semibold tracking-tight [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">POS Kasir</p>
            <p className="mt-1 max-w-xs text-sm text-white/85 [text-shadow:0_1px_8px_rgb(0_0_0/0.4)]">
              Kelola pesanan, produk, dan kas toko kamu dalam satu tempat.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</div>
        </div>
      </div>
    </div>
  );
}
