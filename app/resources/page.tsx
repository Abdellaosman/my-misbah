import { Phone } from "lucide-react";

export const metadata = {
  title: "Crisis Resources — My Misbah",
  description:
    "Canada-wide and provincial crisis resources for mental health, family violence, and emergency support.",
};

const provinces = [
  {
    name: "Canada-Wide",
    resources: [
      { label: "Emergency Services", detail: "Call 911 for immediate danger or medical emergencies" },
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time for confidential support" },
      { label: "Canada Poison Centres", detail: "1-844-POISON-X (1-844-764-7669)" },
      { label: "Kids Help Phone", detail: "Call 1-800-668-6868 or text CONNECT to 686868" },
      { label: "Hope for Wellness Help Line", detail: "Culturally-safe counselling for Indigenous people — 1-855-242-3310" },
    ],
  },
  {
    name: "Alberta",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Family Violence Support", detail: "Dial 2-1-1 for Alberta-wide services and shelters" },
      { label: "Addictions Helpline", detail: "1-866-332-2322" },
      { label: "Mental Health Helpline", detail: "1-877-303-2642" },
      { label: "Distress Centre Calgary", detail: "Phone or text 403-266-4357" },
      { label: "CMHA Edmonton Distress Line", detail: "780-482-4357" },
      { label: "24/7 Crisis Diversion (Edmonton)", detail: "Dial 211 then press 3" },
    ],
  },
  {
    name: "British Columbia",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "BC Suicide Line", detail: "1-800-SUICIDE (784-2433)" },
      { label: "Mental Health Support Line", detail: "310-6789" },
      { label: "VictimLinkBC", detail: "1-800-563-0808 (text 604-836-6381)" },
      { label: "Vancouver Coastal Distress Line", detail: "604-872-3311" },
      { label: "Vancouver Island Crisis Line", detail: "1-888-494-3888 (text 250-800-3806, 6–10 pm PT)" },
    ],
  },
  {
    name: "Saskatchewan",
    resources: [
      { label: "HealthLine 811", detail: "Call 811 for mental-health guidance" },
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Family Violence Support", detail: "Dial 2-1-1 for provincial referrals" },
      { label: "Regina Mobile Crisis Services", detail: "306-757-0127" },
      { label: "Saskatoon Crisis Intervention Service", detail: "306-933-6200" },
    ],
  },
  {
    name: "Manitoba",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Manitoba Domestic Violence Crisis Line", detail: "1-877-977-0007" },
      { label: "Manitoba Suicide Line", detail: "1-877-435-7170" },
      { label: "Winnipeg Crisis Response Centre", detail: "204-940-1781" },
      { label: "Klinic Crisis Line", detail: "204-786-8686 or 1-888-322-3019" },
    ],
  },
  {
    name: "Ontario",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Assaulted Women's Helpline", detail: "1-866-863-0511 (TTY 1-866-863-7868)" },
      { label: "Distress Centre Toronto", detail: "416-408-4357" },
      { label: "Distress Centre Ottawa", detail: "613-238-3311 (English) or 1-866-676-1080 (French)" },
      { label: "ConnexOntario", detail: "1-866-531-2600" },
    ],
  },
  {
    name: "Quebec",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Domestic Violence SOS", detail: "1-800-363-9010" },
      { label: "Info-Social 811", detail: "Dial 811 and select option 2" },
      { label: "Suicide Prevention Helpline", detail: "1-866-277-3553; text 535353" },
      { label: "Tel-jeunes", detail: "1-800-263-2266" },
    ],
  },
  {
    name: "New Brunswick",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Chimo Helpline", detail: "1-800-667-5005" },
      { label: "Addiction and Mental Health Helpline", detail: "1-866-355-5550" },
      { label: "211 New Brunswick", detail: "1-855-258-4126" },
    ],
  },
  {
    name: "Nova Scotia",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Mental Health & Addictions Crisis Line", detail: "1-888-429-8167 (Halifax: 902-429-8167)" },
      { label: "211 Nova Scotia", detail: "Dial 2-1-1 for referrals and support" },
    ],
  },
  {
    name: "Prince Edward Island",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Mental Health & Addictions Access Line", detail: "1-833-553-6983" },
      { label: "Health Line", detail: "811" },
      { label: "Family Violence Line", detail: "1-800-240-9894" },
      { label: "PEI Rape & Sexual Assault Centre", detail: "1-866-566-1864" },
    ],
  },
  {
    name: "Newfoundland & Labrador",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Mental Health Crisis Line", detail: "811" },
      { label: "Sexual Assault Crisis Line", detail: "709-726-1411 or 1-800-726-2743" },
    ],
  },
  {
    name: "Yukon",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Rapid Access Counselling", detail: "867-456-3838 or 1-866-456-3838" },
      { label: "CMHA Yukon Reach Out Line", detail: "1-844-533-3030" },
    ],
  },
  {
    name: "Northwest Territories",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "NWT 811 Helpline", detail: "811 or 1-844-259-1793" },
      { label: "After-hours Helpline", detail: "1-800-661-0844" },
    ],
  },
  {
    name: "Nunavut",
    resources: [
      { label: "9-8-8 Suicide Crisis Helpline", detail: "Call or text 9-8-8 any time" },
      { label: "Kamatsiaqtut Help Line", detail: "867-979-3333 (Iqaluit) or 1-800-265-3333" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Header */}
      <section className="bg-[#1A2B50] px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            Resources
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-6">
            Crisis &amp; Support Resources
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-2xl">
            At My Misbah, our services provide Islamically grounded guidance and
            spiritual support. We are not a crisis service, not a medical or
            mental-health provider, and our guides do not offer diagnosis,
            emergency intervention, or clinical treatment.
          </p>
          <p className="text-blue-300 text-sm leading-relaxed max-w-2xl mt-4">
            The resources listed below are provided for informational and
            supportive purposes only. If you or someone else is experiencing a
            mental-health crisis, thoughts of self-harm, or a medical emergency,
            please contact local emergency services immediately.
          </p>
        </div>
      </section>

      {/* Emergency banner */}
      <div className="bg-red-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Phone size={18} className="text-white flex-shrink-0" />
          <p className="text-white font-semibold text-sm">
            In an emergency, call <span className="text-yellow-300">911</span>{" "}
            immediately. For suicide crisis support anywhere in Canada, call or
            text{" "}
            <span className="text-yellow-300 font-bold">9-8-8</span> any time,
            24/7.
          </p>
        </div>
      </div>

      {/* Province sections */}
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {provinces.map((province) => (
            <div
              key={province.name}
              className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm overflow-hidden"
            >
              <div className="bg-[#1A2B50] px-6 py-3">
                <h2 className="font-serif text-white font-semibold text-lg">
                  {province.name}
                </h2>
              </div>
              <ul className="divide-y divide-[#F3EDE0]">
                {province.resources.map((r) => (
                  <li key={r.label} className="px-6 py-3.5 flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8680A] mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-[#1A2B50] text-sm">
                        {r.label}:
                      </span>{" "}
                      <span className="text-[#4a4a5a] text-sm">{r.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="max-w-4xl mx-auto mt-8 text-xs text-[#9895a2]">
          Updated: January 6, 2026. My Misbah does not monitor these services
          and is not responsible for their availability, response times, or
          outcomes.
        </p>
      </section>
    </div>
  );
}
