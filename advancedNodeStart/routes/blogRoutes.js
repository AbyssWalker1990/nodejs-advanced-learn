const mongoose = require('mongoose')
const requireLogin = require('../middlewares/requireLogin')
const util = require('util')

const Blog = mongoose.model('Blog')

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    })

    res.send(blog)
  })

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const redis = require('redis')
    const client = redis.createClient({
      host: 'localhost',
      port: 6379
    })

    client.get = util.promisify(client.get)
    console.log('Serving from cache')
    const cachedBlogs = await client.get(req.user.id)
    console.log('cachedBlocks: ', cachedBlogs)

    const blogs = await Blog.find({ _user: req.user.id })
    console.log('Serving from MongoDB')
    res.send(blogs)
    await client.set(req.user.id, JSON.stringify(blogs))

  })

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    })

    try {
      await blog.save()
      res.send(blog)
    } catch (err) {
      res.send(400, err)
    }
  })
}




// const redis = require('redis')
// const client = redis.createClient({
//   host: 'localhost',
//   port: 6379
// })

// client.on('connect', function () {
//   console.log('Connected to Redis')
// })

// client.on('error', function (err) {
//   console.log('Redis error: ', err)
// })
