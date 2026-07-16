import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#101d38] text-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
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
              Confidential, one-on-one guidance rooted in Islamic tradition — for
              moments when clarity is what you need most.
            </p>
            <Link
              href="/book"
              className="inline-block mt-5 text-sm font-semibold text-white px-5 py-2.5 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
              }}
            >
              Book a Session
            </Link>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Find a Guide", href: "/guides" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "FAQ", href: "/faq" },
                { label: "Resources", href: "/resources" },
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

          {/* Legal & Commitments */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Our Commitment
            </h4>
            <ul className="space-y-2 text-sm text-blue-200 mb-6">
              {[
                "Confidential sessions",
                "Rooted in Quran & Sunnah",
                "Trusted, verified guides",
                "Non-judgmental support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F0A500] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <h4 className="text-white font-semibold text-sm mb-3 tracking-wide uppercase">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
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
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#2d4575] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <p>
            &copy; {new Date().getFullYear()} My Misbah. All rights reserved.
          </p>
          <p className="font-serif italic text-[#F0A500]">
            Turn. Trust. Transform.
          </p>
          <p>
            <a
              href="mailto:admin@mymisbah.com"
              className="hover:text-white transition-colors"
            >
              admin@mymisbah.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
