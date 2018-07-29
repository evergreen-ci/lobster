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
    } finally {
      await driver.quit();
    }
  }, 60000);
});

[
  ['/lobster/evergreen/test/testid1234', 12],
  ['/lobster/evergreen/task/taskid1234/1234/all', 14],
  ['/lobster/build/build1234/all', 13],
  ['/lobster/build/build1234/test/test1234', 14]
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
    } finally {
      await driver.quit();
    }
  }, 15000);
});
