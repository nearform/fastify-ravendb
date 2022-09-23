import Fastify from 'fastify'

import plugin from '../index.js'
import { Category, Person } from './lib/classes.js'
import { port, url, databaseName, categories, people } from './lib/constants.js'

const routeOptions = { rvn: { autoSession: ['local', 'remote'] } }

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, { name: 'local', url, databaseName })
  await fastify.register(plugin, {
    name: 'remote',
    url: 'http://live-test.ravendb.net/',
    databaseName
  })

  fastify.post(`/${categories}`, routeOptions, async (req, reply) => {
    const category = new Category(req.body.name, req.body.description)

    await req.rvn.remote.store(category)

    reply.send(category)
  })

  fastify.get(`/${categories}/:id`, routeOptions, async (req, reply) => {
    const category = await req.rvn.remote.load(
      `${categories}/${req.params.id}`,
      Category
    )

    reply.send(category)
  })

  fastify.post(`/${people}`, routeOptions, async (req, reply) => {
    const person = new Person(req.body.name)

    await req.rvn.local.store(person)

    reply.send(person)
  })

  fastify.get(`/${people}/:id`, routeOptions, async (req, reply) => {
    const person = await req.rvn.local.load(
      `${people}/${req.params.id}`,
      Person
    )

    reply.send(person)
  })

  await fastify.listen({ port })
}

start()
