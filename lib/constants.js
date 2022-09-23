import { readFileSync } from 'fs'

// Workaround for ESLint not being able to parse "assert { type: 'json' }" when importing modules
const pjsonUrl = new URL('../package.json', import.meta.url)
const { name } = JSON.parse(readFileSync(pjsonUrl))

export const DOCUMENT_STORE_CHECK_KEY = 'initialize'
export const PACKAGE_NAME = name
