const express = require('express')
const rp = require('request-promise')
const $ = require('cheerio')
const app = express()
const axios = require('axios')
const path = require('path')
var bodyParser = require('body-parser')
const main_url = 'https://ww16.zone-telechargement.lol'
const port = 3000
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
function getOneFileLink(data) {
    let dl_tables = $('.downloadsortsonlink', data)
    for (let i = 0; i < dl_tables.length; i++) {
        if (
            dl_tables[i].children[1].children[1].children[1].children[1]
                .data === '1fichier.com'
        ) {
            return (
                main_url +
                dl_tables[i].children[3].children[0].children[1].children[0]
                    .attribs.href
            )
        }
    }
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})
app.post('/search', (req, res) => {
    axios
        .get(req.body.search)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            let qualities = $('.otherversions', res.data).children()
            var available_qualities = []
            for (let i = 0; i < qualities.length; i++)
                if (qualities[i].name === 'a') {
                    let link = qualities[i].attribs.href
                    let quality =
                        qualities[i].children[0].children[0].children[0]
                            .children[0].data

                    let language =
                        qualities[i].children[0].children[1].children[0]
                            .children[0].data
                    available_qualities.push([quality, language, link])
                }
            let final = $('.col-mov-right', res.data)
                .children()[2]
                .children[0].data.split('|')

            available_qualities.push([final[0], final[1], req.body.search])
            console.log(getOneFileLink(res.data))

            res.json(JSON.parse(available_qualities))
        })
        .catch(error => {
            res.send(error)
        })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
