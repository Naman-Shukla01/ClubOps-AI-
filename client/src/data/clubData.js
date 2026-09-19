export const clubData = {
  tech: {
    id: "tech",
    name: "Tech Club",
    shortName: "TC",
    description: "Technology, coding and innovation community",
    role: "leader",

    stats: {
      events: 4,
      tasks: 12,
      members: 38,
      announcements: 5,
    },

    events: [
      {
        id: 1,
        title: "AI Workshop",
        date: "24 Sep 2026",
        time: "10:00 AM",
        venue: "Seminar Hall",
        status: "Upcoming",
      },
      {
        id: 2,
        title: "Hackathon 2026",
        date: "28 Sep 2026",
        time: "9:00 AM",
        venue: "Innovation Lab",
        status: "Upcoming",
      },
      {
        id: 3,
        title: "Git & GitHub Session",
        date: "30 Sep 2026",
        time: "2:00 PM",
        venue: "Lab 3",
        status: "Upcoming",
      },
    ],

    tasks: [
      {
        id: 1,
        title: "Prepare event registration form",
        assignedTo: "Diya",
        deadline: "22 Sep",
        status: "Completed",
      },
      {
        id: 2,
        title: "Design workshop poster",
        assignedTo: "Riya",
        deadline: "23 Sep",
        status: "In Progress",
      },
      {
        id: 3,
        title: "Arrange seminar hall",
        assignedTo: "Jay",
        deadline: "23 Sep",
        status: "Pending",
      },
      {
        id: 4,
        title: "Prepare presentation",
        assignedTo: "Aarav",
        deadline: "24 Sep",
        status: "Pending",
      },
    ],

    announcements: [
      {
        id: 1,
        title: "AI Workshop Registration Open",
        message:
          "Registration for the upcoming AI workshop is now open for all club members.",
        date: "Today",
      },
      {
        id: 2,
        title: "Team Meeting",
        message:
          "Core team meeting will be held tomorrow at 5:00 PM in Lab 3.",
        date: "Yesterday",
      },
    ],

    members: [
      { id: 1, name: "Diya Suthar", role: "Leader", initials: "DS" },
      { id: 2, name: "Riya Patel", role: "Coordinator", initials: "RP" },
      { id: 3, name: "Jay Shah", role: "Volunteer", initials: "JS" },
      { id: 4, name: "Aarav Mehta", role: "Volunteer", initials: "AM" },
      { id: 5, name: "Krisha Patel", role: "Volunteer", initials: "KP" },
    ],
  },

  robotics: {
    id: "robotics",
    name: "Robotics Club",
    shortName: "RC",
    description: "Robotics, electronics and automation community",
    role: "coordinator",

    stats: {
      events: 3,
      tasks: 8,
      members: 26,
      announcements: 3,
    },

    events: [
      {
        id: 1,
        title: "Robotics Bootcamp",
        date: "25 Sep 2026",
        time: "11:00 AM",
        venue: "Robotics Lab",
        status: "Upcoming",
      },
      {
        id: 2,
        title: "Arduino Workshop",
        date: "29 Sep 2026",
        time: "2:00 PM",
        venue: "Electronics Lab",
        status: "Upcoming",
      },
    ],

    tasks: [
      {
        id: 1,
        title: "Prepare Arduino kits",
        assignedTo: "Rohan",
        deadline: "24 Sep",
        status: "Completed",
      },
      {
        id: 2,
        title: "Test robot prototype",
        assignedTo: "Neel",
        deadline: "25 Sep",
        status: "In Progress",
      },
      {
        id: 3,
        title: "Prepare workshop slides",
        assignedTo: "Meera",
        deadline: "27 Sep",
        status: "Pending",
      },
    ],

    announcements: [
      {
        id: 1,
        title: "Bootcamp Volunteers Required",
        message:
          "Volunteers are required for registration and workshop assistance.",
        date: "Today",
      },
      {
        id: 2,
        title: "Prototype Testing",
        message: "Prototype testing will take place this Friday.",
        date: "2 days ago",
      },
    ],

    members: [
      { id: 1, name: "Rohan Patel", role: "Leader", initials: "RP" },
      { id: 2, name: "Neel Shah", role: "Coordinator", initials: "NS" },
      { id: 3, name: "Meera Joshi", role: "Volunteer", initials: "MJ" },
    ],
  },

  cultural: {
    id: "cultural",
    name: "Cultural Club",
    shortName: "CC",
    description: "Events, performances and cultural activities",
    role: "volunteer",

    stats: {
      events: 5,
      tasks: 10,
      members: 45,
      announcements: 7,
    },

    events: [
      {
        id: 1,
        title: "Garba Night",
        date: "27 Sep 2026",
        time: "6:00 PM",
        venue: "College Ground",
        status: "Upcoming",
      },
      {
        id: 2,
        title: "Cultural Fest",
        date: "5 Oct 2026",
        time: "10:00 AM",
        venue: "Main Auditorium",
        status: "Upcoming",
      },
    ],

    tasks: [
      {
        id: 1,
        title: "Decorate main stage",
        assignedTo: "Diya",
        deadline: "26 Sep",
        status: "In Progress",
      },
      {
        id: 2,
        title: "Prepare music playlist",
        assignedTo: "Kavya",
        deadline: "25 Sep",
        status: "Completed",
      },
      {
        id: 3,
        title: "Arrange chairs",
        assignedTo: "Rahul",
        deadline: "27 Sep",
        status: "Pending",
      },
    ],

    announcements: [
      {
        id: 1,
        title: "Garba Night Practice",
        message: "Practice sessions will start from tomorrow evening.",
        date: "Today",
      },
    ],

    members: [
      { id: 1, name: "Kavya Shah", role: "Leader", initials: "KS" },
      { id: 2, name: "Rahul Patel", role: "Coordinator", initials: "RP" },
      { id: 3, name: "Diya Suthar", role: "Volunteer", initials: "DS" },
    ],
  },
};

/*
 * ClubsView expects an array.
 * Keep clubData as an object for individual club management,
 * and expose mockClubs as an array for the Clubs page.
 */

export const mockClubs = Object.values(clubData).map((club) => ({
  id: club.id,
  name: club.name,
  shortName: club.shortName,
  description: club.description,
  role: club.role,

  members: club.stats.members,
  maxMembers: 50,
  events: club.stats.events,

  icon:
    club.id === "tech"
      ? "💻"
      : club.id === "robotics"
        ? "🤖"
        : "🎭",

  color:
    club.id === "tech"
      ? "#7c5cfc"
      : club.id === "robotics"
        ? "#3b82f6"
        : "#ec4899",

  skills:
    club.id === "tech"
      ? ["Coding", "AI/ML", "Web Development"]
      : club.id === "robotics"
        ? ["Robotics", "Arduino", "Electronics"]
        : ["Dance", "Music", "Events"],

  head: club.members.find((member) => member.role === "Leader")
    ? {
      name: club.members.find((member) => member.role === "Leader").name,
    }
    : null,

  eventsList: club.events,
  tasks: club.tasks,
  announcements: club.announcements,
  clubMembers: club.members,

  stats: club.stats,
}));