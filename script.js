const tools = require('simple-svg-tools')
const fs = require("fs")
const gm = require("gm")
const Twit = require('twit')
const schedule = require('node-schedule')
const config = require('./config.json')

const T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
})

const colors = ["#00b7cc", "#004ecc", "#5f00cc", "#cc0000", "#cc7700", "#f2ff00", "#00cc33"]
let choosed_color = 0

const j = schedule.scheduleJob('0 0 * * *', () => {
    tools.ImportSVG('portal_core.svg').then(svg => {
        tools.ChangePalette(svg, {
            '#00CC33': colors[choosed_color],
        }).then(svg => {
            tools.ExportSVG(svg, 'actual_pp.svg').then(() => {
                gm('actual_pp.svg').resize(400, 400).write('actual_pp.png', (err) => {
                    if (err) console.log(err) 
                    else {
                        let b64content = fs.readFileSync('./actual_pp.png', { encoding: 'base64' })
                        T.post("account/update_profile_image", {image: b64content}, (err, data, response) => {
                            if (err) console.log(err)
                        })

                        if (choosed_color >= colors.length - 1) {
                            choosed_color = 0
                        } else {
                            choosed_color++
                        }
                    }
                })
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
})
