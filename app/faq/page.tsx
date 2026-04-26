import Link from "next/link";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "What is My Misbah?",
    a: "My Misbah is a private, faith-based Islamic guidance platform created to help Muslims navigate life's personal, relational, and spiritual challenges — with clarity, dignity, and confidence.\n\nMy Misbah is not therapy, not clinical counselling, and not crisis or emergency intervention. We do not diagnose mental health conditions, provide medical treatment, or replace licensed healthcare services. Instead, we offer something many Muslims are deeply seeking but rarely able to access easily: dedicated, confidential Islamic guidance that is practical, thoughtful, and grounded in real life.",
  },
  {
    q: "Why was My Misbah created?",
    a: "The challenges Muslims face today are complex. Many individuals are sincere in their faith yet struggle with marriage and family pressures, identity and belonging, emotional burnout and overwhelm, faith doubts or spiritual stagnation, navigating modern life while staying true to Islamic values, and major life decisions.\n\nThese issues cannot be addressed through short conversations, general reminders, or rushed advice. They require time, care, wisdom, and personal attention. My Misbah was created to meet this reality — by providing intentional, one-on-one guidance that treats your situation with the seriousness it deserves.",
  },
  {
    q: "Why isn't this offered for free?",
    a: "Because quality guidance requires responsibility, preparation, and care. To offer the highest standard of Islamic guidance, My Misbah ensures that sessions are unrushed and focused entirely on you, guides are carefully vetted and supported, and conversations remain private, ethical, and confidential.\n\nThis level of care cannot be delivered casually or sustainably without structure. Payment allows My Misbah to maintain Ihsaan (excellence) — not shortcuts. You are not paying for opinions. You are investing in clarity, direction, and sincere counsel.",
  },
  {
    q: "Why are My Misbah sessions virtual?",
    a: "My Misbah sessions are intentionally offered virtually to protect your privacy, dignity, and access to the highest quality guidance. Virtual sessions allow you to speak from a space where you feel safe, maintain anonymity and discretion, access Guides who are not connected to your local Masjid or community, and schedule sessions without travel or logistical stress.\n\nFor many Muslims, guidance is most effective when sought quietly and intentionally. A virtual format removes unnecessary barriers and keeps the focus where it belongs — on your growth, clarity, and success.",
  },
  {
    q: "Is this therapy or crisis support?",
    a: "No. My Misbah does not provide clinical therapy, psychiatric treatment, or emergency or crisis intervention.\n\nIf someone is experiencing severe mental health distress or immediate risk of harm, we encourage seeking licensed medical or emergency services. My Misbah exists to support the many Muslims who are functioning, capable, and sincere — but need wise guidance to move forward and regain spiritual grounding.",
  },
  {
    q: "What makes My Misbah different?",
    a: "My Misbah offers dedicated time with a Guide who listens deeply, faith-centered guidance rooted in Islam, practical advice (not lectures), privacy and anonymity free from community pressure, and respect for your dignity and reputation.\n\nThis is guidance designed to help you succeed — not just cope.",
  },
  {
    q: "Shouldn't I just make Du'a and have patience?",
    a: "Du'a and patience are essential — but Islam never taught us to struggle alone. The Prophet ﷺ sought counsel. The Sahaba consulted one another. Islam encourages seeking guidance while relying on Allah. My Misbah does not replace Du'a — it supports it with action, clarity, and wise perspective.",
  },
  {
    q: "Why can't I just talk to my local Imam?",
    a: "Local Imams serve their communities sincerely — but proximity can limit openness. Many Muslims hesitate to speak freely because sensitive topics feel awkward or risky, the local Imam knows their family, or the local Imam is part of their social circle.\n\nMy Misbah offers distance without disconnection — allowing honesty without fear of embarrassment or exposure.",
  },
  {
    q: "Can I remain anonymous?",
    a: "Yes — and this is a core feature. Your Guide does not know your Masjid, family, or community unless you choose to share. You may use a preferred name and disclose only what is necessary.\n\nAnonymity protects your reputation, your dignity, and your emotional safety. When fear of judgment is removed, real growth begins.",
  },
  {
    q: "Is this halal?",
    a: "Yes. Seeking advice, counsel, and guidance is well established in Islamic tradition. Scholars historically offered private counsel, and communities supported those who provided knowledge and guidance. My Misbah operates within Islamic ethics, intention, and responsibility.",
  },
  {
    q: "What if my problem is 'too small'?",
    a: "Small issues become heavy when ignored. Many major life struggles start as quiet questions. Seeking guidance early is wisdom, not exaggeration. If it matters to you, it matters enough to bring forward.",
  },
  {
    q: "What if my issue is embarrassing or shameful?",
    a: "Islam teaches covering faults, not exposing them. My Misbah exists precisely for the questions people are afraid to ask publicly. You are met with compassion, not judgment.",
  },
  {
    q: "What if I don't know how to explain my problem?",
    a: "You don't need perfect words. Part of the session is helping you untangle your thoughts, name what you're feeling, and gain clarity step by step.",
  },
  {
    q: "What if I'm not very religious?",
    a: "My Misbah meets you where you are. Guidance is offered with gentleness, not pressure. Growth happens through understanding, not force.",
  },
  {
    q: "What if I don't feel comfortable with my Guide?",
    a: "Your success comes first. If a different Guide would serve you better, you may request a change. Our goal is not retention — it is impact.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Appointments may be cancelled or rescheduled up to 48 hours in advance without penalty. Changes made within 48 hours of the scheduled time, as well as missed appointments without notice, may be charged in full.\n\nIf a Guide needs to cancel due to unforeseen circumstances, clients will always be offered the option to reschedule or receive a refund.\n\nFor Nikaah services, a 20% non-refundable deposit is required at the time of booking to cover preparation and coordination.",
  },
];

export const metadata = {
  title: "Frequently Asked Questions — My Misbah",
  description:
    "Answers to common questions about My Misbah, our services, confidentiality, and how Islamic guidance works.",
};

export default function FAQPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Header */}
      <section className="bg-[#1A2B50] px-6 py-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 120%, rgba(200,104,10,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            Support
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed italic font-serif">
            Seeking counsel is Sunnah. Seeking it wisely is Hikmah.
          </p>
          <p className="text-blue-300 text-base mt-4 leading-relaxed">
            If you are here, it means you are taking your faith and your life
            seriously. My Misbah exists to meet you there — with care,
            discretion, and guidance you can trust.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm p-7"
            >
              <h2 className="font-serif text-lg text-[#1A2B50] font-semibold mb-3">
                {faq.q}
              </h2>
              <div className="space-y-3">
                {faq.a.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[#4a4a5a] text-sm leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#F3EDE0]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-2xl text-[#1A2B50] font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-[#6b6878] text-base mb-8">
            Browse our guides and start with a free discovery call — no
            commitment, no pressure.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
            }}
          >
            Find Your Guide
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
