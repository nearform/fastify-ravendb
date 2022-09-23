import { readFileSync } from 'fs'

// Workaround for ESLint not being able to parse "assert { type: 'json' }" when importing modules
const pjsonUrl = new URL('../../package.json', import.meta.url)
const pjson = JSON.parse(readFileSync(pjsonUrl))

export const port = 3000

export const url = `http://localhost:${pjson.config.docker.port}`
export const databaseName = 'test'

export const categories = 'categories'
export const people = 'people'
