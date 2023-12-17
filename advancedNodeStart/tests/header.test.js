const Page = require('./helpers/Page')
let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('localhost:3000')
})

afterEach(async () => {
    await page.close()
})

test('The header has the correct name', async () => {

    const text = await page.getContent('a.brand-logo')
    expect(text).toEqual('Blogster')
})

test('Log in button leads to gogle OAuth', async () => {
    const click = await page.click('.right a')

    await expect(page.url()).toMatch(/accounts\.google\.com/)
})

test('When sign in, shows logout button', async () => {
    await page.login()
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

    expect(text).toEqual('Logout')
})
