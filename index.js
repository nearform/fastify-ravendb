import { readFileSync } from 'fs'
import { DocumentStore } from 'ravendb'
import fp from 'fastify-plugin'

// Workaround for ESLint not being able to parse "assert { type: 'json' }" when importing modules
const pjsonUrl = new URL('./package.json', import.meta.url)
const { name: packageName } = JSON.parse(readFileSync(pjsonUrl))

const fastifyRaven = async (fastify, options) => {
  const {
    name,
    url,
    databaseName,
    authOptions,
    findCollectionNameForObjectLiteral
  } = options

  const documentStore = new DocumentStore(url, databaseName, authOptions)

  if (name) {
    if (documentStore[name]) {
      throw new Error(`${packageName} '${name}' is a reserved keyword`)
    } else if (!fastify.rvn) {
      fastify.decorate('rvn', Object.create(null))
    } else if (fastify.rvn[name]) {
      throw new Error(
        `${packageName} '${name}' instance name has already been registered`
      )
    }

    Object.assign(fastify.rvn, { [name]: documentStore })
  } else {
    if (fastify.rvn) {
      if (fastify.rvn.initialize) {
        throw new Error(`${packageName} has already been registered`)
      }

      Object.assign(fastify.rvn, documentStore)
    } else {
      fastify.decorate('rvn', documentStore)
    }
  }

  if (findCollectionNameForObjectLiteral instanceof Function) {
    Object.assign(documentStore.conventions, {
      findCollectionNameForObjectLiteral
    })
  }

  documentStore.initialize()

  fastify.addHook('onClose', () => {
    documentStore.dispose()
  })
}

export default fp(fastifyRaven, {
  fastify: '4.x',
  name: packageName
})
