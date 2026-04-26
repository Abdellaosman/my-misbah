export const metadata = {
  title: "Privacy & Confidentiality Policy — My Misbah",
  description:
    "How My Misbah collects, uses, stores, and protects your personal information.",
};

const sections = [
  {
    number: "1",
    title: "Legal Framework & Regulatory Compliance",
    content: `My Misbah complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation in Canada.

Under PIPEDA, My Misbah adheres to the following principles: Accountability, identifying purposes for collection, informed consent, limiting collection, use, disclosure, and retention, accuracy, safeguards, openness, individual access, and challenging compliance.

Personal information is collected, used, and disclosed only for purposes that a reasonable person would consider appropriate in the circumstances.`,
  },
  {
    number: "2",
    title: "Nature of Services & Relationship",
    content: `My Misbah provides faith-based spiritual guidance, religious counselling, coaching, and advisory services. These services are non-clinical and are not a substitute for medical care, mental health treatment, emergency services, or crisis intervention.

Your relationship with your Guide is advisory and spiritual in nature, governed by this Privacy Policy and our Terms of Service.`,
  },
  {
    number: "3",
    title: "Information We Collect",
    content: `We may collect and store the following categories of information: identifying information (name, email address, contact details), account, scheduling, and session-related information, information voluntarily shared during sessions or communications, limited administrative and billing information, and technical and usage data required for platform security and functionality.

We collect only the minimum information necessary to deliver services responsibly and effectively.`,
  },
  {
    number: "4",
    title: "Platform & Data Security (Carepatron)",
    content: `My Misbah uses Carepatron as its secure practice-management platform.

Carepatron provides encrypted data storage and transmission, role-based access controls, secure cloud infrastructure, ongoing security monitoring and updates, and compliance with recognized international data-security standards (including HIPAA-aligned safeguards and ISO-based security practices, where applicable).

While Carepatron applies industry-standard protections, no digital system can guarantee absolute security. By using My Misbah, you acknowledge and accept this inherent risk.`,
  },
  {
    number: "5",
    title: "Access to Personal Information",
    content: `Access to your information is strictly limited. Your assigned Guide may access your session information for the purpose of providing services. My Misbah administrators may access limited data strictly for operational, technical, compliance, or billing purposes. No other Guides, third parties, or organizations may access your information without your consent, unless required by law.`,
  },
  {
    number: "6",
    title: "Consultative Use of Information",
    content: `Where appropriate, a Guide may request to consult another qualified Guide for scholarly, advisory, or supervisory purposes.

Such consultation will occur only with your informed consent, be limited to the minimum necessary information, and remain confidential and purpose-bound. You may decline consultative sharing at any time without penalty.`,
  },
  {
    number: "7",
    title: "Non-Judgmental & Ethical Care",
    content: `My Misbah is committed to providing services that are respectful, non-judgmental, and ethically grounded.

Information shared by you will never be used to shame, stigmatize, or disadvantage you. Differences in belief, practice, background, or personal struggle are approached with care and professionalism.`,
  },
  {
    number: "8",
    title: "Limitations to Confidentiality",
    content: `Confidentiality is a foundational principle of My Misbah; however, it is not absolute.

Disclosure of information may occur without your consent where My Misbah or a Guide reasonably believes that disclosure is required to comply with applicable laws, court orders, or regulatory requirements; respond to a lawful request from a government or regulatory authority; prevent or reduce a serious and imminent risk of harm to you or another identifiable person; address credible threats of violence, abuse, or illegal activity; or protect the legal rights, safety, or integrity of My Misbah, its Guides, or the public.

Where feasible and appropriate, we will make reasonable efforts to inform you before disclosure occurs.`,
  },
  {
    number: "9",
    title: "Right to Decline or Discontinue Services",
    content: `My Misbah and its Guides reserve the right to decline, suspend, or discontinue services at any time for reasons including: determination that the services are not a productive or appropriate fit, assessment that your needs fall outside the Guide's scope of expertise, boundary, safety, or ethical concerns, or misuse of the platform or violation of the Terms of Service.

If we decide not to proceed with you as a client, you will be informed respectfully and transparently. Where appropriate, we may suggest alternative resources.`,
  },
  {
    number: "10",
    title: "Retention & Storage of Information",
    content: `Personal information is retained only for as long as necessary to provide services, meet legal, regulatory, or operational requirements, or resolve disputes or enforce agreements. When no longer required, information is securely deleted or anonymized.`,
  },
  {
    number: "11",
    title: "Your Rights Under PIPEDA",
    content: `You have the right to request access to your personal information, request corrections to inaccurate or incomplete information, withdraw consent, subject to legal and contractual limitations, and request deletion of your account, where permissible.

Requests may be made by contacting My Misbah using the details below.`,
  },
  {
    number: "12",
    title: "Alignment With Terms of Service",
    content: `This Privacy & Confidentiality Policy operates alongside and in conjunction with the My Misbah Terms of Service. In the event of any inconsistency, the Terms of Service shall prevail to the extent permitted by law.`,
  },
  {
    number: "13",
    title: "Policy Updates",
    content: `We may update this policy periodically. Changes will be posted on our website with the revised effective date. Continued use of the platform constitutes acceptance of the updated policy.`,
  },
  {
    number: "14",
    title: "Contact Information",
    content: `For questions, concerns, or privacy-related requests, please contact:\n\nEmail: admin@mymisbah.com\nWebsite: www.mymisbah.com`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Header */}
      <section className="bg-[#1A2B50] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4">
            Privacy &amp; Confidentiality Policy
          </h1>
          <p className="text-blue-300 text-sm">
            Effective Date: August 1, 2025 &nbsp;·&nbsp; Last Updated: August 1, 2025
          </p>
          <p className="text-blue-200 text-base leading-relaxed mt-4 max-w-2xl">
            At My Misbah, we recognise that seeking spiritual guidance requires
            trust, discretion, and care. We are committed to protecting your
            personal information, respecting your dignity, and maintaining
            confidentiality in accordance with Islamic ethical principles,
            Canadian privacy law, and industry best practices.
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
