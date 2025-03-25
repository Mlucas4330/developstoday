import * as cheerio from 'cheerio'

const cleanHTML = (html: string) => {
    const $ = cheerio.load(html)

    $('script, style, img, video, iframe, canvas, svg, form, button, input, link, meta, noscript').remove()

    return $.text().trim()
}

export default cleanHTML