import fastify from 'fastify'

import plugin from '../../index'

class Category {
  name: string
  description: string

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }
}

class Person {
  name: string

  constructor(name: string) {
    this.name = name
  }
}

const app = fastify()

app.register(plugin, { url: 'http://localhost', databaseName: 'test' })
app.register(plugin, { url: 'http://localhost', databaseName: 'test', name: 'categories' })
app.register(plugin, { url: 'http://localhost', databaseName: 'test', name: 'people' })

app.post('/global', { rvn: { autoSession: true } }, async (req, reply) => {
  const test = { name: 'test' }

  await req.rvn?.store(test)

  reply.send(test)
})

app.post('/people', { rvn: { autoSession: 'people' } }, async (req, reply) => {
  const person = new Person('Jane Doe')

  await req.rvn?.people?.store(person)

  reply.send(person)
})

app.post('/categories', { rvn: { autoSession: ['categories', 'people'] } }, async (req, reply) => {
  const category = new Category('Books', 'Novels, biographies, dictionaries, manuals...')

  await req.rvn?.categories?.store(category)

  reply.send(category)
})
