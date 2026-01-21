export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string | null;
  demo: string | null;
  images: string[];
}

export const projects: Project[] = [
  {
    title: "BumperBook",
    description:
      "BumperBook is an early stage prototype for an AI-powered vehicle history value service and social platform.",
    tech: ["Next.js", "TypeScript", "AI Integration", "VIN API", "PostgreSQL"],
    github: null,
    demo: "https://bumperbook.net",
    images: ["/bumperbookdesktop.png"],
  },
  {
    title: "DS Auto Care",
    description:
      "My auto styling business's website built with Python Flask backend and modern frontend technologies. Features service showcases, booking system, and responsive design.",
    tech: ["Python Flask", "JavaScript", "HTML5", "CSS3", "SCSS"],
    github: "https://github.com/DRidleyS/portfo",
    demo: "https://dsautocare.com",
    images: ["/DSAutoCare.png"],
  },
  {
    title: "eCapture",
    description:
      "Elims company website showcasing professional services with modern design and responsive layouts.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/DRidleyS/eCapture",
    demo: "https://ecapture.online",
    images: ["/ecaptured.png", "/ecaptured1.png", "/ecaptured.gif"],
  },
  {
    title: "GSAP Apple Website",
    description:
      "Learning creative UX design by imitating the most visually persuasive product page in modern times. Advanced GSAP animations and scroll-triggered effects.",
    tech: ["JavaScript", "GSAP", "HTML5", "CSS3"],
    github: "https://github.com/DRidleyS/gsap_apple_webp",
    demo: "https://dridleys.github.io/gsap_apple_webp/",
    images: [
      "/gsap_apple1.png",
      "/gsap_apple2.png",
      "/gsap_apple3.png",
      "/gsap_apple4.png",
      "/gsap_apple5.png",
      "/gsap_apple6.png",
    ],
  },
  {
    title: "Virtual Internship",
    description:
      "Frontend Simplified Institute advanced virtual internship showcasing full-stack development skills and professional project delivery.",
    tech: ["TypeScript", "React", "Next.js"],
    github: "https://github.com/DRidleyS/Dorian-Advanced-Virtual-Internship",
    demo: null,
    images: ["/summaristlanding.png", "/summaristmodal.png"],
  },
  {
    title: "Marketplace Internship",
    description:
      "NFT Marketplace project completed during internship, featuring blockchain integration, wallet connectivity, and marketplace functionality.",
    tech: ["HTML", "CSS", "JavaScript", "Web3"],
    github: "https://github.com/DRidleyS/Dorian-Internship",
    demo: null,
    images: ["/nftinternship.png", "/internshiptopsellers.png"],
  },
  {
    title: "TikTok Clone",
    description:
      "React Native development in Android Studio with the Android emulator. Imitating TikTok's viral UX with swipeable video feed and interactive features.",
    tech: ["React Native", "TypeScript", "Android Studio", "Expo"],
    github: "https://github.com/DRidleyS/TikTokClone",
    demo: null,
    images: ["/tiktokclonehomepage.png", "/tiktokclonecamera.png"],
  },
  {
    title: "NextMovieSearch",
    description:
      "Search and explore movies with a Netflix-esque layout through the OMDB database API! Features dynamic search, detailed movie information, and responsive design.",
    tech: ["Next.js", "TypeScript", "OMDB API", "Tailwind CSS"],
    github: "https://github.com/DRidleyS/NextMovieSearch",
    demo: "https://next-movie-search-chi.vercel.app/",
    images: ["/moviesearch1.png", "/moviesearch2.png", "/moviesearch3.png"],
  },
  {
    title: "Portfolio Website",
    description:
      "Next.js portfolio website with S2000-inspired transitions, GSAP animations, and a mechanical UI theme. Features carbon fiber aesthetics and performance-driven design.",
    tech: ["Next.js", "TypeScript", "GSAP", "Tailwind CSS"],
    github: "https://github.com/DRidleyS/Portfolio",
    demo: null,
    images: ["/portfolio.png", "/portfolioabout.png"],
  },
  {
    title: "CheckMyPass",
    description:
      "Password checker project similar to haveibeenpwned.com, using hashing to get all passwords that match the first five chars of your hashed password so that your machine can locally evaluate security.",
    tech: ["Python", "Hashing API", "Security"],
    github: "https://github.com/DRidleyS/CheckmyPass",
    demo: null,
    images: ["/checkmypass.png"],
  },
];
