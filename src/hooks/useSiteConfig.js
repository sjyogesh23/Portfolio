import { useDocument } from './useFirestore'

const DEFAULTS = {
  sectionOrder: [
    'hero','about','skills','projects','experience',
    'seminars','hackathons','publications','certifications','contact',
  ],
  theme: {
    primary: '124 58 237',
    accent:  '6 182 212',
  },
  fontFamily: 'Inter',
  visibility: {},
}

export default function useSiteConfig() {
  const { data, loading } = useDocument('config', 'site')

  // Apply theme overrides from Firestore to CSS variables
  if (data?.theme) {
    const root = document.documentElement
    if (data.theme.primary) root.style.setProperty('--color-primary', data.theme.primary)
    if (data.theme.accent)  root.style.setProperty('--color-accent',  data.theme.accent)
  }

  return {
    config: data ?? DEFAULTS,
    loading,
  }
}
