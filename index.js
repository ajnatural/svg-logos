const fs = require('fs');
const fetch = require('node-fetch');
const window   = require('svgdom')
const SVG      = require('svgjs')(window)
const document = window.document
const pd = require('pretty-data').pd

const draw = SVG(document.documentElement)
const url = 'https://raw.githubusercontent.com/ajnatural/svg-logos/master/sample.svg';

const  buildLogo = (params) => {
  fetch(params.icon).then(res => {
    return res.text()
  }).then(body => {
    const icon = buildIcon(body);
    const heading = buildText(params.heading, params.heading_font, params.heading_size, params.heading_weight, params.heading_style)
    const slogan = buildText(params.slogan, params.slogan_font, params.slogan_size, params.slogan_weight, params.slogan_style)

    switch (params.arrangement) {
      case 'icon-left':
        draw.attr('viewBox', '0 0 600 300')
        draw.size(600, 300)

        icon.size(null, 300)
        heading.move(icon.width() + 10, 10)
        slogan.move(icon.width() + 10, heading.attr('font-size') + 10)
        break;
      case 'icon-right':
        draw.attr('viewBox', '0 0 600 300')
        draw.size(600, 300)

        icon.size(null, 300)
        icon.move(600 - icon.width(), 0)
        heading.move(600 - icon.width() - heading.bbox().width, 10)
        slogan.move(600 - icon.width() - slogan.bbox().width, heading.attr('font-size') + 10)
        break;
      case 'icon-top':
        draw.attr('viewBox', '0 0 600 600')
        draw.size(600, 600)

        icon.size(null, 300)
        icon.center(300, 300)
        heading.center(300, icon.height() + 10)
        slogan.center(300, icon.height() + heading.attr('font-size') + 10)
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

const buildText = (text, font, size, weight, style) => {
  const el = draw.plain(text)
  el.font({
    family: font,
    size: size,
    weight: weight,
    style: style
  })
  return el
}

const saveLogo = () => {
  header = "<?xml version='1.0' encoding='ASCII' standalone='yes'?>";
  fs.writeFile('test.svg', pd.xml(header + draw.svg()), err => {
    if (err) {
      console.log(err);
    }
  });
}

buildLogo({
  icon: url,
  heading: 'Menith',
  slogan: 'Design and Development',
  arrangement: 'icon-right',
  heading_font: 'Helvetica',
  heading_size: '32',
  heading_style: 'italic',
  heading_weight: '100',
  slogan_font: 'Verdana',
  slogan_size: '24',
  slogan_style: 'oblique',
  slogan_weight: '300'
});
