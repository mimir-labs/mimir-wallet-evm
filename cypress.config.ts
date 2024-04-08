import { defineConfig } from 'cypress'

export default defineConfig({
  fileServerFolder: 'dist',
  fixturesFolder: false,
  projectId: '4xjmem',
  e2e: {
    baseUrl: 'http://localhost:4173/',
    specPattern: 'cypress/e2e/**/*.ts'
  }
})
