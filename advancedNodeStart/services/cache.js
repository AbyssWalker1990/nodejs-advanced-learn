const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
})
client.get = util.promisify(client.get)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function () {
    this.useCache = true
    return this
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const assignedHashKey = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name })

    const cache = await client.get(JSON.stringify(assignedHashKey))

    if (cache) {
        const doc = JSON.parse(cache)

        return Array.isArray(doc)
            ? doc.map(el => new this.model(el))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments)

    client.set(assignedHashKey, JSON.stringify(result))

    return result
}
