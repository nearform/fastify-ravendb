import Fastify from 'fastify'

import plugin from '../index.js'
import { Person } from './lib/classes.js'
import { port, url, databaseName, people } from './lib/constants.js'

const routeOptions = { rvn: { autoSession: true } }

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, { url, databaseName })

  fastify.post(`/${people}`, routeOptions, async (req, reply) => {
    const person = new Person(req.body.name)

    await req.rvn.store(person)

    reply.send(person)
  })

  fastify.get(`/${people}/:id`, routeOptions, async (req, reply) => {
    const person = await req.rvn.load(`${people}/${req.params.id}`, Person)

    reply.send(person)
  })

  await fastify.listen({ port })
}

start()
