import { DOCUMENT_STORE_CHECK_KEY, PACKAGE_NAME } from './constants.js'

export const addDocumentStore = (fastify, documentStore, name) => {
  if (name) {
    if (name in documentStore) {
      throw new Error(
        `${PACKAGE_NAME} '${name}' is an instance reserved keyword`
      )
    } else if (!fastify.rvn) {
      fastify.decorate('rvn', Object.create(null))
    } else if (name in fastify.rvn) {
      throw new Error(
        `${PACKAGE_NAME} '${name}' instance name has already been registered`
      )
    }

    Object.assign(fastify.rvn, { [name]: documentStore })
  } else {
    if (fastify.rvn) {
      if (DOCUMENT_STORE_CHECK_KEY in fastify.rvn) {
        throw new Error(`${PACKAGE_NAME} has already been registered`)
      }

      Object.assign(fastify.rvn, documentStore)
    } else {
      fastify.decorate('rvn', documentStore)
    }
  }
}

export const addHandler = (existingHandler, newHandler) => {
  if (Array.isArray(existingHandler)) {
    return existingHandler.concat(newHandler)
  } else if (typeof existingHandler === 'function') {
    return [existingHandler, newHandler]
  } else {
    return [newHandler]
  }
}

export const addRequestSession = (req, session, name) => {
  if (name) {
    if (Object.prototype.hasOwnProperty.call(session, name)) {
      throw new Error(`${PACKAGE_NAME} '${name}' is a session reserved keyword`)
    } else if (!req.rvn) {
      req.rvn = Object.create(null)
    }

    req.rvn[name] = session
  } else {
    req.rvn = session
  }
}

export const getRequestSession = (req, name) =>
  typeof name === 'string' ? req.rvn[name] : req.rvn
