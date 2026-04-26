import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#101d38] text-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="My Misbah logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-white font-serif text-xl font-semibold">
                  My Misbah
                </span>
                <span className="text-[#F0A500] text-[11px] font-medium tracking-wide">
                  Your Light in Times of Uncertainty
                </span>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs mt-3">
              Confidential, one-on-one guidance rooted in Islamic tradition —
              for moments when clarity is what you need most.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Find a Guide", href: "/guides" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "About My Misbah", href: "/#about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Values */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Our Commitment
            </h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0A500] flex-shrink-0" />
                Confidential sessions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0A500] flex-shrink-0" />
                Rooted in Quran &amp; Sunnah
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0A500] flex-shrink-0" />
                Trusted, verified guides
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0A500] flex-shrink-0" />
                Non-judgmental support
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & copyright */}
        <div className="mt-12 pt-6 border-t border-[#2d4575] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <p>
            &copy; {new Date().getFullYear()} My Misbah. All rights reserved.
          </p>
          <p className="font-serif italic text-[#F0A500]">
            Turn. Trust. Transform.
          </p>
        </div>
      </div>
    </footer>
  );
}
