/**
 * An advanced search input box. Features:
 * - autocomplete
 * - voice input
 * - search phrases
 */

import React from 'react';
import { Icon, Image } from 'semantic-ui-react';

import { useAtom } from 'jotai';
import { showExtraFacetsAtom } from './state';
import { useSearchContext, useAppConfig } from '@eeacms/search/lib/hocs';
import searchSVG from './icons/search.svg';

const SVGIcon = ({ name, size, color, className, title, onClick }) =>
  typeof name === 'string' ? (
    <Image src={name} />
  ) : (
    <svg
      xmlns={name.attributes && name.attributes.xmlns}
      viewBox={name.attributes && name.attributes.viewBox}
      style={{ height: size, width: 'auto', fill: color || 'currentColor' }}
      className={className ? `icon ${className}` : 'icon'}
      onClick={onClick}
      dangerouslySetInnerHTML={{
        __html: title ? `<title>${title}</title>${name.content}` : name.content,
      }}
    />
  );

function SearchInput({
  getAutocomplete,
  getButtonProps,
  getInputProps,
  onChange,
  onSubmit,
  mode,
}) {
  const { appConfig } = useAppConfig();
  const { sortOptions } = appConfig;

  const inputProps = getInputProps();
  const { setSearchTerm, setSort } = useSearchContext();

  const { filters, addFilter, setFilter, ...domProps } = inputProps;
  const searchTerm = inputProps.value;

  const searchPhrases = inputProps.value.split('|') || []; //.filter((p) => !!p);
  const currentTerm = searchPhrases.pop();

  const inpRef = React.useRef();
  const [, setShowExtraFacets] = useAtom(showExtraFacetsAtom);

  React.useEffect(() => {
    mode === 'view' && inpRef.current && inpRef.current.focus();
  }, [searchTerm, mode]);

  return (
    <>
      <div className="search-input">
        <div className="terms-box">
          {searchPhrases.length === 0 ? (
            <input
              {...domProps}
              enterKeyHint="search"
              value={currentTerm}
              ref={inpRef}
              className=""
              placeholder={searchPhrases?.length ? null : domProps.placeholder}
              onChange={(event) => {
                setShowExtraFacets(false);
                let {
                  target: { value },
                } = event;
                value = [...searchPhrases, value].join('|');
                inputProps.onChange({ target: { value } });
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Home' || ev.key === 'End') {
                  ev.preventDefault();
                  const {
                    selectionStart,
                    selectionEnd,
                    selectionDirection,
                  } = ev.currentTarget;
                  let from = ev.key === 'Home' ? 0 : 10000;
                  let to = ev.key === 'Home' ? 0 : 10000;
                  let direction = 'forward';
                  if (ev.shiftKey) {
                    if (ev.key === 'Home') {
                      from = 0;
                      to = selectionEnd;
                      if (selectionDirection === 'forward') {
                        to = selectionStart;
                      }
                      direction = 'backward';
                    }
                    if (ev.key === 'End') {
                      from = selectionStart;
                      to = 10000;
                      if (selectionDirection === 'backward') {
                        from = selectionEnd;
                      }
                      direction = 'forward';
                    }
                  }
                  ev.currentTarget.setSelectionRange(from, to, direction);
                  return;
                }
                if (ev.key === 'Backspace') {
                  if (currentTerm === '' && searchPhrases.length > 0) {
                    const lastPhrase = searchPhrases[searchPhrases.length - 1];
                    const fakeEvent = {
                      target: {
                        value: `${searchPhrases
                          .slice(0, searchPhrases.length - 1)
                          .join('|')}|${lastPhrase}`,
                      },
                    };
                    ev.preventDefault();
                    inputProps.onChange(fakeEvent);
                    return;
                  }
                }

                return inputProps.onKeyDown(ev);
              }}
              onBlur={() => {}}
            />
          ) : (
            ''
          )}

          <div className="input-controls">
            {(searchTerm || '').trim() && (
              <div className="ui button basic clear-button">
                <Icon
                  name="close"
                  role="button"
                  onClick={() => {
                    // inputProps.onChange({ target: { value: '' } });
                    setSearchTerm('', { shouldClearFilters: false });

                    const sNew = sortOptions.filter((s) => s.name === 'Newest');
                    if (sNew.length > 0) {
                      setSort(sNew[0].value, sNew[0].direction);
                    }
                    // onSubmit();
                  }}
                />
              </div>
            )}
          </div>

          <div className="terms-box-left">
            <div
              className="search-icon"
              role="button"
              tabIndex={0}
              onKeyDown={() => {
                setSearchTerm(currentTerm, { shouldClearFilters: false });
              }}
              onClick={() => {
                setSearchTerm(currentTerm, { shouldClearFilters: false });
              }}
            >
              <SVGIcon name={searchSVG} />
            </div>
          </div>

          {getAutocomplete()}
        </div>
      </div>
    </>
  );
}

export default SearchInput;
