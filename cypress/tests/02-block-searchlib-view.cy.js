import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Searchlib Block: View Mode Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Searchlib Block: Add and save', () => {
    const titleSelector = '.block.inner.title [contenteditable="true"]';
    cy.get(titleSelector).clear();
    cy.get(titleSelector).type('Searchlib Test');

    cy.get('.documentFirstHeading').contains('Searchlib Test');

    cy.get(titleSelector).type('{enter}');

    // Add searchlib block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Common').click();
    cy.get('.content.active.common .button.searchlib')
      .click({ force: true });

    // Save
    cy.get('#toolbar-save').click({ force: true });
    cy.contains('Searchlib Test');
  });
});