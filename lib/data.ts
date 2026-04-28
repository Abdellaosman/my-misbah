export interface BookingOption {
  type: string;
  duration: string;
  price: string;
  description: string;
}

export interface Guide {
  id: string;
  name: string;
  title: string;
  location: string;
  image: string;
  shortBio: string;
  fullBio: string;
  expertise: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  roles: string[];
  bookingOptions: BookingOption[];
  verified: boolean;
  yearsExperience?: number;
}

export const guides: Guide[] = [
  {
    id: "sheikh-zubair-sidyot",
    name: "Sheikh Zubair Sidyot",
    title: "Imam, Educator & Spiritual Counsellor",
    location: "Lethbridge, Alberta",
    image: "/zubair.png",
    shortBio:
      "A compassionate Imam with deep roots in Quranic scholarship and spiritual counselling. Sheikh Zubair brings patient, non-judgmental guidance to every session.",
    fullBio:
      "Sheikh Zubair Sidyot is an Imam, educator, and spiritual counsellor based in Lethbridge, Alberta. Having pursued his Islamic education in both India and Saudi Arabia, he brings a rich scholarly foundation to his work with individuals and families. He holds a Hadith certification and has spent years serving his community as Imam at the Lethbridge Muslim Association.\n\nBeyond the masjid, Sheikh Zubair extends his care into challenging spaces — including chaplaincy work in the prison system — and serves as a marriage officiant. His approach to counselling is marked by deep compassion, patience, and a commitment to meeting people where they are — without judgement, without pressure.",
    expertise: [
      "Spiritual Counselling",
      "Marriage Guidance",
      "Family Matters",
      "Quran & Hadith",
      "Youth Support",
      "Life Transitions",
    ],
    languages: ["English", "Urdu", "Arabic"],
    education: [
      "Islamic studies completed in India and Saudi Arabia",
      "Hadith certification (Ijaza)",
      "Extensive study under senior scholars",
    ],
    certifications: [
      "Certified Marriage Officiant",
      "Prison Chaplaincy Credential",
    ],
    roles: [
      "Imam — Lethbridge Muslim Association",
      "Prison Chaplain",
      "Marriage Officiant",
      "Community Educator",
    ],
    bookingOptions: [
      {
        type: "One-on-One Session",
        duration: "45 min",
        price: "Contact for pricing",
        description: "A focused, private session to address your concerns.",
      },
      {
        type: "Discovery Call",
        duration: "15 min",
        price: "Free",
        description:
          "A brief introduction to see if Sheikh Zubair is the right fit for you.",
      },
    ],
    verified: true,
  },
  {
    id: "sheikh-yahya-abdi-hadi",
    name: "Sheikh Yahya Abdi Hadi",
    title: "Imam & Educator",
    location: "Richmond, BC",
    image: "/yahya.png",
    shortBio:
      "A graduate of the Islamic University of Madinah with over a decade of community service, Sheikh Yahya blends scholarly depth with an approachable, grounded presence.",
    fullBio:
      "Sheikh Yahya Abdi Hadi is an Imam and educator based in Richmond, British Columbia. He holds a degree from the prestigious Islamic University of Madinah in Qur'anic Studies, as well as a Biology degree from the University of British Columbia — a combination that speaks to his ability to engage with both spiritual and contemporary concerns.\n\nWith over 10 years of experience serving the Muslim community, Sheikh Yahya currently serves as Imam at Richmond Jamea Masjid. He is especially known for his work with youth and premarital mentoring, helping young people navigate faith, identity, and life decisions with clarity. He is also the founder of Kitaab Academy, an initiative dedicated to Islamic education.",
    expertise: [
      "Qur'anic Studies",
      "Premarital Counselling",
      "Youth Mentoring",
      "Islamic Education",
      "Personal Development",
      "Faith & Identity",
    ],
    languages: ["English", "Arabic", "Somali"],
    education: [
      "Islamic University of Madinah — Qur'anic Studies",
      "University of British Columbia — Biology (BSc)",
    ],
    certifications: ["Ijaza in Qur'anic Sciences"],
    roles: [
      "Imam — Richmond Jamea Masjid",
      "Founder — Kitaab Academy",
      "Premarital & Youth Mentor",
    ],
    bookingOptions: [
      {
        type: "One-on-One Session",
        duration: "45 min",
        price: "Contact for pricing",
        description: "A focused, private session to address your concerns.",
      },
      {
        type: "Discovery Call",
        duration: "15 min",
        price: "Free",
        description:
          "A brief introduction to see if Sheikh Yahya is the right fit for you.",
      },
    ],
    verified: true,
    yearsExperience: 10,
  },
  {
    id: "sheikh-osama-raja",
    name: "Sheikh Osama Raja",
    title: "Imam & Educator",
    location: "Calgary, Alberta",
    image: "/osama.png",
    shortBio:
      "With over a decade of Imam experience across Surrey and Calgary, Sheikh Osama specialises in youth mentorship, relationship guidance, and supporting people through life transitions.",
    fullBio:
      "Sheikh Osama Raja is an Imam and educator with over 10 years of experience serving Muslim communities across British Columbia and Alberta. Having led congregations in both Surrey and Calgary, he carries a wealth of pastoral and community experience.\n\nSheikh Osama has a particular focus on the challenges facing young Muslims today — helping them navigate identity, relationships, and purpose with grounding in Islamic values. He is known for being approachable, direct, and deeply invested in the well-being of those he works with, making him an especially strong support for those facing relationship concerns or major life transitions.",
    expertise: [
      "Youth Mentorship",
      "Relationship Guidance",
      "Life Transitions",
      "Community Leadership",
      "Personal Counselling",
      "Faith Strengthening",
    ],
    languages: ["English", "Urdu"],
    education: [
      "Islamic studies under senior scholars",
      "10+ years of practical community leadership",
    ],
    certifications: [],
    roles: [
      "Imam — Surrey, BC (former)",
      "Imam — Calgary, Alberta",
      "Youth Mentor & Counsellor",
    ],
    bookingOptions: [
      {
        type: "One-on-One Session",
        duration: "45 min",
        price: "Contact for pricing",
        description: "A focused, private session to address your concerns.",
      },
      {
        type: "Discovery Call",
        duration: "15 min",
        price: "Free",
        description:
          "A brief introduction to see if Sheikh Osama is the right fit for you.",
      },
    ],
    verified: true,
    yearsExperience: 10,
  },
];

export function getGuideById(id: string): Guide | undefined {
  return guides.find((g) => g.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}
