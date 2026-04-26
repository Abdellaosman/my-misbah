import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Compass,
  ArrowRight,
  BookOpen,
  Clock,
  Star,
  Heart,
  Users,
  Lightbulb,
} from "lucide-react";
import GuideCard from "@/components/GuideCard";
import { guides } from "@/lib/data";

const featuredGuides = guides.slice(0, 3);

export default function Home() {
  return (
    <div className="bg-[#FAF8F3]">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="bg-[#1A2B50] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 110%, rgba(200,104,10,0.20) 0%, transparent 60%), radial-gradient(ellipse at 20% 60%, rgba(240,165,0,0.08) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
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

          <p className="font-serif italic text-[#F0A500] text-xl md:text-2xl mb-4 tracking-wide">
            Your Light in Times of Uncertainty
          </p>

          <h1 className="font-serif text-4xl md:text-6xl text-white font-bold leading-[1.15] mb-6 max-w-3xl mx-auto">
            Turn.{" "}
            <span
              style={{
                WebkitTextFillColor: "transparent",
                WebkitBackgroundClip: "text",
                backgroundImage:
                  "linear-gradient(135deg, #F0A500 0%, #E07D10 50%, #C8680A 100%)",
                backgroundClip: "text",
              }}
            >
              Trust.
            </span>{" "}
            Transform.
          </h1>

          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            My Misbah connects you with qualified Sheikhs and Imams for
            confidential, one-on-one sessions rooted in Islamic tradition.
            Whether you&apos;re seeking clarity on faith, advice on family matters,
            youth challenges, or life coaching through a spiritual lens — My
            Misbah brings authentic guidance to your fingertips, whenever you
            need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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

          {/* Service pills */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              "1-on-1 Guidance",
              "Personalized Q&A",
              "Marriage & Family Advice",
              "Fully Confidential",
            ].map((pill) => (
              <span
                key={pill}
                className="bg-white/10 border border-white/20 text-blue-100 px-4 py-1.5 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS MY MISBAH ───────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
            Why We Exist
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold mb-8">
            Real Guides. Real Answers. Right When You Need Them.
          </h2>
          <div className="text-[#4a4a5a] text-base leading-relaxed space-y-5 text-left max-w-3xl mx-auto">
            <p>
              Misbah means lamp — a symbol of light, clarity, and guidance. In
              an age of instant answers, scrolling fatwas, and AI-generated
              advice, many Muslims are left more confused than comforted. Because
              let&apos;s be honest: Google can&apos;t give you Fiqh. And AI doesn&apos;t
              understand your soul.
            </p>
            <p>
              That&apos;s why My Misbah exists — to reconnect you with qualified
              Sheikhs, Imams, and Guides who understand both Islam and the
              reality you&apos;re living. Whether you&apos;re facing family challenges,
              wrestling with spiritual doubts, or seeking clarity on Islamic
              rulings, Misbah offers confidential, one-on-one sessions — online,
              respectful, and rooted in timeless wisdom.
            </p>
            <p>
              This isn&apos;t just a platform. It&apos;s a bridge between timeless Islamic
              wisdom and the real-life struggles of today&apos;s Muslim. Wherever you
              are on your journey, My Misbah is here — to listen, to guide, and
              to light the way.
            </p>
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES ────────────────────────── */}
      <section id="about" className="py-20 px-6 bg-[#FAF8F3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
              Our Services
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold mb-4">
              Guidance for every part of your life.
            </h2>
            <p className="text-[#6b6878] max-w-2xl mx-auto text-base leading-relaxed">
              Everyone reaches a point where answers feel out of reach, and the
              internet, social media, friends, and family just don&apos;t cut it. My
              Misbah is here — with trusted, personalized guidance that meets
              you where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              {
                icon: <BookOpen size={22} className="text-[#C8680A]" />,
                title: "Fiqh Guidance & Religious Questions",
                subtitle: "Clarity in Belief. Confidence in Practice.",
                body: "Whether you're unsure about daily rulings, prayer matters, or complex Fiqh scenarios, our Guides provide reliable answers rooted in traditional Islamic scholarship. No more confusion, guesswork, or endless Googling — just real answers you can trust.",
              },
              {
                icon: <Heart size={22} className="text-[#C8680A]" />,
                title: "Spiritual Counselling & Life Coaching",
                subtitle: "Find Center. Build Clarity. Move Forward.",
                body: "When the heart feels heavy or direction feels unclear, spiritual counselling can help. These sessions offer space to unpack your internal world with a Guide who listens, reflects, and offers insight through the lens of Islam.",
              },
              {
                icon: <Users size={22} className="text-[#C8680A]" />,
                title: "Youth & Identity Coaching",
                subtitle: "Supporting the Next Generation with Wisdom and Compassion.",
                body: "Today's Muslim youth face unique questions around identity, purpose, and belonging. Our Guides offer a safe, judgment-free space to explore those challenges — whether it's peer pressure, faith struggles, or life direction.",
              },
              {
                icon: <Compass size={22} className="text-[#C8680A]" />,
                title: "Marriage & Family Support",
                subtitle: "Faith-Based Support for Life's Closest Bonds.",
                body: "Navigate the challenges of marriage, parenting, or family dynamics with guidance that honours both deen and emotional well-being. Our trusted Guides offer thoughtful, spiritually anchored insights to help you reconnect, rebuild, or realign.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-8 border border-[#EAE3D4] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 bg-[#FBF0D8] rounded-xl flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="font-serif text-xl text-[#1A2B50] font-semibold mb-1">
                  {card.title}
                </h3>
                <p className="text-[#C8680A] text-xs font-medium italic mb-3">
                  {card.subtitle}
                </p>
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

      {/* ── TAILORED FOR YOU ────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#C8680A] text-sm font-medium uppercase tracking-widest mb-3">
                Tailored for You
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A2B50] font-bold mb-6">
                No two lives, or souls, are the same.
              </h2>
              <p className="text-[#4a4a5a] text-base leading-relaxed mb-6">
                That&apos;s why My Misbah was built to serve you, not the masses.
                Whether you&apos;re navigating personal struggles, seeking clarity in
                your faith, or simply yearning for a safe space to talk things
                through, our platform adapts to your needs with dignity and
                care.
              </p>
              <p className="text-[#4a4a5a] text-base leading-relaxed mb-8">
                Every session is one-on-one, confidential, and grounded in
                Islamic principles — guided by people who understand both the
                tradition and the real world you live in. Because your story
                deserves more than generic advice. It deserves personalized
                guidance with purpose.
              </p>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 font-semibold px-7 py-3 rounded-xl text-white text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
                }}
              >
                Find Your Guide
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: <Lightbulb size={20} className="text-[#C8680A]" />,
                  title: "Easy Access",
                  body: "Connect with a qualified Guide from wherever you are — online, private, and on your schedule.",
                },
                {
                  icon: <Shield size={20} className="text-[#C8680A]" />,
                  title: "Secure and Confidential",
                  body: "Your conversations stay between you and your Guide. Complete privacy is non-negotiable.",
                },
                {
                  icon: <BookOpen size={20} className="text-[#C8680A]" />,
                  title: "Grounded in Tradition",
                  body: "Every answer is rooted in Quran, Sunnah, and the authentic scholarship of qualified Sheikhs.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-[#FAF8F3] rounded-2xl p-5 border border-[#EAE3D4] flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[#FBF0D8] rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A2B50] mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[#6b6878] text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-[#FAF8F3]">
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
                body: "Choose a session type — a 50-minute session or a 25-minute session — and pick a time that works for you.",
              },
              {
                step: "3",
                icon: <Star size={22} className="text-[#1A2B50]" />,
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
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 100%, rgba(200,104,10,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
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
            You don&apos;t have to navigate life alone.
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Sometimes, the next step is simply asking. Whatever you&apos;re carrying
            — questions about faith, family, direction, or yourself — there is
            someone here who can help you find your way forward. We&apos;re here when
            you&apos;re ready.
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
