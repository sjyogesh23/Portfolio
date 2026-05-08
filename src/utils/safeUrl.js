// Rewrites known HTTP image hosts through our Vercel proxy so they load on HTTPS.
const PROXY_RULES = [
  { from: 'http://cooltex.co.in/', to: '/cooltex/' },
]

export function safeUrl(url) {
  if (!url) return url
  for (const { from, to } of PROXY_RULES) {
    if (url.startsWith(from)) return to + url.slice(from.length)
  }
  return url
}
