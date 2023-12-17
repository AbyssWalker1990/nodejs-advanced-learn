const Page = require('./helpers/Page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('localhost:3000')
})

afterEach(async () => {
    await page.close()
})

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login()
        await page.click('.btn-floating')
    })

    test('can see blog create form', async () => {
        const label = await page.getContent('form label')

        expect(label).toEqual('Blog Title')
    })

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })

        test('the form shows error message', async () => {
            const titleErr = await page.getContent('.title .red-text')
            const contentErr = await page.getContent('.content .red-text')

            expect(titleErr).toEqual('You must provide a value')
            expect(contentErr).toEqual('You must provide a value')
        })
    })

    describe('When using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title')
            await page.type('.content input', 'My Content')
            await page.click('form button')
        })

        test('Submitting takes user to review screen', async () => {
            const confirm = await page.getContent('h5')

            expect(confirm).toEqual('Please confirm your entries')
        })

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green')
            await page.waitFor('.card')

            const title = await page.getContent('.card-title')
            const content = await page.getContent('p')

            expect(title).toEqual('My Title')
            expect(content).toEqual('My Content')
        })
    })
})

describe('When user is not logged in', async () => {
    test('user can not create blog post', async () => {
        const result = await page.evaluate(
            async () => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: 'My Title', content: 'My Content' })
                }).then(res => res.json())
            }
        )

        expect(result).toEqual({ error: 'You must log in!' })
    })

    test('Can not retrieve blogs', async () => {
        const result = await page.evaluate(
            async () => {
                return fetch('/api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(res => res.json())
            }
        )

        expect(result).toEqual({ error: 'You must log in!' })
    })
})
