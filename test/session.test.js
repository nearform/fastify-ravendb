import sinon from 'sinon'
import { test } from 'tap'
import { DocumentSession } from 'ravendb'
import Fastify from 'fastify'

import plugin from '../index.js'
import { url, databaseName } from './constants.js'

class Person {
  constructor(name) {
    this.Name = name
  }
}

test('Should not create any session if not enabled for route', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.get('/', async req => {
    t.notHas(req, 'rvn')
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create a session with no name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName })

  fastify.get('/', { rvn: { autoSession: true } }, async req => {
    t.hasProp(req, 'rvn')
    t.ok(req.rvn instanceof DocumentSession)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create a session with name', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'extra' })

  fastify.get('/', { rvn: { autoSession: 'extra' } }, async req => {
    t.hasProp(req, 'rvn')
    t.hasProp(req.rvn, 'extra')
    t.ok(req.rvn.extra instanceof DocumentSession)
  })

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})

test('Should create sessions for multiple names', async t => {
  const fastify = Fastify()

  await fastify.register(plugin, { url, databaseName, name: 'db1' })
  await fastify.register(plugin, { url, databaseName, name: 'db2' })

  fastify.get('/', { rvn: { autoSession: ['db1', 'db2'] } }, async req => {
    t.hasProp(req, 'rvn')
    t.hasProp(req.rvn, 'db1')
    t.ok(req.rvn.db1 instanceof DocumentSession)
    t.hasProp(req.rvn, 'db2')
    t.ok(req.rvn.db2 instanceof DocumentSession)
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

  t.equal(res.statusCode, 500)
  t.match(res.json().message, 'is a session reserved keyword')

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
      t.ok(Array.isArray(req.context.preHandler))
      t.equal(req.context.preHandler.length, 2)
    }
  )

  await fastify.inject({ method: 'GET', url: '/' })

  await fastify.close()
})
