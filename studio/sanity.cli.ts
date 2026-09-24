import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'wg30antz',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Studio ist nach `npm run deploy` unter https://evisuniversum.sanity.studio erreichbar
  studioHost: 'evisuniversum',
})
