import { env } from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubActions = env.GITHUB_ACTIONS === 'true'
const githubRepository = env.GITHUB_REPOSITORY
const repositoryName = githubRepository?.split('/')[1]

if (isGitHubActions && !repositoryName) {
  throw new Error('GITHUB_REPOSITORY must be set to build for GitHub Pages.')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubActions ? `/${repositoryName}/` : '/',
})
