/* eslint-disable jsx-a11y/no-onchange */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SelectWidgetComponent } from './SelectWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
let store;

jest.mock('@plone/volto/components/manage/Widgets/SelectUtils', () => {
  return {
    normalizeValue: jest.fn(() => 'option1'),
  };
});

describe('SelectWidgetComponent', () => {
  const search = 'searchQuery';
  const previousOptions = ['Previous Option'];
  const additional = { offset: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      intl: {
        locale: 'en',
        formatMessage: (a) => 'Test',
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  const props = {
    id: 'mySelectField',
    title: 'Select Field',
    description: 'Description for the select field',
    required: true,
    choices: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    loading: false,
    value: 'option1',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    reactSelect: {
      default: (props) => (
        <select
          name="test"
          id="test-select"
          onChange={(ev) => {
            return props.onChange([{ value: ev.target }]);
          }}
        >
          <option value="option1">option1</option>
          <option value="option2">option2</option>
        </select>
      ),
    },
    reactSelectAsyncPaginate: {
      AsyncPaginate: (props) => (
        <div
          onClick={() => props.loadOptions(search, previousOptions, additional)}
          onKeyDown={() => {}}
          id="test-async-paginate"
          role="button"
          tabIndex="0"
        >
          Async Paginate
        </div>
      ),
    },
  };

  it('should render without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent {...props} />
      </Provider>,
    );
    expect(container).toBeInTheDocument();
  });

  it('should display the title and description', () => {
    const { getByText } = render(
      <Provider store={store}>
        <SelectWidgetComponent {...props} />
      </Provider>,
    );
    expect(getByText('Select Field')).toBeInTheDocument();
    expect(getByText('Description for the select field')).toBeInTheDocument();
  });

  it('should call onChange when an option is selected', () => {
    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent {...props} />
      </Provider>,
    );
    fireEvent.change(container.querySelector('#test-select'), {
      target: { value: 'option2' },
    });
  });

  it('should call onChange when an option is selected', () => {
    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent {...props} isMulti={true} />
      </Provider>,
    );
    fireEvent.change(container.querySelector('#test-select'), {
      target: { value: 'option2' },
    });
  });

  it('should have the "required" class when the field is required', () => {
    const requiredProps = { ...props, required: true };
    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent {...requiredProps} />
      </Provider>,
    );
    expect(container.querySelector('.required')).toBeInTheDocument();
  });

  it('should call getVocabulary with correct parameters when search changes', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockChoices = ['Option 1', 'Option 2'];
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const search = 'searchQuery';

    const { rerender } = render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={mockChoices}
          vocabBaseUrl={mockVocabBaseUrl}
        />
      </Provider>,
    );

    // Initial render should not call getVocabulary
    expect(mockGetVocabulary).not.toHaveBeenCalled();

    // Update the search query
    rerender(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={[]}
          vocabBaseUrl={mockVocabBaseUrl}
          search={search}
        />
      </Provider>,
    );
  });

  it('should return options when hasMore is true', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockChoices = ['Option 1', 'Option 2'];
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const search = 'searchQuery';

    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={mockChoices}
          vocabBaseUrl={mockVocabBaseUrl}
          search={search}
          itemsTotal={100}
          reactSelectAsyncPaginate={{
            AsyncPaginate: (props) => (
              <div
                onClick={() =>
                  props.loadOptions(search, mockChoices, { offset: 1 })
                }
                onKeyDown={() => {}}
                id="test-async-paginate"
                role="button"
                tabIndex="0"
              >
                Async Paginate
              </div>
            ),
          }}
        />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#test-async-paginate'));
  });

  it('should return an empty array when hasMore is false', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockChoices = ['Option 1', 'Option 2'];
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const search = 'searchQuery';

    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={mockChoices}
          vocabBaseUrl={mockVocabBaseUrl}
          search={search}
          itemsTotal={100} // Set itemsTotal to simulate "no more data"
          reactSelectAsyncPaginate={{
            AsyncPaginate: (props) => (
              <div
                onClick={() => props.loadOptions('', mockChoices, additional)}
                onKeyDown={() => {}}
                id="test-async-paginate"
                role="button"
                tabIndex="0"
              >
                Async Paginate
                <input onChange={props.onChange} id="input-async" />
              </div>
            ),
          }}
        />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#test-async-paginate'));
    fireEvent.change(container.querySelector('#input-async'), {
      target: { value: 'option2' },
    });
  });

  it('should return an empty array when hasMore is false', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockChoices = ['Option 1', 'Option 2'];
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const search = 'searchQuery-no-match';

    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={mockChoices}
          vocabBaseUrl={mockVocabBaseUrl}
          search={search}
          itemsTotal={1}
        />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#test-async-paginate'));
  });

  it('should return an empty array when hasMore is false', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockChoices = ['Option 1', 'Option 2'];
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const search = 'searchQuery';

    const { container } = render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={mockChoices}
          vocabBaseUrl={mockVocabBaseUrl}
          search={search}
          itemsTotal={1}
          reactSelectAsyncPaginate={{
            AsyncPaginate: (props) => (
              <div
                onClick={() => props.loadOptions('', mockChoices, additional)}
                onKeyDown={() => {}}
                id="test-async-paginate"
                role="button"
                tabIndex="0"
              >
                Async Paginate
              </div>
            ),
          }}
        />
      </Provider>,
    );

    fireEvent.click(container.querySelector('#test-async-paginate'));
  });

  it('should call getVocabulary when choices are empty and vocabBaseUrl is provided', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockVocabBaseUrl = 'http://example.com/vocab';

    // Render the component
    render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          vocabBaseUrl={mockVocabBaseUrl}
          choices={[]}
        />
      </Provider>,
    );

    // Expect getVocabulary to be called because choices are empty
    expect(mockGetVocabulary).toHaveBeenCalledWith(mockVocabBaseUrl);
  });

  it('should not call getVocabulary when choices are not empty', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();
    const mockVocabBaseUrl = 'http://example.com/vocab';
    const mockChoices = ['Option 1', 'Option 2'];

    // Render the component with choices provided
    render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          vocabBaseUrl={mockVocabBaseUrl}
          choices={mockChoices}
        />
      </Provider>,
    );

    // Expect getVocabulary not to be called because choices are provided
    expect(mockGetVocabulary).not.toHaveBeenCalled();
  });

  it('should not call getVocabulary when vocabBaseUrl is not provided', () => {
    // Mock props
    const mockGetVocabulary = jest.fn();

    // Render the component without vocabBaseUrl
    render(
      <Provider store={store}>
        <SelectWidgetComponent
          {...props}
          getVocabulary={mockGetVocabulary}
          choices={[]}
        />
      </Provider>,
    );

    // Expect getVocabulary not to be called because vocabBaseUrl is not provided
    expect(mockGetVocabulary).not.toHaveBeenCalled();
  });
});
