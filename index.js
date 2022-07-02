/**
 * POST with a payload formatted as:
 * [{
 *    "url": <string>,        (what url to crawl)
 *    "selector": <string>,   (what to select)
 *    "timeout": <number>,    (selector timeout)
 *    "type": <string>,       (single or multiple items)
 *    "eval": <string>,       (function to run)
 *    "attribute": <string>,  (attribute to extract)
 *    "key": <string>         (response object value property)
 *    "element": []           (optional array of child elements)
 * }]
 * 
 */
const functions = require('@google-cloud/functions-framework');
const { finalize, initialize, visitUrl } = require('./puppeteer');

const findSelector = async (page, element, values) => {
  try {
    // Wait for selector...
    console.log(`Waiting for '${element.selector}' selector...`);
    await page.waitForSelector(element.selector, { visible: true, timeout: element.timeout });
    console.log('Selector found!');
           
    // Use specified function to extract values...
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

    // set value
    values[element.key] = value;

    // loop through any child elements
    if (element.element) {
      await crawElements(page, element.elements, values);
    }

    return Promise.resolve();

  } catch (e) {
    console.log(`Selector not found.`, e);
  }
};

// iterate through all elements
const crawElements = async (page, elements, values) => {
  for (const key in elements) {
    const element = elements[key];
    console.log('Crawling element through proxy...', element);
    await findSelector(page, element, values);
  }
};

functions.http('run', async (req, res) => {
  if (req.body.elements) {
    const elements = JSON.parse(req.body.elements);
    const url = req.body.url;
    const values = {}; // extracted values
    const headless = true;
    const [browser, page] = await initialize(headless);
    await visitUrl(url, page);
    await crawElements(page, elements, values);
    await finalize(browser);
    res.send(values);
  } else {
    res.send(`Example Web Crawler Extracter Google Cloud Function`);
  }
});
