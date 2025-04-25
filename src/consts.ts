import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Astro Sphere",
  DESCRIPTION: "Welcome to Astro Sphere, a portfolio and blog for designers and developers.",
  AUTHOR: "Mark Horn",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "Work",
    HREF: "/work",
  },
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },
]

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "hedighodhbane08@gmail.com",
    HREF: "mailto:hedighodhbane08@gmail.com",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "hedi-gh",
    HREF: "https://github.com/hedi-ghodhbane"
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "hedi-gh",
    HREF: "https://www.linkedin.com/in/hedi-gh/",
  },
  {
    NAME: "Upwork",
    ICON: "upwork",
    TEXT: "hedi-gh",
    HREF: "https://www.upwork.com/freelancers/~01f5b1089b299442d7",
  },
  // {
  //   NAME: "Twitter",
  //   ICON: "twitter-x",
  //   TEXT: "markhorn_dev",
  //   HREF: "https://twitter.com/markhorn_dev",
  // },
]

