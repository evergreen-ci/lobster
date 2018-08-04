import { Builder, Capabilities, By, until, Condition } from 'selenium-webdriver';
import path from 'path';
import { existsSync } from 'fs';

const caseToggleXPath = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div/div[1]/div[2]';
const cacheNever = '//*[@id="root"]/div/div/div/div/div/div[3]/button[1]';
const cacheYes = '//*[@id="root"]/div/div/div/div/div/div[3]/button[3]';
const showDetails = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[4]';
const notFound = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/label';
const addFilter = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[2]';
const addHighlight = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[3]';
const highlightLine = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/div[2]/div/div/div[2]/label[2]';
const lines = '//*[@id="root"]/div/main/div/div[2]/div[2]/div/div/div/div';
const logicToggleGroup = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[2]/div[1]/div[3]';
const caseToggleGroup = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[2]/div[1]/div[2]';
const dropArea = '//*[@id="root"]/div/main/div/div';
const processLogButton = '//*[@id="root"]/div/main/div/div/p[2]/button';

const lobsterURL = (file = 'simple.log') => {
  return `http://localhost:${process.env.LOBSTER_E2E_SERVER_PORT}/lobster?server=localhost:${process.env.LOBSTER_E2E_SERVER_PORT}%2Fapi%2Flog&url=${file}`;
};

export class Lobster {
  constructor(driver) {
    this._driver = driver;
    this._showdetails = false;
  }

  async refresh() {
    await this._driver.navigate().refresh();
  }

  async disableFetch() {
    await this._driver.executeScript('window.fetch = undefined');
  }

  async waitUntilDocumentReady() {
    // Wait until document is ready
    await this._driver.wait(
      new Condition('document is ready', (driver) => {
        return driver.executeScript('return document.readyState').then((val) => {
          return val === 'complete';
        });
      })
    );
  }

  async init(url, options = {}) {
    if (url === undefined) {
      await this._driver.get(lobsterURL());
    } else {
      await this._driver.get(`http://localhost:${process.env.LOBSTER_E2E_SERVER_PORT}${url}`);
    }

    await this.waitUntilDocumentReady();

    const browserHasFilesystemAPI = await this.browserHasFilesystemAPI();
    if (browserHasFilesystemAPI) {
      if (options.cache === true) {
        const button = await this._driver.wait(until.elementLocated(By.xpath(cacheYes)));
        try {
          await button.click();
        } catch (err) {
          console.log(err);
        }
      } else {
        // Click the never button the cache
        const never = await this._driver.wait(until.elementLocated(By.xpath(cacheNever)));
        try {
          await never.click();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  async browserHasFilesystemAPI() {
    const res = await this._driver.executeScript(
      'return window.requestFileSystem != null');
    return res === true;
  }

  async search(text) {
    const find = this._driver.findElement(By.id('findInput'));
    await find.sendKeys(text);
  }

  async searchAndWordHighlights() {
    return this._driver.findElements(By.xpath('//mark'));
  }

  async showDetails() {
    const details = await this._driver.wait(until.elementLocated(By.xpath(showDetails)));
    await details.click();
    const caseToggle = await this._driver.wait(until.elementLocated(By.xpath(caseToggleXPath)));
    if (this._showdetails) {
      await this._driver.wait(until.elementIsNotVisible(caseToggle));
    } else {
      await this._driver.wait(until.elementIsVisible(caseToggle));
    }

    this._showdetails = !this._showdetails;
  }

  async caseToggle() {
    const group = await this._driver.wait(until.elementLocated(By.xpath(caseToggleGroup)));
    const button = await group.findElement(By.xpath('.//label[not(contains(@class, " active"))]'));
    await button.click();
  }

  async logicToggle() {
    const lgroup = await this._driver.wait(until.elementLocated(By.xpath(logicToggleGroup)));
    const button = await lgroup.findElement(By.xpath('.//label[not(contains(@class, " active"))]'));
    await button.click();
  }

  async highlightLine() {
    const highlightLineButton = await this._driver.wait(until.elementLocated(By.xpath(highlightLine)));
    await this._driver.wait(until.elementIsVisible(highlightLineButton));
    await highlightLineButton.click();
  }

  async addHighlight() {
    const highlight = await this._driver.wait(until.elementLocated(By.xpath(addHighlight)));
    await highlight.click();
  }

  async addFilter() {
    const filter = await this._driver.wait(until.elementLocated(By.xpath(addFilter)));
    await filter.click();
  }

  async lines() {
    const logContainer = await this._driver.wait(until.elementLocated(By.xpath(lines)));
    return await logContainer.findElements(By.xpath('.//div'));
  }

  async line(x) {
    const l = await this.lines();
    return l[x];
  }

  async highlightedLines() {
    const logContainer = await this._driver.wait(until.elementLocated(By.xpath(lines)));
    const divs = await logContainer.findElements(By.xpath('.//div'));

    const out = [];
    for (let i = 0; i < divs.length; ++i) {
      const classes = await divs[i].getAttribute('class');
      if (classes.split(' ').includes('filtered')) {
        out.push(divs[i]);
      }
    }

    return out;
  }

  async notFound() {
    return await this._driver.wait(until.elementLocated(By.xpath(notFound)));
  }

  async dropFile(file) {
    const absPath = path.resolve(file);
    const fileExists = existsSync(absPath);
    if (!fileExists) {
      throw new `file '${absPath}' does not exist`;
    }

    const dropzone = await this._driver.wait(until.elementLocated(By.xpath(dropArea)));

    // JS from https://sqa.stackexchange.com/a/22199
    const js =
      'var target = arguments[0],' +
      '    offsetX = arguments[1],' +
      '    offsetY = arguments[2],' +
      '    document = target.ownerDocument || document,' +
      '    window = document.defaultView || window;' +
      '' +
      "var input = document.createElement('INPUT');" +
      "input.type = 'file';" +
      "input.style.display = 'none';" +
      'input.onchange = function () {' +
      '  var rect = target.getBoundingClientRect(),' +
      '      x = rect.left + (offsetX || (rect.width >> 1)),' +
      '      y = rect.top + (offsetY || (rect.height >> 1)),' +
      '      dataTransfer = { files: this.files };' +
      '' +
      "  ['dragenter', 'dragover', 'drop'].forEach(function (name) {" +
      "    var evt = document.createEvent('MouseEvent');" +
      '    evt.initMouseEvent(name, !0, !0, window, 0, 0, 0, x, y, !1, !1, !1, !1, 0, null);' +
      '    evt.dataTransfer = dataTransfer;' +
      '    target.dispatchEvent(evt);' +
      '  });' +
      '' +
      '  setTimeout(function () { document.body.removeChild(input); }, 25);' +
      '};' +
      'document.body.appendChild(input);' +
      'return input;';

    const input = await this._driver.executeScript(js, dropzone, 0, 0);
    await input.sendKeys(absPath.toString());
    await this._driver.wait(until.stalenessOf(input));
    const button = await this._driver.wait(until.elementLocated(By.xpath(processLogButton)));
    await button.click();
  }
}

const isHeadless = () => {
  if (process.env.CI === 'true' && process.env.LOBSTER_E2E_HEADLESS !== 'false') {
    return true;
  } else if (process.env.CI !== 'true' && process.env.LOBSTER_E2E_HEADLESS === 'true') {
    return true;
  }
  return false;
};

const chromeCapabilities = () => {
  const caps = Capabilities.chrome();
  const options = { 'args': ['--disable-device-discovery-notifications', '--unlimited-storage'] };
  if (isHeadless()) {
    options.args.push(...['--headless']);
  }
  // Disable sandboxing, GPU, shared memory in VMs
  if (process.env.IS_VM === 'true') {
    options.args.push(...['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--allow-insecure-localhost', '--enable-crash-reporter']);
  }
  caps.set('chromeOptions', options);
  return caps;
};

const firefoxCapabilities = () => {
  const caps = Capabilities.firefox();
  const options = { 'args': [] };
  if (isHeadless()) {
    options.args.push(...['--headless']);
  }
  if (options.args === []) {
    delete options.args;
  }
  caps.set('moz:firefoxOptions', options);
  return caps;
};

const capabilities = (opts = {}) => {
  const useBrowser = process.env.LOBSTER_E2E_BROWSER || 'chrome';

  let caps = undefined;
  if (useBrowser === 'chrome') {
    caps = chromeCapabilities();
  } else if (useBrowser === 'firefox') {
    caps = firefoxCapabilities();
  }
  if (caps === undefined) {
    throw new TypeError(`expected browser to be 'chrome' or 'firefox', got ${useBrowser}`);
  }

  const browserCaps = opts[useBrowser];
  if (browserCaps !== undefined) {
    Object.keys(browserCaps).forEach((key) => {
      if (!caps.get(key)) {
        caps.set(key, browserCaps[key]);
      }
    });
  }
  return caps;
};

export const makeDriver = async (done, opts) => {
  try {
    return await new Builder().withCapabilities(capabilities(opts)).build();
  } catch (err) {
    done.fail(err);
  }
};

describe('capabilities', () => {
  const env = Object.assign({}, process.env);

  beforeEach(() => {
    delete(process.env.LOBSTER_E2E_BROWSER);
    delete(process.env.LOBSTER_E2E_HEADLESS);
    delete(process.env.IS_VM);
    delete(process.env.CI);
  });

  afterEach(() => {
    process.env = Object.assign({}, env);
  });

  test('unknown-browser', () => {
    process.env.LOBSTER_E2E_BROWSER = 'netscape';
    expect(() => {
      capabilities();
    }).toThrow(TypeError);
  });

  test('custom-options', () => {
    process.env.LOBSTER_E2E_BROWSER = 'chrome';
    const opts = {
      chrome: {
        custom: 'test',
        chromeOptions: 'bad'
      }
    };
    const caps = capabilities(opts);
    expect(caps.get('custom')).toBe('test');
    expect(caps.get('chromeOptions')).not.toBe('bad');
  });

  // [true, false].forEach((v) => {
  //   test(`is-headless-ci-${v}`, () => {
  //     process.env.CI = JSON.stringify(v);

  //     process.env.LOBSTER_E2E_BROWSER = 'chrome';
  //     const caps = capabilities();
  //     console.log('--headless' in caps.get('chromeOptions').args);
  //     expect('--headless' in caps.get('chromeOptions').args).toBe(v);

  //     process.env.LOBSTER_E2E_BROWSER = 'firefox';
  //     const ffcaps = capabilities();
  //     expect('--headless' in ffcaps.get('moz:firefoxOptions').args).toBe(v);
  //   });

  //   test(`is-headless-headless-false-ci-${v}`, () => {
  //     process.env.CI = JSON.stringify(v);
  //     process.env.LOBSTER_E2E_HEADLESS = 'false';
  //     process.env.LOBSTER_E2E_BROWSER = 'chrome';
  //     const caps = capabilities();
  //     expect('--headless' in caps.get('chromeOptions').args).toBe(!v);

  //     process.env.LOBSTER_E2E_BROWSER = 'firefox';
  //     const ffcaps = capabilities();
  //     expect('--headless' in ffcaps.get('moz:firefoxOptions').args).toBe(!v);
  //   });
  // });
});
