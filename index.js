/**
 * POST with a payload formatted as:
 * [{
 *    "url": <string>,
 *    "selector": <string>,
 *    "timeout": <number>,
 *    "eval": <string>,
 *    "key": <string>
 * }]
 */
const functions = require('@google-cloud/functions-framework');
const { finalize, initialize, visitUrl } = require('./puppeteer');

const findSelector = async (page, element, values) => {
  try {
    console.log(`Waiting for '${element.selector}' selector...`);
    await page.waitForSelector(element.selector, { visible: true, timeout: element.timeout });
    console.log('Selector found!');
    
    let value;

    if (element.type === 'multiple') {
      let fn;
      switch (element.eval) {
        case 'getInnerHTML':
          fn = items => items.map(item => item.innerHTML);
          break;
        case 'getAttribute':
          fn = items => items.map(item => item.getAttribute('href')).filter(item => item !== null);
          break;
        default:
          throw 'No eval provided!';
      }
      value = await page.$$eval(element.selector, fn);
    } else if (element.type === 'single') {
      let fn;
      switch (element.eval) {
        case 'getInnerHTML':
          fn = (item) => item.innerHTML;
        case 'getAttribute':
          fn = (item) => item.getAttribute(element.attribute);
      }
      value = await page.$eval(element.selector, (e) => fn);
    }

    values[element.key] = value;

  } catch (e) {
    console.log(e);
    console.log(`Selector not found.`);
  }
};

functions.http('run', async (req, res) => {
  if (req.body.elements) {
    const elements = JSON.parse(req.body.elements);
    const values = {}; // extracted values

    // initialize puppeteer
    const headless = true;
    const [browser, page] = await initialize(headless);

    // iterate through requested elements
    for (const key in elements) {
      const element = elements[key];
      console.log('Crawling element through proxy...', element);
      await visitUrl(element.url, page);
      await findSelector(page, element, values);
      await finalize(browser);
    }

    res.send(values);

  } else {
    res.send(`Example Web Crawler Extracter Google Cloud Function`);
  }
});
