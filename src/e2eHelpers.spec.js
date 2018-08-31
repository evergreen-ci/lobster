// @flow

import { Builder, Capabilities, By, until, Condition } from 'selenium-webdriver';
import path from 'path';
import { existsSync } from 'fs';

// xpaths to elements
const caseToggle = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div/div[1]/div[2]';
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
// const logLineList = '//*[@id="root"]/div/main/div/div[2]/div[2]/div/div';
const firstLine = '//*[@id="root"]/div/main/div/div[2]/div[2]/div/div/div/div/div[1]';
// const bookmarks = '//*[@id="root"]/div/main/div/div[1]/div';
const cacheModal = '//*[@id="root"]/div/div/div/div';
const logURLField = '//*[@id="urlInput"]';
const logURLApplyButton = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[1]/div[2]/button';
const filterCaseToggleGroup = (n: number) => {
  return `//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/div[1]/div/div[${n}]/div[3]`;
};
const highlightCaseToggleGroup = (n: number) => {
  return `//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/div[2]/div/div[${n}]/div[3]`;
};

export const lobsterServer = () => {
  const port = process.env.LOBSTER_E2E_SERVER_PORT || 9000;
  return `localhost:${port}`;
};

export const lobsterURL = (file: string = 'simple.log') => {
  return `http://${lobsterServer()}/lobster?server=${lobsterServer()}%2Fapi%2Flog&url=${file}`;
};

export class Lobster {
  _driver = {};
  _showdetails: boolean = false;

  constructor(driver: Object) {
    this._driver = driver;
  }

  async setNewLobsterServerLogFile(file: string) {
    const field = await this._driver.wait(until.elementLocated(By.xpath(logURLField)));
    await field.clear();
    await field.sendKeys(file);
  }

  async submitLobsterServerLogFile() {
    const button = await this._driver.wait(until.elementLocated(By.xpath(logURLApplyButton)));
    await button.click();
  }

  async refresh() {
    await this._driver.navigate().refresh();
  }

  async disableFetch() {
    await this._driver.executeScript('window.fetch = undefined');
  }

  async waitUntilDocumentReady() {
    await this._driver.wait(
      new Condition('document is ready', (driver) => {
        return driver.executeScript('return document.readyState').then((val) => {
          return val === 'complete';
        });
      })
    );
  }

  async init(url: ?string, options: Object = {}) {
    if (url == null) {
      await this._driver.get(lobsterURL(options.url));
    } else {
      await this._driver.get(`http://localhost:${process.env.LOBSTER_E2E_SERVER_PORT || 9000}${url}`);
    }

    await this.waitUntilDocumentReady();

    const browserHasFilesystemAPI = await this.browserHasFilesystemAPI();
    if (browserHasFilesystemAPI) {
      const modal = await this._driver.findElements(By.xpath(cacheModal));
      if (modal.length > 0) {
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

    if (options.skipWaitForLine !== true) {
      await this.firstLine();
    }
  }

  async get(url: string) {
    await this._driver.get(url);
  }

  async browserHasFilesystemAPI() {
    const res = await this._driver.executeScript(
      'return window.requestFileSystem != null');
    return res === true;
  }

  async firstLine() {
    await this._driver.wait(until.elementLocated(By.xpath(firstLine)));
  }

  async search(text: string) {
    const find = this._driver.findElement(By.id('findInput'));
    // wait for debounce to expire
    await this._driver.wait(new Promise((resolve) => {
      return setTimeout(resolve, 150);
    }));
    await find.sendKeys(text);
  }

  async searchAndWordHighlights() {
    return this._driver.findElements(By.xpath('//mark'));
  }

  async showDetails() {
    const details = await this._driver.wait(until.elementLocated(By.xpath(showDetails)));
    await details.click();
    const caseToggleButton = await this._driver.wait(until.elementLocated(By.xpath(caseToggle)));
    if (this._showdetails) {
      await this._driver.wait(until.elementIsNotVisible(caseToggleButton));
    } else {
      await this._driver.wait(until.elementIsVisible(caseToggleButton));
    }

    this._showdetails = !this._showdetails;
  }

  async caseToggleSearch() {
    const group = await this._driver.wait(until.elementLocated(By.xpath(caseToggleGroup)));
    const button = await group.findElement(By.xpath('.//label[not(contains(@class, " active"))]'));
    await button.click();
  }

  async caseToggleFilter(n: number) {
    const group = await this._driver.wait(until.elementLocated(By.xpath(filterCaseToggleGroup(n))));
    const button = await group.findElement(By.xpath('.//label[not(contains(@class, " active"))]'));
    await this._driver.wait(until.elementIsVisible(button));
    await button.click();
  }

  async caseToggleHighlight(n: number) {
    const group = await this._driver.wait(until.elementLocated(By.xpath(highlightCaseToggleGroup(n))));
    const button = await group.findElement(By.xpath('.//label[not(contains(@class, " active"))]'));
    await this._driver.wait(until.elementIsVisible(button));
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

  async line(x: number) {
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

  async dropFile(file: string) {
    const absPath = path.resolve(file);
    const fileExists = existsSync(absPath);
    if (!fileExists) {
      // eslint-disable-next-line no-throw-literal
      throw `file '${absPath}' does not exist`;
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

  async scrollToBottom() {
    const js = 'window.scrollBy(0, 40000000);';
    await this._driver.executeScript(js);
    await this._driver.executeScript(js);
    // Make sure we're really at the bottom
    // await this._driver.actions({ async: false }).sendKeys(Key.PAGE_DOWN).perform();
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
  if (caps == null) {
    throw new TypeError(`expected browser to be 'chrome' or 'firefox', got ${useBrowser}`);
  }

  const browserCaps = opts[useBrowser];
  if (browserCaps != null && caps != null) {
    Object.keys(browserCaps).forEach((key) => {
      // $FlowFixMe
      if (caps.get(key) == null) {
        // $FlowFixMe
        caps.set(key, browserCaps[key]);
      }
    });
  }
  return caps;
};

export const makeDriver = async (done: () => void, opts: Object) => {
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
      // $FlowFixMe
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

  [true, false].forEach((v) => {
    test(`is-headless-ci-${JSON.stringify(v)}`, () => {
      process.env.CI = JSON.stringify(v);

      process.env.LOBSTER_E2E_BROWSER = 'chrome';
      const caps = capabilities();
      expect(caps.get('chromeOptions').args.includes('--headless')).toBe(v);

      process.env.LOBSTER_E2E_BROWSER = 'firefox';
      const ffcaps = capabilities();
      expect(ffcaps.get('moz:firefoxOptions').args.includes('--headless')).toBe(v);
    });
  });
});
