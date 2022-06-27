const chromium = require('chromium');
const puppeteer = require('puppeteer');

const headers = require('./headers');
const proxies = require('./proxies.json');

let header_key = 0;
let proxy_key = 0;

const finalize = async browser => browser.close();

/**
 * Gets the next header
 * Resets to 0 if we reached the end
 * @return {[type]} [description]
 */
const getNextHeader = () => {
  const next_header = headers[header_key];
  header_key = header_key === headers.length - 1 ? 0 : header_key + 1;
  return next_header;
};

/**
 * Gets the next mesh proxy
 * Resets to 0 if we reached the end
 * @return {[type]} [description]
 */
const getNextMeshProxy = () => {
  const next_mesh_proxy = proxies[proxy_key];
  proxy_key = proxy_key === proxies.length - 1 ? 0 : proxy_key + 1;
  return next_mesh_proxy;
};

const initialize = async (headless=false) => {
  const next_header = getNextHeader();
  const next_mesh_proxy = getNextMeshProxy();
  const args = ['--proxy-server=http://' + next_mesh_proxy];
  // const executablePath = await chromium.executablePath;
  const browser = await puppeteer.launch({
    args,
    // executablePath,
    headless
  });
  let page;
  try {
    page = await browser.newPage();
  } catch (e) {
    console.log(e);
    throw e;
  }
  await page.setUserAgent(next_header['user-agent']);
  // set the HTTP Basic Authentication credential
  await page.authenticate({'username': process.env.PROXY_USER, 'password': process.env.PROXY_PASS });
  await page.setDefaultNavigationTimeout(0);
  await handleReqRes(page,next_header);
  return Promise.resolve([browser,page]);
};

const handleReqRes = async (page,next_header) => {
  await page.setRequestInterception(true);

  page.on('request', async request => {
    const current_headers = request.headers();
    const request_headers = {
      ...current_headers,
      ...next_header,
    };
    await request.continue({ request_headers });
  });

  return Promise.resolve();
};

const visitUrl = async (url,page,delay=7) => {
  try {
    const options = { waitUntil: 'networkidle2' };
    await page.goto(url,options);
    return delay > 0 ? new Promise(r => setTimeout(r, delay*1000)) : Promise.resolve();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  finalize,
  initialize,
  visitUrl,
};
