import { Key } from 'selenium-webdriver';
import { Lobster, makeDriver } from './e2eHelpers.spec';

describe('e2e', function() {
  e2e('search', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();
      await l.search('Line ');
      await l.search(Key.ENTER);

      let results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(5);

      await l.showDetails();
      await l.caseToggle();
      await l.showDetails();

      // assert no search results
      results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(0);

      await l.notFound();

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  }, 60000);

  e2e('highlight', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();

      await l.search('Line ');
      await l.search(Key.ENTER);

      let results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(5);

      // Add a highlight
      await l.addHighlight();

      await l.showDetails();
      await l.highlightLine();
      await l.showDetails();

      // Assert that the lines are highlighted
      const divs = await l.highlightedLines();
      expect(divs).toHaveLength(5);

      const line6 = await l.line(6);
      const line6Classes = await line6.getAttribute('class');
      expect(line6Classes.split(' ').includes('filtered')).toBe(false);
      results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(0);

      await l.showDetails();
      await l.caseToggle();
      await l.showDetails();

      const highlighted = await l.highlightedLines();
      expect(highlighted).toHaveLength(0);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  }, 60000);

  e2e('filter', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();

      await l.search('Line ');
      await l.search(Key.ENTER);

      await l.addFilter();

      let divs = await l.lines();
      expect(divs).toHaveLength(6);

      await l.showDetails();
      await l.caseToggle();
      await l.showDetails();

      divs = await l.lines();
      expect(divs).toHaveLength(2);

      await l.search('2');
      await l.search(Key.ENTER);

      await l.addFilter();

      await l.showDetails();
      await l.caseToggle();
      await l.showDetails();

      divs = await l.lines();
      expect(divs).toHaveLength(6);

      await l.showDetails();
      await l.logicToggle();
      await l.showDetails();

      divs = await l.lines();
      expect(divs).toHaveLength(3);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  }, 60000);

  e2e('logdrop', async (done) => {
    // Allow webdriver to interact with the dropFile elements in Firefox
    const opts = {
      firefox: {
        'moz:webdriverClick': false
      }
    };
    const driver = await makeDriver(done, opts);
    try {
      const l = new Lobster(driver);
      await l.init('/lobster', { skipWaitForLine: true });

      await l.dropFile('./e2e/simple.log');

      const divs = await l.lines();
      expect(divs).toHaveLength(7);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  }, 60000);

  e2eChrome('lobstercage', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init('/lobster/build/build1234/test/test1234', { cache: true });

      const divs0 = await l.lines();
      expect(divs0).toHaveLength(15);
      const l13 = await divs0[13].getText();
      const r = new RegExp('^enumerate: ([0-9]+)$');
      const matches = r.exec(l13);
      expect(matches).toHaveLength(2);
      const expected = `enumerate: ${parseInt(matches[1], 10) + 1}`;

      for (let i = 0; i < 5; ++i) {
        await l.refresh();
        await l.waitUntilDocumentReady();

        const divs1 = await l.lines();
        expect(divs1).toHaveLength(15);
        const l13Refresh = await divs1[13].getText();
        expect(l13Refresh).toBe(expected);
      }

      done();
    } catch (e) {
      done.fail(e);
    } finally {
      await driver.quit();
    }
  }, 60000);

  // react-list works by creating a div with height
  // (# of elements) * (height of each element). Given a large number of
  // elements, you get an extremely large floating point number, which the
  // Chrome render/firefox compositor eventually gives up on. Unfortunately,
  // this number is pretty low on Firefox vs Chrome (~447000*height vs
  // ~1.67 million*height). An infinite list implementation that does not rely
  // on a giant div is going to be necessary to fix this, but I haven't looked
  // into whether one exists, nor whether or not it's possible to make one
  e2e('render-stress', async (done) => {
    const driver = await makeDriver(done);
    try {
      // Element 0: Large number close to the maximum number of lines
      // Element 1: larger number that the browser gives up or can't render
      const table = [1600000, 1700000];
      if (process.env.LOBSTER_E2E_BROWSER === 'firefox') {
        table[0] = 447000;
      }
      const l = new Lobster(driver);
      await l.init(undefined, { url: `perf-${table[0]}.special.log` });

      await l.scrollToBottom();
      let lines = await l.lines();
      let token = await lines[lines.length - 1].getText();
      if (process.env.LOBSTER_E2E_BROWSER === 'firefox') {
        // Firefox routinely returns one of these
        const expected = ['FIND_THIS_TOKEN', 'line 446999', 'line 447000'];
        expect(expected.includes(token)).toBe(true);
      } else {
        expect(token).toBe('FIND_THIS_TOKEN');
      }

      await l.init(undefined, { url: `perf-${table[1]}.special.log` });
      await l.scrollToBottom();
      lines = await l.lines();

      token = await lines[lines.length - 1].getText();
      expect(token).not.toBe('FIND_THIS_TOKEN');
      expect(token.match('line [0-8]+')).not.toEqual(null);

      done();
    } catch (e) {
      done.fail(e);
    } finally {
      await driver.quit();
    }
  }, 60000);
});

// Test that each logviewer page can actually download logs
[
  ['/lobster/evergreen/test/testid1234', 13],
  ['/lobster/evergreen/task/taskid1234/1234/all', 15],
  ['/lobster/build/build1234/all', 14],
  ['/lobster/build/build1234/test/test1234', 15]
].forEach((table) => {
  e2e(`search-${table[0]}`, async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init(table[0]);

      const lines = await l.lines();
      expect(lines).toHaveLength(table[1]);

      await l.search('Line ');
      await l.search(Key.ENTER);

      const results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(10);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  }, 60000);
});
