import { Builder, Key } from 'selenium-webdriver';
import { capabilities, Lobster } from './e2eHelpers.spec';

e2e('index-find-with-enter', async(done) => {
  const driver = await new Builder().withCapabilities(capabilities('chrome')).build();
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
    expect(driver.quit()).resolves.toBe(undefined);
  }
}, 30000);

e2e('highlight', async(done) => {
  const driver = await new Builder().withCapabilities(capabilities('chrome')).build();
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
    expect(divs).toHaveLength(6);

    const line6 = await l.line(6);
    const line6Classes = await line6.getAttribute('class');
    expect(line6Classes.split(' ').includes('filtered')).toBe(false);
    results = await l.searchAndWordHighlights();
    expect(results).toHaveLength(0);

    await l.showDetails();
    await l.caseToggle();
    await l.showDetails();

    expect((await l.highlightedLines())).toHaveLength(0);

    done();
  } catch (err) {
    console.error(err);
  } finally {
    expect(driver.quit()).resolves.toBe(undefined);
  }
}, 30000);

e2e('filter', async(done) => {
  const driver = await new Builder().withCapabilities(capabilities('chrome')).build();
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
    console.error(err);
  } finally {
    expect(driver.quit()).resolves.toBe(undefined);
  }
}, 30000);
