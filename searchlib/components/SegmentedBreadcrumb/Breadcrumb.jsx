import React from 'react';
import { Breadcrumb } from 'semantic-ui-react';
import { firstChars } from '@eeacms/search/lib/utils';

const URLBreadcrumb = ({
  href,
  maxSegments = 3,
  short = false,
  maxChars = 10,
}) => {
  let url;
  try {
    url = new URL(href || '');
  } catch {
    // eslint-disable no-console
    console.warn('Invalid href (not a URL) in SegmentedBreadcrumb', href);

    return `${href}`;
  }

  const { pathname } = url;

  let index = 0;
  const newKey = () => {
    return index++;
  };

  const generateSimpleBreadcrumb = (pathname) => {
    const result = pathname
      .split('/')
      .filter((s) => !!s)
      .slice(0, maxSegments)
      .map((s) => ` / ${s}`);
    return result.join('');
  };

  return short ? (
    <span className="" title={generateSimpleBreadcrumb(pathname)}>
      {firstChars(generateSimpleBreadcrumb(pathname), maxChars)}
    </span>
  ) : (
    <Breadcrumb>
      <Breadcrumb.Section>{`${url.origin}`}</Breadcrumb.Section>
      {pathname
        .split('/')
        .filter((s) => !!s)
        .slice(0, maxSegments)
        .map((s) => (
          <div key={s + '2' + newKey()}>
            <Breadcrumb.Divider key={s + newKey()} />
            <Breadcrumb.Section key={s + '1' + newKey()}>
              {s}
            </Breadcrumb.Section>
          </div>
        ))}
    </Breadcrumb>
  );
};

export default URLBreadcrumb;
