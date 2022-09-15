import Fastify from 'fastify'

import plugin from '../index.js'
import { port, url, databaseName, people } from './constants.js'

export class Person {
  constructor(name) {
    this.Name = name
  }
}

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, { url, databaseName })

  fastify.post(`/${people}`, async (req, reply) => {
    const person = new Person(req.body.name)

    const session = fastify.rvn.openSession()
    await session.store(person)
    await session.saveChanges()

    reply.send(person)
  })

  fastify.get(`/${people}/:id`, async (req, reply) => {
    const session = fastify.rvn.openSession()
    const person = await session.load(`${people}/${req.params.id}`, Person)

    reply.send(person)
  })

  await fastify.listen({ port })
}

start()
