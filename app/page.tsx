import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  MessageCircle,
  Compass,
  ArrowRight,
  BookOpen,
  Clock,
  Star,
} from "lucide-react";
import GuideCard from "@/components/GuideCard";
import { guides } from "@/lib/data";

const featuredGuides = guides.slice(0, 3);

export default function Home() {
  return (
    <div className="bg-[#FAF8F3]">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="bg-[#1A2B50] relative overflow-hidden">
        {/* Flame-inspired glow layers */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 110%, rgba(200,104,10,0.20) 0%, transparent 60%), radial-gradient(ellipse at 20% 60%, rgba(240,165,0,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="My Misbah"
              width={72}
              height={72}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Primary tagline */}
          <p className="font-serif italic text-[#F0A500] text-xl md:text-2xl mb-4 tracking-wide">
            Your Light in Times of Uncertainty
          </p>

          <h1 className="font-serif text-4xl md:text-6xl text-white font-bold leading-[1.15] mb-6 max-w-3xl mx-auto">
            Guidance for Every{" "}
            <span
              className="relative inline-block"
              style={{
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
                backgroundImage:
                  "linear-gradient(135deg, #F0A500 0%, #E07D10 50%, #C8680A 100%)",
                backgroundClip: "text",
              }}
            >
              Moment of Uncertainty.
            </span>
          </h1>

          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with trusted Sheikhs and guides for private, one-on-one
            sessions rooted in Islamic tradition — a calm space where clarity
            finds you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/guides"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all text-base text-white shadow-lg shadow-orange-900/30"
              style={{
                background:
                  "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
              }}
            >
              Speak to a Guide
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="border border-blue-300/40 hover:border-[#F0A500]/60 text-blue-100 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Learn How It Works
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-300 text-sm">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-[#F0A500]" />
              <span>Fully confidential</span>
            </div>
            <span className="hidden sm:block text-[#2d4575]">·</span>
            <div className="flex items-center gap-2">
              <Star size={15} className="text-[#F0A500]" />
              <span>Verified scholars</span>
            </div>
            <span className="hidden sm:block text-[#2d4575]">·</span>
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#F0A500]" />
              <span>Rooted in Quran &amp; Sunnah</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST CARDS ─────────────────────────── */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
              Why My Misbah
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold">
              A place built on trust.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={24} className="text-[#C8680A]" />,
                title: "Trusted Sources",
                body: "Every guide on My Misbah is a verified scholar or Imam with recognised credentials. You speak with someone who has earned the right to guide.",
              },
              {
                icon: <MessageCircle size={24} className="text-[#C8680A]" />,
                title: "Dignified Dialogue",
                body: "Your situation is received with respect and without judgement. All sessions are private, and your confidence is always protected.",
              },
              {
                icon: <Compass size={24} className="text-[#C8680A]" />,
                title: "Clear Direction",
                body: "Walk away with real clarity — answers grounded in Quran and Sunnah, tailored to your life, your context, and your moment.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-8 border border-[#EAE3D4] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#FBF0D8] rounded-xl flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="font-serif text-xl text-[#1A2B50] font-semibold mb-3">
                  {card.title}
                </h3>
                <p className="text-[#6b6878] text-sm leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GUIDES ─────────────────────── */}
      <section className="py-20 px-6 bg-[#F3EDE0]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
                Our Guides
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold">
                Meet the people behind
                <br className="hidden md:block" /> the guidance.
              </h2>
            </div>
            <Link
              href="/guides"
              className="text-sm text-[#1A2B50] font-medium inline-flex items-center gap-1.5 hover:text-[#C8680A] transition-colors group"
            >
              View All Guides
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
              The Process
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold">
              How it works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line on desktop */}
            <div
              aria-hidden
              className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[#DDD5C4]"
            />

            {[
              {
                step: "1",
                icon: <BookOpen size={22} className="text-[#1A2B50]" />,
                title: "Browse Profiles",
                body: "Explore verified guides, read their backgrounds, and find someone whose experience speaks to your needs.",
              },
              {
                step: "2",
                icon: <Clock size={22} className="text-[#1A2B50]" />,
                title: "Book a Time",
                body: "Choose a session type — a 45-minute session or a free discovery call — and pick a time that works for you.",
              },
              {
                step: "3",
                icon: <Compass size={22} className="text-[#1A2B50]" />,
                title: "Find Clarity",
                body: "Step into a private, respectful conversation and leave with genuine direction rooted in Islamic wisdom.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center text-center relative"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white border-2 border-[#EAE3D4] rounded-full flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <span
                    className="absolute -top-1 -right-1 w-6 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #C8680A 0%, #F0A500 100%)",
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-[#1A2B50] font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-[#6b6878] text-sm leading-relaxed max-w-xs">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────── */}
      <section className="py-20 px-6 bg-[#1A2B50] relative overflow-hidden">
        {/* Flame glow */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 100%, rgba(200,104,10,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="My Misbah"
              width={56}
              height={56}
              className="object-contain opacity-90"
            />
          </div>
          <p className="font-serif italic text-[#F0A500] text-xl mb-4">
            Your Light in Times of Uncertainty
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-white font-bold mb-6 leading-tight">
            Your steady footing starts here.
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Whatever you&apos;re carrying — questions about faith, family, direction,
            or yourself — there is someone here who can help you find your way
            forward.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 font-semibold px-10 py-4 rounded-xl transition-all text-base text-white shadow-lg shadow-orange-900/30"
            style={{
              background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
            }}
          >
            Find Your Guide Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
