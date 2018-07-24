import { Builder, Key } from 'selenium-webdriver';
import { capabilities, Lobster } from './e2eHelpers.spec';

describe('e2e', function() {
  beforeEach(async () => {
    this.driver = await new Builder().withCapabilities(capabilities('chrome')).build();
  });
  afterEach(async () => {
    expect(this.driver.quit()).resolves.toBe(undefined);
  });
  e2e('index-find-with-enter', async (done) => {
    try {
      const l = new Lobster(this.driver);
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
      expect(err).toBe(null);
    }
  }, 30000);

  e2e('highlight', async (done) => {
    try {
      const l = new Lobster(this.driver);
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
      expect(err).toBe(null);
    }
  }, 30000);

  e2e('filter', async (done) => {
    try {
      const l = new Lobster(this.driver);
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
      expect(err).toBe(null);
    }
  }, 30000);
});

