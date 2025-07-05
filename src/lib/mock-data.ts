
export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
}

export interface Hackathon {
    id: number;
    title: string;
    dates: string;
    description: string;
    imageUrl: string;
}

export interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    tags: string[];
}

export const events: Event[] = [
    {
      id: 1,
      title: "Coastal Cleanup Drive",
      date: "Jul 15, 2025",
      location: "Panambur Beach",
      imageUrl: "https://placehold.co/400x250.png",
    },
    {
      id: 2,
      title: "Tech for Good Workshop",
      date: "Jul 22, 2025",
      location: "Sahyadri College",
      imageUrl: "https://placehold.co/400x250.png",
    },
    {
      id: 3,
      title: "Animal Shelter Volunteering",
      date: "Aug 1, 2025",
      location: "Bejai, Mangalore",
      imageUrl: "https://placehold.co/400x250.png",
    },
    {
        id: 4,
        title: "Plantation Drive",
        date: "Aug 10, 2025",
        location: "Kadri Park",
        imageUrl: "https://placehold.co/400x250.png",
    },
];

export const hackathons: Hackathon[] = [
    {
        id: 1,
        title: "Innovate for Mangalore",
        dates: "Dec 1-3, 2025",
        description: "A 3-day hackathon to build solutions for local civic issues.",
        imageUrl: "https://placehold.co/400x225.png"
    },
    {
        id: 2,
        title: "GreenTech Challenge",
        dates: "Jan 10-12, 2026",
        description: "Focus on sustainability and build projects for a greener future.",
        imageUrl: "https://placehold.co/400x225.png"
    }
];

export const projects: Project[] = [
    {
        id: 1,
        title: "CommunityConnect App",
        description: "An open-source platform to connect local communities. This very app!",
        imageUrl: "https://placehold.co/400x225.png",
        tags: ["Next.js", "React", "Firebase", "TypeScript"]
    },
    {
        id: 2,
        title: "Waste Management Dashboard",
        description: "A data visualization tool to track and analyze city waste management data.",
        imageUrl: "https://placehold.co/400x225.png",
        tags: ["Python", "Flask", "React", "D3.js"]
    }
];

export const userBadges = [
    {
        id: 1,
        name: "First Contribution",
        icon: "Sprout",
        description: "Made your first contribution."
    },
    {
        id: 2,
        name: "Community Helper",
        icon: "HeartHandshake",
        description: "Volunteered for 10+ hours."
    },
     {
        id: 3,
        name: "Code Committer",
        icon: "Code",
        description: "Contributed to an open-source project."
    }
];
