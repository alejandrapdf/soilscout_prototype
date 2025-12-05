describe('Home Screen Web UI Tests', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8081'); // Expo Web must be running
  });

  it('loads dashboard correctly', () => {
    cy.contains('Dashboard').should('exist');
    cy.contains('Metrics').should('exist');
    cy.contains('Map').should('exist');
    cy.contains('Scouts').should('exist');
  });

  it('shows navigation buttons', () => {
    cy.contains('Dashboard').should('exist');
    cy.contains('Sensors').should('exist');
    cy.contains('Map').should('exist');
  });


  it('opens scout alert when clicked', () => {
  cy.on('window:alert', (msg) => {
    expect(msg).to.include('Sensor');
  });

  cy.contains('Scout 1').click();
});

});
