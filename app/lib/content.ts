export const WHATSAPP_URL =
  "https://chat.whatsapp.com/EoXX6cNmfCM8HisDiU77AX?s=cl&p=a&mlu=4&ilr=4";
export const INSTAGRAM_URL = "https://www.instagram.com/speak_up_gen/";
export const INSTAGRAM_HANDLE = "@speak_up_gen";

export const TAGLINE = "Speak today. Shape the way.";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  phone?: string;
};

/** Ordered by role seniority — founder first, technical head last. */
export const TEAM: TeamMember[] = [
  {
    name: "Satyam Pandey",
    role: "Founder & Director",
    image: "/team/satyam-pandey.jpg",
    phone: "+91 62004 53772",
  },
  {
    name: "Aditya Kini",
    role: "President",
    image: "/team/aditya-kini.jpg",
    phone: "+91 93076 94155",
  },
  {
    name: "Dhruvi Jain",
    role: "Vice President",
    image: "/team/dhruvi-jain.jpg",
  },
  {
    name: "Kartavya Rathad",
    role: "Vice President",
    image: "/team/kartavya-rathad.jpg",
    phone: "+91 92840 52173",
  },
  {
    name: "Jayankit Thakur",
    role: "Personal Advisor",
    image: "/team/jayankit-thakur.jpg",
  },
  {
    name: "Badal Kumar",
    role: "Technical Head",
    image: "/team/badal-kumar.jpg",
    phone: "+91 70045 59534",
  },
];

export const HASHTAGS = [
  "#SpeakUpGen",
  "#YouthForChange",
  "#SpeakUp",
  "#TakeAction",
  "#SocialAwareness",
  "#EnvironmentalAwareness",
  "#YouthPower",
  "#CommunityAction",
];

export type PillarIcon = "megaphone" | "leaf" | "mind" | "hands" | "brush" | "bulb";

export const PILLARS: {
  title: string;
  line: string;
  body: string;
  tags: string[];
  icon: PillarIcon;
}[] = [
  {
    title: "Social Awareness",
    line: "Talk about issues that matter.",
    body: "The conversations people skip at the dinner table — we bring them into the open. Honest talks, sharp posters and campaigns that make people stop scrolling and start thinking.",
    tags: ["Open discussions", "Awareness campaigns", "Street outreach"],
    icon: "megaphone",
  },
  {
    title: "Environmental Action",
    line: "Promote sustainable practices & activities.",
    body: "Clean-up drives, plastic-free habits, planting and everyday choices that add up. We don't just post about the planet — we put on gloves and show up for it.",
    tags: ["Clean-up drives", "Plantation", "Waste segregation"],
    icon: "leaf",
  },
  {
    title: "Youth Awareness",
    line: "Mental health, sexual health, education & more.",
    body: "The topics nobody explained properly in school. We create safe, judgement-free spaces to learn, ask the awkward questions and look out for each other.",
    tags: ["Mental health", "Sexual health", "Education"],
    icon: "mind",
  },
  {
    title: "Community Activities",
    line: "Awareness drives, campaigns & volunteering.",
    body: "Out of the group chat and into the neighbourhood. We team up for drives, campaigns and volunteering that real people actually feel.",
    tags: ["Awareness drives", "Volunteering", "Local campaigns"],
    icon: "hands",
  },
  {
    title: "Content Creation",
    line: "Posters, reels, articles, creative campaigns.",
    body: "If you can design, film, write, edit or just have a strong opinion — there's a canvas for you. Our content is how one drive reaches a thousand people.",
    tags: ["Posters", "Reels", "Articles"],
    icon: "brush",
  },
  {
    title: "Idea Sharing",
    line: "Turn your ideas into real-world initiatives.",
    body: "Had an idea at 2 a.m. about fixing something around you? Bring it to the group. If it helps someone, we'll help you build it.",
    tags: ["Brainstorms", "Pilot projects", "Your initiative"],
    icon: "bulb",
  },
];

export const REASONS: { text: string; note?: string }[] = [
  { text: "Make a difference beyond the classroom", note: "the real syllabus" },
  { text: "Get a platform to Speak Up" },
  { text: "Meet like-minded young people", note: "new friends incoming" },
  { text: "Learn through real-world experiences" },
  {
    text: "Develop communication, leadership & teamwork skills",
    note: "CV goes brrr",
  },
  { text: "Contribute to causes that matter to you" },
];

export const WANTS = [
  "raise my voice",
  "share ideas",
  "volunteer",
  "create awareness",
  "work with a team",
  "take action in my community",
];
