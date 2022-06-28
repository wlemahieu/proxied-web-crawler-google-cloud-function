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
      switch (element.eval) {
        case 'getInnerText':
          value = await page.$$eval(element.selector, items => items.map(item => item.innerText));
          break;
        case 'getLink':
          value = await page.$$eval(element.selector, items => items.map(item => item.getAttribute('href')));
          break;
        default:
          throw 'No eval provided!';
      }
    } else if (element.type === 'single') {
      switch (element.eval) {
        case 'getInnerText':
          value = await page.$eval(element.selector, item => item.innerText);
          break;
        case 'getLink':
          value = await page.$eval(element.selector, item => item.getAttribute('href'));
          break;
        default:
          throw 'No eval provided!';
      }
    }

    values[element.key] = value;

  } catch (e) {
    console.log(`Selector not found.`, e);
  }
};

functions.http('run', async (req, res) => {
  if (req.body.elements) {
    const elements = JSON.parse(req.body.elements);
    const url = req.body.url;
    const values = {}; // extracted values

    // initialize puppeteer
    const headless = true;
    const [browser, page] = await initialize(headless);
    await visitUrl(url, page);

    // iterate through requested elements
    for (const key in elements) {
      const element = elements[key];
      console.log('Crawling element through proxy...', element);
      await findSelector(page, element, values);
    }

    await finalize(browser);
    res.send(values);

  } else {
    res.send(`Example Web Crawler Extracter Google Cloud Function`);
  }
});
