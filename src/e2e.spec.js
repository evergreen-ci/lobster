import { Key } from 'selenium-webdriver';
import { Lobster, makeDriver, lobsterURL, lobsterServer } from './e2eHelpers.spec';

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
      await l.caseToggleSearch();
      await l.showDetails();

      // assert no search results
      results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(0);

      await l.notFound();

      await l.search('c++');
      await l.notFound();
      results = await l.searchAndWordHighlights();
      expect(results).toHaveLength(0);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  });

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
      expect(await driver.getCurrentUrl()).toBe(`http://${lobsterServer()}/lobster/logdrop#bookmarks=0%2C6&h~=100~Line%20&server=${encodeURIComponent(lobsterServer())}%2Fapi%2Flog&url=simple.log`);

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
      await l.caseToggleHighlight(1);
      await l.showDetails();

      const highlighted = await l.highlightedLines();
      expect(highlighted).toHaveLength(0);

      done();
    } catch (err) {
      done.fail(err);
    } finally {
      await driver.quit();
    }
  });

  e2e('filter', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();

      // Disable expandable rows
      await l.showDetails();
      await l.expandableRowsToggle(false)
      await l.showDetails();

      await l.search('Line ');
      await l.search(Key.ENTER);

      await l.addFilter();

      expect(await driver.getCurrentUrl()).toBe(`http://${lobsterServer()}/lobster/logdrop#bookmarks=0%2C6&f~=100~Line%20&server=${encodeURIComponent(lobsterServer())}%2Fapi%2Flog&url=simple.log`);

      let divs = await l.lines();
      expect(divs).toHaveLength(6);

      await l.showDetails();
      await l.caseToggleFilter(1);
      await l.showDetails();

      divs = await l.lines();
      expect(divs).toHaveLength(2);

      await l.search('2');
      await l.search(Key.ENTER);

      await l.addFilter();
      expect(await driver.getCurrentUrl()).toBe(`http://${lobsterServer()}/lobster/logdrop#bookmarks=0%2C6&f~=101~Line%20&f~=100~2&server=${encodeURIComponent(lobsterServer())}%2Fapi%2Flog&url=simple.log`);
      await l.showDetails();
      await l.caseToggleFilter(1);
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
  });

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
  });

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
  });

  // react-list works by creating a div with height
  // (# of elements) * (height of each element). Given a large number of
  // elements, you get an extremely large floating point number, which the
  // Chrome render/firefox compositor eventually gives up on. Unfortunately,
  // this number is pretty low on Firefox vs Chrome (~447000*height vs
  // ~1.67 million*height). An infinite list implementation that does not rely
  // on a giant div is going to be necessary to fix this, but I haven't looked
  // into whether one exists, nor whether or not it's possible to make one
  // 2019-01-29 (Ruslan) -- reduced FF limit a little bit due to expandale rows
  e2e('render-stress', async (done) => {
    const driver = await makeDriver(done);
    try {
      // Element 0: Large number close to the maximum number of lines
      // Element 1: larger number that the browser gives up or can't render
      const table = [1600000, 1700000];
      if (process.env.LOBSTER_E2E_BROWSER === 'firefox') {
        table[0] = 397000 // was 447000;
      }
      const l = new Lobster(driver);
      await l.init(undefined, { url: `perf-${table[0]}.special.log` });

      await l.scrollToBottom();
      let lines = await l.lines();
      let token = await lines[lines.length - 1].getText();
      if (process.env.LOBSTER_E2E_BROWSER === 'firefox') {
        // Firefox routinely returns one of these
        const expected = ['FIND_THIS_TOKEN', 'line 396999', 'line 397000'];
        expect(expected.includes(token)).toBe(true);
      } else {
        const expected = ['FIND_THIS_TOKEN', 'line 1600000', 'line 1599999'];
        expect(expected.includes(token)).toBe(true);
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
  }, 75000);

  e2e('changeurl', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();

      await l.get(`${lobsterURL('simple.log')}#bookmarks=0,6&f=10Line&h=11Line 4`);

      // Disable expandable rows
      await l.showDetails();
      await l.expandableRowsToggle(false)
      await l.showDetails();

      const lines = await l.lines();
      const highlights = await l.highlightedLines();
      expect(lines).toHaveLength(6);
      expect(await (lines[4].getText())).toBe('line 4');
      expect(highlights).toHaveLength(1);

      done();
    } catch (e) {
      done.fail(e);
    } finally {
      await driver.quit();
    }
  });

  e2e('apply-new-log', async (done) => {
    const driver = await makeDriver(done);
    try {
      const l = new Lobster(driver);
      await l.init();

      let lines = await l.lines();
      expect(lines).toHaveLength(7);

      await l.showDetails();
      await l.setNewLobsterServerLogFile('clap.txt');
      await l.submitLobsterServerLogFile();
      await l.showDetails();

      lines = await l.lines();
      expect(lines).toHaveLength(5);

      done();
    } catch (e) {
      done.fail(e);
    } finally {
      await driver.quit();
    }
  });
});

// Test that each logviewer page can actually download logs
[
  ['/lobster/evergreen/test/testid1234', 13],
  ['/lobster/evergreen/test/taskid1234/5/testid1234', 15],
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
  });
});
