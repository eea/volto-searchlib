import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import NewBlockAddButton from './NewBlockAddButton';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
let store;
let outsideClickCallback;

jest.mock('@eeacms/search/lib/hocs/useOutsideClick', () => {
  return jest.fn((ref, callback) => {
    outsideClickCallback = callback;
  });
});

describe('NewBlockAddButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      userSession: {
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTY0NDM4MzA0NCwiZnVsbG5hbWUiOm51bGx9.cB_q3Q0Jhu8h2m_SDmmknodpDxDLfb4o-qY6Y2plE04',
      },
      intl: {
        locale: 'en',
        formatMessage: () => 'Select layout',
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const mockOnMutateBlock = jest.fn();
  const allowedBlocks = ['text', 'image'];
  const block = 'some-block-id';

  it('should render add block button initially', () => {
    const { container } = render(
      <Provider store={store}>
        <NewBlockAddButton
          allowedBlocks={allowedBlocks}
          block={block}
          onMutateBlock={mockOnMutateBlock}
        />
      </Provider>,
    );
    expect(screen.getByTitle('Add block')).toBeInTheDocument();
    expect(container.querySelector('.blocks-chooser')).not.toBeInTheDocument();
  });

  it('should open BlockChooser on button click', () => {
    const { container } = render(
      <Provider store={store}>
        <NewBlockAddButton
          allowedBlocks={allowedBlocks}
          block={block}
          onMutateBlock={mockOnMutateBlock}
        />
      </Provider>,
    );
    fireEvent.click(screen.getByTitle('Add block'));
    expect(container.querySelector('.blocks-chooser')).toBeInTheDocument();
  });

  it('should close BlockChooser on outside click', () => {
    const { container } = render(
      <Provider store={store}>
        <NewBlockAddButton
          allowedBlocks={allowedBlocks}
          block={block}
          onMutateBlock={mockOnMutateBlock}
        />
      </Provider>,
    );

    // Open the BlockChooser
    fireEvent.click(screen.getByTitle('Add block'));
    expect(container.querySelector('.blocks-chooser')).toBeInTheDocument();

    // Simulate an outside click
    act(() => {
      outsideClickCallback();
    });

    // Check if the BlockChooser is closed
    expect(container.querySelector('.blocks-chooser')).toBeNull();
  });
});
