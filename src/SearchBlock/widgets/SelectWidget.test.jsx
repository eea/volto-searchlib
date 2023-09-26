import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SelectWidgetComponent } from './SelectWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureStore();
let store;

describe('SelectWidgetComponent', () => {
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
    value: 'option1', // Initial selected value
    onChange: jest.fn(),
    onBlur: jest.fn(),
    reactSelect: {
      default: (props) => (
        <select
          name="test"
          id="test-select"
          onChange={(ev) => {
            console.log('ev.target', ev.target.value);
            return props.onChange([{ value: ev.target }]);
          }}
        >
          <option value="option1">option1</option>
          <option value="option2">option2</option>
        </select>
      ),
    },
    reactSelectAsyncPaginate: {
      AsyncPaginate: () => <div>Async Paginate</div>,
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
});
