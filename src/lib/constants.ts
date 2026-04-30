// Site configuration constants
export const SITE_CONFIG = {
  name: 'AI HORRORS',
  description: 'Real AI disasters, production failures, and cautionary tales',
  url: 'https://aihorrors.dev',

  // Social & Repository
  github: {
    url: 'https://github.com/anishsrinivasan/aihorrors.dev',
    owner: 'anishsrinivasan',
    repo: 'aihorrors.dev',
  },

  social: {
    twitter: 'https://x.com/iamanish',
    twitterHandle: '@iamanish',
    github: 'https://github.com/anishsrinivasan',
  },

  // URLs
  contributeUrl: '/contribute',
  storiesPath: 'content/blogs/',
} as const

// Convenience exports
export const SITE_URL = SITE_CONFIG.url
export const GITHUB_URL = SITE_CONFIG.github.url
export const GITHUB_REPO = `${SITE_CONFIG.github.owner}/${SITE_CONFIG.github.repo}`
export const TWITTER_URL = SITE_CONFIG.social.twitter
export const TWITTER_HANDLE = SITE_CONFIG.social.twitterHandle
export const GITHUB_PROFILE = SITE_CONFIG.social.github
