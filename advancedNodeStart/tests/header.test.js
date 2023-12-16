const puppeteer = require('puppeteer')

let browser, page

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    })
    page = await browser.newPage()
    await page.goto('localhost:3000')
})

afterEach(async () => {
    await browser.close()
})

test('The header has the correct name', async () => {

    const text = await page.$eval('a.brand-logo', el => el.innerHTML)
    expect(text).toEqual('Blogster')
})

test('Log in button leads to gogle OAuth', async () => {
    const click = await page.click('.right a')

    await expect(page.url()).toMatch(/accounts\.google\.com/)
})

test('When sign in, shows logout button', async () => {
    const id = '656b2a7f007361290c0b2041'

    const Buffer = require('safe-buffer').Buffer
    const sessionObject = {
        passport: {
            user: id
        }
    }
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64')

    const Keygrip = require('keygrip')
    const keys = require('../config/keys')
    const keygrip = new Keygrip([keys.cookieKey])
    const sig = keygrip.sign('session=' + sessionString)

    await page.setCookie({ name: 'session', value: sessionString })
    await page.setCookie({ name: 'session.sig', value: sig })
    await page.goto('localhost:3000')
    await page.waitFor('a[href="/auth/logout"]')

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

    expect(text).toEqual('Logout')
})
