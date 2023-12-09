const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
})
client.hget = util.promisify(client.hget)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true
    this.hashKey = JSON.stringify(options.key || '')

    return this
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const assignedHashKey = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name })

    const cache = await client.hget(this.hashKey, JSON.stringify(assignedHashKey))

    if (cache) {
        const doc = JSON.parse(cache)

        return Array.isArray(doc)
            ? doc.map(el => new this.model(el))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments)

    client.hset(this.hashKey, assignedHashKey, JSON.stringify(result), 'EX', 10)

    return result
}

module.exports = {
    clearHash (hashKey) {
        client.del(JSON.stringify(hashKey))
    }
}
