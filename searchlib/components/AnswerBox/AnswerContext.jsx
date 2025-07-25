import React from 'react';

import ExternalLink from '@eeacms/search/components/Result/ExternalLink';
import { ResultSource, DateTime, StringList } from '@eeacms/search/components'; //, StringList, Iconn

import { highlightUrl } from './utils';

import { useAppConfig } from '@eeacms/search/lib/hocs';

const WHITESPACE_RE = /\n|\t/;

const AnswerContext = ({ item, answerItem }) => {
  const { full_context = '', context, answer } = answerItem;
  const { registry } = useAppConfig();
  const UniversalCard = registry.resolve['UniversalCard'].component;
  // const clusters = item.clusterInfo;
  const start = (full_context || context || '').indexOf(answer);

  const pre = (
    full_context
      ? full_context.slice(0, start)
      : context.slice(0, answerItem.offset_start)
  ).replace(WHITESPACE_RE, ' ');
  const ans = (
    full_context
      ? answer
      : context.slice(answerItem.offset_start, answerItem.offset_end)
  ).replace(WHITESPACE_RE, ' ');
  const post = (
    full_context
      ? full_context.slice(start + answer.length, full_context.length)
      : context.slice(answerItem.offset_end, answerItem.context.length)
  ).replace(WHITESPACE_RE, ' ');

  const answerItems = {
    title: (
      <ExternalLink href={highlightUrl(item.href, ans)}>
        {item.title}
      </ExternalLink>
    ),
    description: (
      <>
        <span dangerouslySetInnerHTML={{ __html: pre }}></span>
        <ExternalLink href={highlightUrl(item.href, ans)}>
          <span
            className="answer__highlighted"
            dangerouslySetInnerHTML={{ __html: ans }}
          ></span>
        </ExternalLink>{' '}
        <span dangerouslySetInnerHTML={{ __html: post }}></span>
      </>
    ),
    // preview_image_url: result.hasImage ? result.thumbUrl : undefined,
    extra: (
      <div>
        <div className="result-bottom">
          <div className="result-info">
            <span className="result-info-title">Published: </span>
            <DateTime format="DATE_MED" value={item.issued} />
          </div>
          <div className="result-info">
            <span className="result-info-title">Topics: </span>
            <StringList value={item.tags} />
          </div>
        </div>
        <div>
          <ResultSource item={item} />
        </div>
      </div>
    ),
  };

  const itemModel = {
    // hasImage: result.hasImage,
    hasDescription: true,
    imageOnRightSide: true,
    '@type': 'searchItem',
  };

  return <UniversalCard item={answerItems} itemModel={itemModel} />;
};

export default AnswerContext;
