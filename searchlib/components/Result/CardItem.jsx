import React from 'react';
import { withSearch } from '@elastic/react-search-ui';
import { Button, Card, Image, Label } from 'semantic-ui-react';
import { DateTime, StringList } from '@eeacms/search';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import { useAtom } from 'jotai';
import { moreLikeThisAtom } from '@eeacms/search/state';
import cx from 'classnames';
import ResultContext from './ResultContext';
import { Icon } from '@eeacms/search/components';

// const normalizeStr = (str) => {
//   let tmp = document.createElement('DIV');
//   tmp.innerHTML = str;
//   str = tmp.textContent || tmp.innerText || '';
//   return str;
// };

const ExternalLink = (props) => {
  return (
    <a
      className={props.className}
      href={props.href}
      target="_blank"
      rel="noreferrer"
      style={props.style}
    >
      {props.children}
    </a>
  );
};

const CardItemComponent = withSearch(({ setFilter, removeFilter }) => ({
  setFilter,
  removeFilter,
}))((props) => {
  // console.log('props', props);
  const { result } = props;
  const context = useSearchContext();
  const { setFilter, removeFilter, setSearchTerm } = context;
  const { appConfig, registry } = useAppConfig();
  const thumbFactoryName = appConfig.cardViewParams.getThumbnailUrl;

  const getThumb =
    registry.resolve[thumbFactoryName] ||
    ((result, config, fallback) => fallback);

  const thumbUrl = getThumb(
    result,
    appConfig,
    // TODO: use a configured default
    'https://react.semantic-ui.com/images/wireframe/white-image.png',
  );

  const url = props.urlField ? result[props.urlField]?.raw : result.id;
  const source = url
    .replace('https://', '')
    .replace('http://', '')
    .split('/')[0];
  const [, setMoreLikeThis] = useAtom(moreLikeThisAtom);

  const [hovered, setHovered] = React.useState(false);

  const clusters = result.clusterInfo;

  let metaType = result[props.metatypeField]?.raw || '';
  if (metaType.length === 0) {
    metaType = ['Other'];
  }

  return (
    <Card
      className={cx('card-item', { hovered })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Label className="meta-type">
        <StringList value={metaType} />
      </Label>

      <Image
        src={thumbUrl}
        wrapped
        ui={false}
        fluid
        centered
        style={{ backgroundImage: `url('${thumbUrl}')` }}
        as={ExternalLink}
        href={url}
        target="_blank"
        rel="noreferrer"
        label={
          (result.daysSinceIssued < 30 && (
            <Label color="yellow" ribbon="right">
              New
            </Label>
          )) ||
          (result.isExpired && (
            <Label color="teal" ribbon="right">
              Archived
            </Label>
          ))
        }
      />

      <Card.Content>
        <Card.Meta>
          <p className="source">
            <span>Source: </span>
            <ExternalLink href={url}>{source}</ExternalLink>
          </p>
        </Card.Meta>
        <Card.Header>
          <ExternalLink href={url}>{result.title}</ExternalLink>
        </Card.Header>
        <Card.Description>
          {props.children ? props.children : <ResultContext {...props} />}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <Card.Meta>
          <StringList value={result.tags} />
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Card.Meta>
          <DateTime format="DATE_MED" value={result.issued} />
        </Card.Meta>
      </Card.Content>
      <Card.Content extra className="controls">
        <Card.Meta>
          <Button
            compact
            floated="left"
            color="green"
            size="mini"
            onClick={() => {
              removeFilter('lessLikeThis');
              setSearchTerm('');
              setMoreLikeThis(result);
              setFilter('moreLikeThis', result._original._id, 'none');
            }}
          >
            more like this
          </Button>
          {/* <Button */}
          {/*   compact */}
          {/*   floated="right" */}
          {/*   color="red" */}
          {/*   size="mini" */}
          {/*   onClick={() => { */}
          {/*     removeFilter('moreLikeThis'); */}
          {/*     setFilter('lessLikeThis', result._original._id, 'none'); */}
          {/*   }} */}
          {/* > */}
          {/*   less like this */}
          {/* </Button> */}
          <div className="card-icons">
            {Object.keys(clusters).map((cluster, index) => (
              <Button
                key={index}
                className="metaButton"
                floated="right"
                target="_blank"
                as="a"
                href={result.id}
                circular
                size="mini"
                compact
                icon={
                  <div className="card-icon">
                    <Icon {...clusters[cluster].icon} size="mini" />
                  </div>
                }
              ></Button>
            ))}
          </div>
        </Card.Meta>
      </Card.Content>
    </Card>
  );
});

const CardItem = (props) => <CardItemComponent {...props} />;

export default CardItem;
