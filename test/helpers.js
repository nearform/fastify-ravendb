// Workaround for ESLint not being able to parse "assert { type: 'json' }" when importing modules
import { readFileSync } from 'fs'

const pjsonUrl = new URL('../package.json', import.meta.url)
const pjson = JSON.parse(readFileSync(pjsonUrl))

export const databaseName = 'test'
export const url = `http://localhost:${pjson.config.docker.port}`
