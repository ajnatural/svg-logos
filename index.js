const fs = require('fs')
const fetch = require('node-fetch')
let window = require('svgdom')
const SVG = require('svgjs')(window)
const document = window.document
const pd = require('pretty-data').pd
const options = require('./options.json')
const ColorScheme = require('color-scheme')
const NounProject = require('the-noun-project')

const draw = SVG(document.documentElement)
const base_url = 'https://raw.githubusercontent.com/ajnatural/svg-logos/master/samples/';

const LONG = 1000
const MEDIUM = 600
const SHORT = 300
const BUFFER = 15

nounProject = new NounProject({
    key: 'ec42b2655df04cb7bf3d1ef7aa2129c4',
    secret: '775826a930b24266b7a897f13b136c69'
});

const fetchIcon = (params, cb) => {
  switch (params.icon) {
    case 'text-only':
      break;
    case 'font':
      cb(
        buildFontIcon(params.heading.charAt(0), params.icon_font, params.icon_font_weight, params.icon_font_style)
      )
      break;
    default:
      fetch(base_url + params.icon_file).then(res => {
        return res.text()
      }).then(body => cb(body))

      break;
  }
}

const  buildLogo = (params) => {
  fetchIcon(params, body => {
    const icon = buildIcon(body);
    const heading = buildText(params.heading, params.heading_font, params.heading_weight, params.heading_style)
    const slogan = buildText(params.slogan, params.slogan_font, params.slogan_weight, params.slogan_style)


    const textGroup = draw.group()
    textGroup.add(heading)
    textGroup.add(slogan)

    var groupHeight = heading.bbox().height + slogan.bbox().height
    var groupHeightFudge = 1.15
    if (params.slogan == '') {
      groupHeight = heading.bbox().height
      groupHeightFudge = 0.8
    }

    const colors = getColors(params.text_color_hue, params.text_color_variation)
    heading.attr('fill', '#' + colors[0])
    slogan.attr('fill', '#' + colors[1])
    icon.attr('fill', '#' + colors[3])

    switch (params.arrangement) {
      case 'icon-left':
        draw.attr('viewBox', `0 0 ${LONG} ${SHORT}`)
        draw.size(LONG, SHORT)

        icon.size(null, SHORT)
        icon.attr('viewBox', '0 0 100 100')

        scaleText(heading, LONG - icon.width() - BUFFER, SHORT / 2)
        scaleText(slogan, LONG - icon.width() - BUFFER, heading.rbox().height * 0.6)

        textGroup.attr('text-anchor', 'start')
        textGroup.translate(icon.width() + BUFFER, (SHORT - groupHeight * groupHeightFudge) / 2)

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

        textGroup.attr('text-anchor', 'end')
        textGroup.translate(LONG - icon.width() - BUFFER, (SHORT - groupHeight * groupHeightFudge) / 2)

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
  })
}

const buildFontIcon = (text, font, weight, style) => {
  const nested = draw.nested()
  const el = nested.plain(text)
  el.font({
    family: font,
    weight: weight,
    style: style,
    size: 100
  })
  nested.attr('style', '')
  return nested
}

const buildIcon = (icon) => {
  if (typeof icon == 'object') {
    return icon
  }

  const el = draw.svg(icon).last()
  el.attr('viewBox', null)
  return el
}

const buildText = (text, font, weight, style) => {
  const el = draw.plain(text)
  el.font({
    family: font,
    weight: weight,
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

const getColors = (hue, variation) => {
  const colorScheme = new ColorScheme
  return colorScheme
        .from_hue(hue)
        .scheme('mono')
        .variation(variation).colors();
}

params = [
  "arrangement",
  "icon_color",
  "heading_font",
  "heading_style",
  "heading_weight",
  "slogan_font",
  "slogan_style",
  "slogan_weight",
  "text_color_variation",
  "text_color_hue",
  "icon_font",
  "icon_font_weight",
  "icon_font_style",
  "icon_file"
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
  heading: 'Menith',
  slogan: ''
})

buildLogo(custom_params)
