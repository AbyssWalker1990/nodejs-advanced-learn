const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
})
client.get = util.promisify(client.get)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = function () {
    // console.log('Monkey Patching')
    // console.log(this.getQuery())
    // console.log(this.mongooseCollection.name)
    const query = structuredClone(this.getQuery())
    const collection = this.mongooseCollection.name
    const hashKey = JSON.stringify({ ...query, collection })
    console.log(hashKey)
    return exec.apply(this, arguments)
}
