import Fastify from 'fastify'

import plugin from '../index.js'
import { port, url, databaseName, people } from './constants.js'

const start = async () => {
  const findCollectionNameForObjectLiteral = e => e._collection

  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, {
    url,
    databaseName,
    findCollectionNameForObjectLiteral
  })

  fastify.post(`/${people}`, async (req, reply) => {
    const person = {
      Name: req.body.name,
      _collection: people
    }

    const session = fastify.rvn.openSession()
    await session.store(person)
    await session.saveChanges()

    reply.send(person)
  })

  fastify.get(`/${people}/:id`, async (req, reply) => {
    const session = fastify.rvn.openSession()
    const person = await session.load(`${people}/${req.params.id}`)

    reply.send(person)
  })

  await fastify.listen({ port })
}

start()
