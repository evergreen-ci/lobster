import { Capabilities, By, until } from 'selenium-webdriver';

/* global process:{} */

const caseToggleXPath = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[2]/div[1]/div[2]/label[1]';
const cacheNever = '//*[@id="root"]/div/div/div/div/div/div[3]/button[1]';
const showDetails = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[4]';
const notFound = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/label';
const addFilter = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[2]';
const addHighlight = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/form/div/div[2]/button[3]';
const highlightLine = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/div[2]/div/div/div[2]/label[2]';
const lines = '//*[@id="root"]/div/main/div/div[2]/div[2]/div/div/div/div';
const logicToggleGroup = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[2]/div[1]/div[3]';
const caseToggleGroup = '//*[@id="root"]/div/main/div/div[2]/div[1]/div/div/form/div[2]/div[1]/div[2]';

export const capabilities = (browser) => {
  // TODO support firefox
  if (browser !== 'chrome') {
    throw new TypeError('expected browser to be chrome');
  }
  const chromeCapabilities = Capabilities.chrome();
  const chromeOptions = {};
  if (process.env.CI === 'true') {
    chromeOptions.args = ['--disable-gpu', '--headless'];
  }
  chromeCapabilities.set('chromeOptions', chromeOptions);

  return chromeCapabilities;
};

test('capabilities', function() {
  const oldProcess = process.env.CI;
  process.env.CI = undefined;
  expect(() => capabilities('firefox')).toThrow(TypeError);
  let c = capabilities('chrome');
  expect(c.getBrowserName()).toBe('chrome');
  expect(c.get('chromeOptions')).toEqual({});

  process.env.CI = 'true';
  c = capabilities('chrome');
  expect(c.getBrowserName()).toBe('chrome');
  expect(c.get('chromeOptions')).toMatchObject({ 'args': ['--disable-gpu', '--headless'] });

  process.env.CI = oldProcess;
});

const lobsterURL = (file = 'simple.log') => {
  return `http://localhost:${process.env.LOBSTER_E2E_SERVER_PORT}/lobster?server=localhost:${process.env.LOBSTER_E2E_SERVER_PORT}%2Fapi%2Flog&url=${file}`;
};

export class Lobster {
  constructor(driver) {
    this._driver = driver;
    this._showdetails = false;
  }

  async init() {
    await this._driver.get(lobsterURL());
    await this._driver.wait(until.elementLocated(By.id('root')));

    // Click the never button the cache
    const never = await this._driver.wait(until.elementLocated(By.xpath(cacheNever)));
    try {
      await never.click();
    } catch (err) {
      console.log(err);
    }
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
}
