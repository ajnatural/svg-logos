const fs = require('fs')
const fetch = require('node-fetch')
let window = require('svgdom')
const SVG = require('svgjs')(window)
const document = window.document
const pd = require('pretty-data').pd
const options = require('./options.json')

const draw = SVG(document.documentElement)
const url = 'https://raw.githubusercontent.com/ajnatural/svg-logos/master/sample.svg';

const LONG = 1000
const MEDIUM = 600
const SHORT = 300
const BUFFER = 15

const  buildLogo = (params) => {
  fetch(params.icon).then(res => {
    return res.text()
  }).then(body => {
    const icon = buildIcon(body);
    const heading = buildText(params.heading, params.heading_font, params.heading_weight, params.heading_style)
    const slogan = buildText(params.slogan, params.slogan_font, params.slogan_weight, params.slogan_style)

    switch (params.arrangement) {
      case 'icon-left':
        draw.attr('viewBox', `0 0 ${LONG} ${SHORT}`)
        draw.size(LONG, SHORT)

        icon.size(null, SHORT)
        icon.attr('viewBox', '0 0 100 100')

        scaleText(heading, LONG - icon.width() - BUFFER, SHORT / 2)
        scaleText(slogan, LONG - icon.width() - BUFFER, heading.rbox().height * 0.6)

        var textGroup = draw.group()
        textGroup.add(heading)
        textGroup.add(slogan)

        textGroup.attr('text-anchor', 'start')
        var groupHeight = heading.bbox().height + slogan.bbox().height
        textGroup.translate(icon.width() + BUFFER, (SHORT - groupHeight * 1.15) / 2)

        heading.y(0)
        slogan.y(heading.bbox().height * 0.85)

        break;
      case 'icon-right':
        draw.attr('viewBox', `0 0 ${LONG} ${SHORT}`)
        draw.size(LONG, SHORT)

        icon.size(null, SHORT)
        icon.attr('viewBox', '0 0 100 100')
        icon.move(LONG - icon.width(), 0)

        scaleText(heading, LONG - icon.width() - BUFFER, SHORT / 2)
        scaleText(slogan, LONG - icon.width() - BUFFER, heading.rbox().height * 0.6)

        var textGroup = draw.group()
        textGroup.add(heading)
        textGroup.add(slogan)

        textGroup.attr('text-anchor', 'end')
        var groupHeight = heading.bbox().height + slogan.bbox().height
        textGroup.translate(LONG - icon.width() - BUFFER, (SHORT - groupHeight * 1.15) / 2)

        heading.y(0)
        slogan.y(heading.bbox().height * 0.85)

        break;
      case 'icon-top':
        draw.attr('viewBox', `0 0 ${MEDIUM} ${MEDIUM}`)
        draw.size(MEDIUM, MEDIUM)

        icon.size(MEDIUM / 2, null)
        icon.attr('viewBox', '0 0 100 100')
        icon.center(MEDIUM / 2, null)

        scaleText(heading, MEDIUM - BUFFER)
        scaleText(slogan, MEDIUM - BUFFER)

        heading.move(MEDIUM / 2, icon.height() * 0.85)
        heading.font('anchor', 'middle')

        slogan.move(MEDIUM / 2, (icon.height() + heading.rbox().height) * 0.85)
        slogan.font('anchor', 'middle')

        break;
    }

    saveLogo();
  });
}

const buildIcon = (icon) => {
  icon = icon.replace('<svg', '<svg id="custom_logo" ')
  draw.svg(icon)
  const el = SVG.get('custom_logo')
  el.attr('viewBox', null)
  return el
}

const buildText = (text, font, weight, style) => {
  const el = draw.plain(text)
  el.font({
    family: font,
    weight: weight,
    size: 150,
    style: style
  })
  return el
}

/**
 * Scales a text element down to limit width by changing font size
 */
const scaleText = (el, widthLimit, heightLimit) => {
  var i = 200
  do {
    el.font({'size': i})
    i--;
  } while (el.rbox().width >= widthLimit * 0.9 || el.rbox().height >= heightLimit * 0.9)
}

const saveLogo = () => {
  header = "<?xml version='1.0' encoding='ASCII' standalone='yes'?>";
  fs.writeFile('test.svg', pd.xml(header + draw.svg()), err => {
    if (err) {
      console.log(err);
    }
  });
}

params = [
  "arrangement",
  "icon_color",
  "heading_font",
  "heading_style",
  "heading_weight",
  "heading_color",
  "slogan_font",
  "slogan_style",
  "slogan_weight",
  "slogan_color"
]

custom_params = {}
params.forEach(p => {
  Object.keys(options).forEach(k => {
    if (p.includes(k)) {
      // Pick a random value for the parameters we have options for
      custom_params[p] = options[k][Math.floor(Math.random()*options[k].length)]
    }
  });
});

custom_params = Object.assign(custom_params, {
  icon: url,
  heading: 'Menith',
  slogan: 'Design and Development'
})

buildLogo(custom_params)
