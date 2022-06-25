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

functions.http('run', async (req, res) => {
  if (req.body.elements) {
    const elements = JSON.parse(req.body.elements);
    const values = []; // extracted values

    // initialize puppeteer
    const headless = false;
    const [browser, page] = await initialize(headless);

    // iterate through requested elements
    for (const key in elements) {
      const element = elements[key];
      console.log('Crawling element through proxy...', element);
      try {
        await visitUrl(element.url, page);
        try {
          console.log('Waiting for selector...');
          await page.waitForSelector(element.selector, { visible: true, timeout: element.timeout });
          console.log('Selector found!');
          const value = await page.$eval(element.selector, (e) => e.innerHTML);
          values.push({
            [element.key]: value
          });
        } catch (e) {
          console.log(e);
          console.log(`Selector not found.`);
        }
      } catch (e) {
        console.log(e);
      }
      await finalize(browser);
    }
    res.send({ values });
  } else {
    res.send(`Example Web Crawler Extracter Google Cloud Function`);
  }
});
