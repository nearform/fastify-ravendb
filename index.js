import { DocumentStore } from 'ravendb'
import fp from 'fastify-plugin'

async function fastifyRaven(fastify, options) {
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
      throw new Error(`fastify-ravendb '${name}' is a reserved keyword`)
    } else if (!fastify.rvn) {
      fastify.decorate('rvn', Object.create(null))
    } else if (fastify.rvn[name]) {
      throw new Error(
        `fastify-ravendb '${name}' instance name has already been registered`
      )
    }

    Object.assign(fastify.rvn, { [name]: documentStore })
  } else {
    if (fastify.rvn) {
      if (fastify.rvn.initialize) {
        throw new Error('fastify-ravendb has already been registered')
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
}

export default fp(fastifyRaven, {
  fastify: '4.x',
  name: 'fastify-ravendb'
})
