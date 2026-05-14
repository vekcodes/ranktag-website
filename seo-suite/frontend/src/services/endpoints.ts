/** Single source of truth for backend endpoint paths. */
export const endpoints = {
  health: '/health',
  healthDeep: '/health/deep',

  // Placeholders — wired in later steps.
  reports: '/reports',
  report: (id: string) => `/reports/${id}`,
  backlinks: (id: string) => `/reports/${id}/backlinks`,
  referringDomains: (id: string) => `/reports/${id}/referring-domains`,
  anchors: (id: string) => `/reports/${id}/anchors`,
  outlinks: (id: string) => `/reports/${id}/outlinks`,
  jobs: (id: string) => `/jobs/${id}`,
} as const;
