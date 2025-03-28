import * as cheerio from 'cheerio'

const cleanHTML = (html: string) => {
    const $ = cheerio.load(html)

    $('script, style, img, video, iframe, canvas, svg, form, button, input, link, meta, noscript').remove()

    let cleanedText = $.text().trim()

    cleanedText = cleanedText.replace(/\s+/g, ' ')

    return cleanedText
}

export default cleanHTML