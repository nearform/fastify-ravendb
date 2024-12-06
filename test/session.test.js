import Fastify from 'fastify'
import { test } from 'node:test'
import { DocumentSession } from 'ravendb'
import sinon from 'sinon'

import plugin from '../index.js'
import { databaseName, url } from './constants.js'

class Person {
  constructor(name) {
    this.Name = name
  }
}

test('Should not create any session if not enabled for route', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.get('/', async req => {
    t.assert.ok(!req.rvn)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create a session with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.get('/', { rvn: { autoSession: true } }, async req => {
    t.assert.ok(req.rvn instanceof DocumentSession)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create a session with name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  fastify.get('/', { rvn: { autoSession: 'extra' } }, async req => {
    t.assert.ok(req.rvn.extra instanceof DocumentSession)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create sessions for multiple names', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'db1' })
  await fastify.register(plugin, { url, databaseName, name: 'db2' })

  fastify.get('/', { rvn: { autoSession: ['db1', 'db2'] } }, async req => {
    t.assert.ok(req.rvn.db1 instanceof DocumentSession)
    t.assert.ok(req.rvn.db2 instanceof DocumentSession)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should return 500 when creating a session with a reserved name', async t => {
  const name = 'maxNumberOfRequestsPerSession'

  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name })

  fastify.get(`/`, { rvn: { autoSession: name } }, async () => {})

  const res = await fastify.inject({ method: 'GET', url: '/' })

  t.assert.equal(res.statusCode, 500)
  t.assert.match(res.json().message, /is a session reserved keyword/)

  await fastify.close()
})

test('Should save changes after request', async () => {
  let saveChangesSpy = null

  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.post(`/`, { rvn: { autoSession: true } }, async (req, reply) => {
    saveChangesSpy = sinon.spy(req.rvn, 'saveChanges')

    const person = new Person(req.body.name)

    await req.rvn.store(person)

    reply.send(person)
  })

  await fastify.inject({
    method: 'POST',
    url: '/',
    payload: { name: 'John Doe' }
  })

  sinon.assert.calledOnce(saveChangesSpy)

  await fastify.close()
})

test('Should create a session respecting existing handlers', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.get(
    '/',
    { rvn: { autoSession: true }, preHandler: async () => {} },
    async req => {
      t.assert.ok(Array.isArray(req.context.preHandler))
      t.assert.equal(req.context.preHandler.length, 2)
    }
  )

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})
