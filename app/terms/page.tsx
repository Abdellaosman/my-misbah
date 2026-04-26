export const metadata = {
  title: "Terms & Conditions — My Misbah",
  description: "Terms and Conditions governing the use of My Misbah services.",
};

const sections = [
  {
    number: "1",
    title: "About My Misbah",
    content: `My Misbah is a faith-based platform that connects individuals with qualified Guides, including Imams, Sheikhs, and spiritual educators, for spiritual guidance, religious counselling, coaching, and advisory support.

Our services are non-clinical, non-diagnostic, non-emergency, and not a substitute for medical, psychological, psychiatric, or crisis services.`,
  },
  {
    number: "2",
    title: "Eligibility",
    content: `By using My Misbah, you confirm that you are at least 18 years of age, you are legally capable of entering into this agreement, and you will engage with the platform honestly, respectfully, and in good faith.

My Misbah is actively exploring the expansion of certain services for individuals under the age of 18. Any such services, if offered in the future, will be subject to separate terms, parental or guardian consent, and additional safeguards.`,
  },
  {
    number: "3",
    title: "Nature & Scope of Services",
    content: `Guidance provided through My Misbah is rooted in Islamic knowledge, ethics, and advisory principles, is based on the information you voluntarily provide, and does not constitute medical advice, mental health treatment, legal advice, or crisis intervention.

You acknowledge that spiritual guidance is inherently personal and interpretive, and outcomes cannot be guaranteed.`,
  },
  {
    number: "4",
    title: "Platform Use",
    content: `My Misbah uses Carepatron for scheduling, communication, record-keeping, and service delivery.

You agree to use the platform lawfully and respectfully, not misuse, disrupt, or attempt unauthorized access, and provide accurate and truthful information to the best of your knowledge.`,
  },
  {
    number: "5",
    title: "Confidentiality & Privacy",
    content: `Your personal information is collected, used, stored, and disclosed in accordance with our Privacy & Confidentiality Policy and applicable Canadian privacy laws, including PIPEDA.

Confidentiality is respected but not absolute and may be limited in certain legal or safety-related circumstances.`,
  },
  {
    number: "6",
    title: "Right to Decline or Discontinue Services",
    content: `My Misbah and its Guides reserve the right to decline, suspend, or discontinue services at any time. This may occur when services are not a productive or appropriate fit, a client's needs fall outside a Guide's scope or expertise, ethical, safety, or boundary concerns arise, or there is misuse of the platform or breach of these Terms.

If services are discontinued, you will be informed respectfully.`,
  },
  {
    number: "7",
    title: "Client Responsibilities",
    content: `As a client, you agree to engage respectfully with Guides and staff, take responsibility for your own decisions and actions, seek appropriate professional or emergency care when needed, and understand that spiritual guidance does not replace professional services.`,
  },
  {
    number: "8",
    title: "No Emergency, Crisis, or Clinical Services",
    content: `My Misbah does not provide emergency services, crisis intervention, psychiatric care, psychotherapy, or clinical mental health treatment. Our Guides are not acting as physicians, psychologists, psychiatrists, licensed clinical therapists, or emergency responders.

If you are experiencing suicidal thoughts, intent to harm yourself or others, severe emotional distress, or immediate danger, you must seek immediate assistance from local emergency services, a licensed mental health professional, or a crisis hotline or emergency department.`,
  },
  {
    number: "9",
    title: "Records & Access",
    content: `You may request access to your personal information in accordance with our Privacy & Confidentiality Policy and PIPEDA.

You acknowledge that professional notes reflect the Guide's perspective and judgment, requests for factual corrections will be considered, and Guides are not required to alter professional opinions, interpretations, or observations.`,
  },
  {
    number: "10",
    title: "Payments & Fees",
    content: `Fees are clearly communicated at the time of booking. All services booked through My Misbah are payable through our designated booking platform, and booking a session reserves dedicated time with a Guide and constitutes acceptance of the applicable fees, cancellation, and refund terms.

Clients may cancel or reschedule sessions up to 48 hours prior to the scheduled start time without penalty. Cancellations or failure to attend without notice within 48 hours may result in the session being charged in part or full and are non-refundable.

Due to the preparation required for Nikaah services, a non-refundable deposit of 20% of the total Nikaah service fee is required at the time of booking.`,
  },
  {
    number: "11",
    title: "Intellectual Property",
    content: `All content on the My Misbah platform, including text, branding, materials, and frameworks, is the intellectual property of My Misbah or its licensors. You may not reproduce, distribute, or use content for commercial purposes without written permission.`,
  },
  {
    number: "12",
    title: "Limitation of Liability",
    content: `To the fullest extent permitted by law, My Misbah is not liable for decisions, actions, or outcomes resulting from guidance provided. Services are provided "as is" and "as available." No guarantees are made regarding outcomes or results. You use the platform at your own discretion and risk.`,
  },
  {
    number: "13",
    title: "Indemnification",
    content: `You agree to indemnify, defend, and hold harmless My Misbah, its founders, administrators, employees, contractors, and Guides from and against any and all claims, demands, losses, damages, liabilities, costs, and expenses arising out of or related to your use or misuse of the My Misbah platform, your reliance on spiritual guidance or advisory services, decisions or actions based on guidance provided, failure to seek appropriate professional or emergency support when needed, or breach of these Terms.`,
  },
  {
    number: "14",
    title: "Termination",
    content: `My Misbah may suspend or terminate your access to the platform at any time for breach of these Terms or for operational, ethical, or safety reasons. Termination does not affect obligations that reasonably should survive termination.`,
  },
  {
    number: "15",
    title: "Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the Province of Alberta and the laws of Canada applicable therein. You agree that any dispute, claim, or proceeding arising out of or relating to these Terms shall be exclusively brought in the courts of the Province of Alberta.`,
  },
  {
    number: "16",
    title: "Changes to These Terms",
    content: `We may update these Terms from time to time. Updates will be posted on our website with a revised effective date. Continued use of the platform constitutes acceptance of the updated Terms.`,
  },
  {
    number: "17",
    title: "Contact Information",
    content: `For questions regarding these Terms, please contact:\n\nEmail: admin@mymisbah.com\nWebsite: www.mymisbah.com`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Header */}
      <section className="bg-[#1A2B50] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-blue-300 text-sm">
            Effective Date: August 1, 2025 &nbsp;·&nbsp; Last Updated: August 1, 2025
          </p>
          <p className="text-blue-200 text-base leading-relaxed mt-4 max-w-2xl">
            Welcome to My Misbah. These Terms &amp; Conditions govern your access to
            and use of the My Misbah website, platform, and services. By
            accessing or using My Misbah, you agree to be bound by these Terms.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((s) => (
            <div
              key={s.number}
              className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm p-7"
            >
              <h2 className="font-serif text-xl text-[#1A2B50] font-semibold mb-4">
                {s.number}. {s.title}
              </h2>
              <div className="space-y-3">
                {s.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-[#4a4a5a] text-sm leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
