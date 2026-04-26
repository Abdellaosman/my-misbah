"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#1A2B50] sticky top-0 z-50 shadow-md">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="My Misbah logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-serif text-lg font-semibold tracking-wide">
              My Misbah
            </span>
            <span className="text-[#F0A500] text-[10px] font-medium tracking-wide hidden sm:block">
              Your Light in Times of Uncertainty
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/guides"
            className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
          >
            Find a Guide
          </Link>
          <Link
            href="/#how-it-works"
            className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#about"
            className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
          >
            About
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/guides"
            className="bg-[#C8680A] hover:bg-[#E07D10] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            Speak to a Guide
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#2d4575] bg-[#1A2B50] px-6 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            <Link
              href="/guides"
              onClick={() => setOpen(false)}
              className="text-blue-100 hover:text-white py-2.5 text-sm font-medium border-b border-[#2d4575]"
            >
              Find a Guide
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setOpen(false)}
              className="text-blue-100 hover:text-white py-2.5 text-sm font-medium border-b border-[#2d4575]"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              onClick={() => setOpen(false)}
              className="text-blue-100 hover:text-white py-2.5 text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/guides"
              onClick={() => setOpen(false)}
              className="mt-3 bg-[#C8680A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
            >
              Speak to a Guide
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
