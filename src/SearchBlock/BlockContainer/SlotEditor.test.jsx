import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SlotEditor from './SlotEditor';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
let store;
const mockData = {
  'slotA-any': { '@type': 'slotA-any' },
  'slotA-isLandingPage': { '@type': 'slotA-isLandingPage' },
  'slotA-hasResults': { '@type': 'slotA-hasResults' },
  'slotA-hasNoResults': { '@type': 'slotA-hasNoResults' },
  'slotB-any': { '@type': 'slotB-any' },
  'slotB-isLandingPage': { '@type': 'slotB-isLandingPage' },
  'slotB-hasResults': { '@type': 'slotB-hasResults' },
  'slotB-hasNoResults': { '@type': 'slotB-hasNoResults' },
};

describe('SlotEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      intl: {
        locale: 'en',
        formatMessage: () => 'Select layout',
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders tabs for each search state', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SlotEditor
            slot="slotA"
            data={mockData}
            selectedSlotFill="slotA-any"
            onChangeSlotfill={() => {}}
            onDeleteSlotfill={() => {}}
            onSelectSlotfill={() => {}}
            metadata={{}}
            mode="view"
          />
        </MemoryRouter>
      </Provider>,
    );
  });

  //   it('calls onChangeSlotfill when a tab is clicked', () => {
  //     const onChangeSlotfill = jest.fn();

  //     const { queryByText } = render(
  //       <Provider store={store}>
  //         <MemoryRouter>
  //           <SlotEditor
  //             slot="slotA"
  //             data={mockData}
  //             selectedSlotFill="slotA-state1"
  //             onChangeSlotfill={onChangeSlotfill}
  //             onDeleteSlotfill={() => {}}
  //             onSelectSlotfill={() => {}}
  //             metadata={{}}
  //             mode="view"
  //           />
  //         </MemoryRouter>
  //       </Provider>,
  //     );

  //     const state2Tab = queryByText(/slotA-any/);
  //     fireEvent.change(state2Tab, { target: { value: 'slotB-any' } });

  //     // Ensure onChangeSlotfill is called with the correct blockId
  //     expect(onChangeSlotfill).toHaveBeenCalledWith('slotA-state2');
  //   });

  //   it('calls onDeleteSlotfill when the delete button is clicked', () => {
  //     const onDeleteSlotfill = jest.fn();

  //     const { getByLabelText } = render(
  //       <MemoryRouter>
  //         <SlotEditor
  //           slot="slotA"
  //           data={mockData}
  //           selectedSlotFill="slotA-state1"
  //           onChangeSlotfill={() => {}}
  //           onDeleteSlotfill={onDeleteSlotfill}
  //           onSelectSlotfill={() => {}}
  //           metadata={{}}
  //           mode="view"
  //         />
  //       </MemoryRouter>,
  //     );

  //     const deleteButton = getByLabelText('Delete block');
  //     fireEvent.click(deleteButton);

  //     // Ensure onDeleteSlotfill is called with the correct blockId
  //     expect(onDeleteSlotfill).toHaveBeenCalledWith('slotA-state1');
  //   });
});
