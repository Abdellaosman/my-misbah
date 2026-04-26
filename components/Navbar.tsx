"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Find a Guide", href: "/guides" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Resources", href: "/resources" },
];

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
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://book.carepatron.com/My-Misbah/All?p=sI0lxnz0T5KtoqqOG.Vgbg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
            style={{
              background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
            }}
          >
            Book Now
          </a>
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
            {navLinks.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-blue-100 hover:text-white py-2.5 text-sm font-medium ${
                  i < navLinks.length - 1 ? "border-b border-[#2d4575]" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://book.carepatron.com/My-Misbah/All?p=sI0lxnz0T5KtoqqOG.Vgbg"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center"
              style={{
                background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
              }}
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
