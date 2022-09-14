import Fastify from 'fastify'

import plugin from '../index.js'
import { port, url, databaseName, categories, people } from './constants.js'

export class Category {
  constructor(name, description) {
    this.Name = name
    this.Description = description
  }
}

export class Person {
  constructor(name) {
    this.Name = name
  }
}

const start = async () => {
  const fastify = Fastify({ logger: true })
  await fastify.register(plugin, { name: 'local', url, databaseName })
  await fastify.register(plugin, {
    name: 'remote',
    url: 'http://live-test.ravendb.net/',
    databaseName
  })

  fastify.post(`/${categories}`, async (req, reply) => {
    const category = new Category(req.body.name, req.body.description)

    const session = fastify.rvn.remote.openSession()
    await session.store(category)
    await session.saveChanges()

    reply.send(category)
  })

  fastify.get(`/${categories}/:id`, async (req, reply) => {
    const session = fastify.rvn.remote.openSession()
    const category = await session.load(
      `${categories}/${req.params.id}`,
      Category
    )

    reply.send(category)
  })

  fastify.post(`/${people}`, async (req, reply) => {
    const person = new Person(req.body.name)

    const session = fastify.rvn.local.openSession()
    await session.store(person)
    await session.saveChanges()

    reply.send(person)
  })

  fastify.get(`/${people}/:id`, async (req, reply) => {
    const session = fastify.rvn.local.openSession()
    const person = await session.load(`${people}/${req.params.id}`, Person)

    reply.send(person)
  })

  await fastify.listen({ port })
}

start()
