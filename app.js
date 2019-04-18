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
function getOtherPageLink(url, callback) {
    axios
        .get(url)
        .then(res => {
            callback(getOneFileLink(res.data))
        })
        .catch(error => {
            callback(error)
        })
}
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
    return undefined
}
function getQualities(qualities, callback) {
    if (qualities.name === 'a') {
        let link = qualities.attribs.href
        let quality =
            qualities.children[0].children[0].children[0].children[0].data

        let language =
            qualities.children[0].children[1].children[0].children[0].data

        getOtherPageLink(link, resultLink => {
            callback([quality, language, link, resultLink])
        })
    } else {
        callback(undefined)
    }
}
function asyncFor(index, data, arr, callback) {
    if (index < data.length) {
        getQualities(data[index], res => {
            if (res != undefined && res[3] != undefined) arr.push(res)
            asyncFor(index + 1, data, arr, callback)
        })
    } else {
        callback(arr)
    }
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
})
app.post('/search', (req, res) => {
    var _res = res
    axios
        .get(req.body.search)
        .then(res => {
            let qualities = $('.otherversions', res.data).children()
            var available_qualities = []
            asyncFor(0, qualities, [], finalArr => {
                let final = $('.col-mov-right', res.data)
                    .children()[2]
                    .children[0].data.split('|')

                finalArr.push([
                    final[0],
                    final[1],
                    req.body.search,
                    getOneFileLink(res.data),
                ])
                _res.send(finalArr)
            })
        })
        .catch(error => {
            res.send(error)
        })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
