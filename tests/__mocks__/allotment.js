// Mock for the Allotment library
const React = require('react');

function createMockComponent(displayName) {
  const component = function (props) {
    return React.createElement(
      'div',
      {
        'data-testid': displayName.toLowerCase(),
        ...props,
      },
      props.children
    );
  };
  component.displayName = displayName;
  return component;
}

const MockAllotment = createMockComponent('Allotment');
MockAllotment.Pane = createMockComponent('AllotmentPane');

module.exports = {
  Allotment: MockAllotment,
  __esModule: true,
};
