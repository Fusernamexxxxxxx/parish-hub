// ─────────────────────────────────────────────────────────────
//  Parish Hub — edit this file to make the app your own church's.
//  No coding needed: change the text between the quotes and save.
// ─────────────────────────────────────────────────────────────

window.PARISH = {
  name: "St. Mary's Parish",
  tagline: "A home for everyone, every week.",
  address: "Church Square, Your Town",
  mapQuery: "Church Square, Your Town",          // used for the "Directions" link
  phone: "+356 0000 0000",
  email: "office@stmarys-parish.org",
  officeHours: "Mon–Fri · 09:00–12:00",

  // day: 0 = Sunday, 1 = Monday … 6 = Saturday   time: 24-hour "HH:MM"
  services: [
    { day: 0, time: "08:00", title: "Morning Mass", note: "Quiet, said Mass" },
    { day: 0, time: "10:30", title: "Family Mass", note: "Children's liturgy & choir" },
    { day: 0, time: "18:00", title: "Evening Mass", note: "Youth music group" },
    { day: 3, time: "19:00", title: "Midweek Mass", note: "Followed by adoration" },
    { day: 6, time: "17:00", title: "Vigil Mass", note: "Confessions from 16:15" }
  ],

  // date: "YYYY-MM-DD"
  events: [
    { date: "2026-11-29", time: "11:45", end: "13:30", title: "Advent Wreath Workshop", place: "Parish Hall", category: "Family",
      text: "Bring greenery from your garden — we provide the rings, candles and coffee." },
    { date: "2026-12-06", time: "16:00", end: "18:00", title: "Food Bank Packing Day", place: "Parish Hall", category: "Outreach",
      text: "Help us pack 200 Christmas hampers for families in our town. All ages welcome." },
    { date: "2026-12-13", time: "19:30", end: "21:00", title: "Carols by Candlelight", place: "Main Church", category: "Music",
      text: "Our choir, the youth band and mulled wine on the square afterwards." },
    { date: "2026-12-20", time: "10:00", end: "12:00", title: "Visit to the Elderly Home", place: "Meet at the church door", category: "Outreach",
      text: "Sing a few carols and share some time with residents who have no visitors." },
    { date: "2027-01-10", time: "15:00", end: "17:00", title: "New Year Community Tea", place: "Parish Hall", category: "Community",
      text: "Cake, tea and a chance to meet new families in the parish." }
  ],

  announcements: [
    { title: "Christmas schedule is out", text: "Midnight Mass begins at 23:30 with carols. Christmas Day Masses at 08:00, 10:30 and 18:00." },
    { title: "Choir needs tenors", text: "Rehearsals are Thursdays at 19:30. No experience needed — just a willingness to sing." },
    { title: "Hall available to book", text: "Families can book the parish hall for baptisms and birthdays. Ask at the office." }
  ],

  volunteerRoles: [
    { id: "readers",  title: "Readers",       text: "Proclaim the readings at Mass." },
    { id: "welcome",  title: "Welcome team",  text: "Greet people at the door, help newcomers." },
    { id: "music",    title: "Choir & music", text: "Sing or play with the choir or youth band." },
    { id: "food",     title: "Food bank",     text: "Sort donations and pack hampers monthly." },
    { id: "visits",   title: "Home visits",   text: "Visit the elderly and housebound." },
    { id: "kids",     title: "Children's liturgy", text: "Lead short sessions for under-10s." }
  ]
};
