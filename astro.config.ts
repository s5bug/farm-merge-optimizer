import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

const env = process.env
let basePath: string
if (env.GITHUB_ACTIONS === 'true' && env.GITHUB_REPOSITORY) {
  basePath = `/${env.GITHUB_REPOSITORY.split('/')[1]}`
} else {
  basePath = '/'
}

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  base: basePath,
})
