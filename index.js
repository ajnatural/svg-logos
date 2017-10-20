const fs = require('fs');
const fetch = require('node-fetch');
const window   = require('svgdom')
const SVG      = require('svgjs')(window)
const document = window.document
const pd = require('pretty-data').pd

const draw = SVG(document.documentElement)
const url = 'https://raw.githubusercontent.com/iconic/open-iconic/master/svg/infinity.svg'

const  buildLogo = (params) => {
  fetch(params.icon).then(res => {
    return res.text()
  }).then(body => {
    const icon = buildIcon(body);
    const heading = buildHeading(params.heading)
    //const slogan = buildSlogan(params.slogan)

    //heading.move(icon.width() + 10, 10)
    //slogan.move(icon.width() + 10, heading.height() + 10)

    saveLogo();
  });
}

const buildIcon = (icon) => {
  return draw.svg(icon).scale(10, 10).move(0, 0);
}

const buildHeading = (heading) => {
  return draw.text(heading);
}

const buildSlogan = (slogan) => {
  return draw.text(slogan);
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
  slogan: 'Design and Development'
});
