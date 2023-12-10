const puppeteer = require('puppeteer')

test('Add tho numvers', () => {
    const sum = 1 + 3

    expect(sum).toEqual(4)
})

test('Can open browser', async () => {
    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage()
})
