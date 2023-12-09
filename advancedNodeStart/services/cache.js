const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
})
client.get = util.promisify(client.get)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function () {
    const assignedHashKey = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name })

    const cache = await client.get(assignedHashKey)

    if (cache) {
        const doc = JSON.parse(cache)

        return Array.isArray(doc)
            ? doc.map(el => new this.model(doc))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments)

    client.set(hashKey, JSON.stringify(result))

    return result
}
