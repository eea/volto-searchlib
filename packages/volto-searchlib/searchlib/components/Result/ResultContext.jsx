import React from 'react';
// import { DateTime } from '@eeacms/search/components';

// TODO: this is rather hackish and possibly insecure. Ideally all results
// already provide simple text instead of HTML
const normalizeStr = (str) => {
  let tmp = document.createElement('DIV');
  tmp.innerHTML = str;
  str = tmp.textContent || tmp.innerText || '';
  return str;
};

function Highlight(props) {
  // const { result } = props;
  const { fragments = {} } = props;
  return Object.keys(fragments).map((name, i) => {
    return (
      <span className={`highlight-${name}`} key={`${i}-${name}`}>
        {/*<span className="date">
          <DateTime format="DATE_MED" value={result.issued} /> &mdash;{' '}
        </span>*/}
        {fragments[name].map((f, j) => (
          <span className="fragment" key={`${i}-${j}-${name}`}>
            <span dangerouslySetInnerHTML={{ __html: f }} />
            {` ... `}
          </span>
        ))}
      </span>
    );
  });
}

const ResultContext = (props) => {
  const { result } = props;
  const description = normalizeStr(result.description || '');
  const max_length = 250;

  return result.highlight ? (
    <Highlight fragments={result.highlight} result={result} />
  ) : (
    <span>
      {/*<span className="date">
        <DateTime format="DATE_MED" value={result.issued} /> &mdash;{' '}
      </span>*/}

      {description?.slice(0, max_length)}
      {description?.length > max_length - 3 ? <>&#8230;</> : ''}
    </span>
  );
};

export default ResultContext;
