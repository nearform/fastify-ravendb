import { DocumentStore } from 'ravendb'
import fp from 'fastify-plugin'

import { PACKAGE_NAME } from './lib/constants.js'
import {
  addDocumentStore,
  addHandler,
  addRequestSession,
  autoSessionTargetsGlobalInstance,
  autoSessionTargetsNamedInstance,
  getRequestSession
} from './lib/helpers.js'

const fastifyRaven = async (fastify, options) => {
  const {
    name,
    url,
    databaseName,
    authOptions,
    findCollectionNameForObjectLiteral
  } = options

  const documentStore = new DocumentStore(url, databaseName, authOptions)

  addDocumentStore(fastify, documentStore, name)

  if (findCollectionNameForObjectLiteral instanceof Function) {
    Object.assign(documentStore.conventions, {
      findCollectionNameForObjectLiteral
    })
  }

  documentStore.initialize()

  fastify.addHook('onClose', () => {
    documentStore.dispose()
  })

  fastify.addHook('onRoute', routeOptions => {
    const autoSession = routeOptions?.rvn?.autoSession

    if (
      !autoSession ||
      !(
        autoSessionTargetsGlobalInstance(autoSession, name) ||
        autoSessionTargetsNamedInstance(autoSession, name)
      )
    ) {
      return
    }

    if (!fastify.hasRequestDecorator('rvn')) {
      fastify.decorateRequest('rvn', null)
    }

    const preHandler = async req => {
      const session = documentStore.openSession()

      addRequestSession(req, session, name)
    }

    const onResponse = async req => {
      const session = getRequestSession(req, name)

      if (Object.keys(session.advanced.whatChanged()).length) {
        await session.saveChanges()
      }
    }

    routeOptions.preHandler = addHandler(routeOptions.preHandler, preHandler)
    routeOptions.onResponse = addHandler(routeOptions.onResponse, onResponse)
  })
}

export default fp(fastifyRaven, {
  fastify: '4.x',
  name: PACKAGE_NAME
})
