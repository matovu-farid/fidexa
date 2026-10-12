// Public facts already disclosed in the company profile and contact section.
// Keep operational, billing, and outreach data out of this module.
export const site = {
  name: "Fidexa",
  url: "https://www.fidexa.org",
  email: "hello@fidexa.org",
  location: "Kampala, Uganda",
  timezone: "GMT+3",
  profile: "Fidexa is an independent software studio based in Kampala, Uganda and working remotely in GMT+3. It builds and supports products for clients and through its own innovation lab.",
  founder: {
    name: "Farid Matovu",
    role: "Founder & Product Engineer",
    url: "https://matovu-farid.com",
    linkedIn: "https://www.linkedin.com/in/matovu-farid/",
  },
  pages: [
    {
      path: "/",
      title: "Fidexa | Custom Software, Web & Native App Development",
      description: "Fidexa is an independent software studio in Kampala, Uganda, building web applications, native Apple apps, and business systems for clients working remotely.",
    },
    {
      path: "/projects",
      title: "Software Projects & Client Systems | Fidexa",
      description: "Explore 11 Fidexa projects: Rishi Reader, Kaks Credit lending software, inventory and trade systems, AI automation, and developer tools.",
    },
    {
      path: "/sms",
      title: "SMS Customer Care & Opt-In Information | Fidexa",
      description: "Fidexa customer-care SMS information: how to opt in, get help, stop messages, and find support, privacy, and terms. No marketing messages.",
    },
  ],
} as const;
