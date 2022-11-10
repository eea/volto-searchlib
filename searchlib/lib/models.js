import registry from '@eeacms/search/registry';
import { DateTime } from 'luxon';

function getHighlight(hit, fieldName) {
  if (
    !hit.highlight ||
    !hit.highlight[fieldName] ||
    hit.highlight[fieldName].length < 1
  ) {
    return;
  }

  return hit.highlight[fieldName][0];
}

const toObject = (field, value, snippet, field_filters) => {
  const blacklist = field_filters[field]?.blacklist || [];
  const whitelist = field_filters[field]?.whitelist || [];

  if (!Array.isArray(value)) {
    value = [value];
  }

  let filtered_value = value.filter((val) => blacklist.indexOf(val) === -1);
  if (whitelist.length > 0) {
    filtered_value = filtered_value.filter(
      (val) => whitelist.indexOf(val) !== -1,
    );
  }

  if (filtered_value.length === 1) {
    filtered_value = filtered_value[0];
  }

  return { raw: filtered_value, ...(snippet && { snippet }) };
};

export const convertHitToResult = (record, field_filters) => {
  const addEachKeyValueToObject = (acc, [key, value]) => ({
    ...acc,
    [key]: value,
  });

  const rec = Object.entries(record._source || {})
    .map(([fieldName, fieldValue]) => [
      fieldName,
      toObject(
        fieldName,
        fieldValue,
        getHighlight(record, fieldName),
        field_filters || {},
      ),
    ])
    .reduce(addEachKeyValueToObject, {});

  rec.id = record._id || record.id;

  if (rec.source) {
    // compatibility with haystack proxy
    rec._source = rec.source;
    delete rec._source;
  }

  rec._meta = Object.assign(
    {},
    ...Object.keys(record)
      .filter((n) => n !== '_source')
      .map((n) => ({ [n]: record[n] })),
  );

  return rec;
};

function _getThumb() {
  const thumbFactoryName = this.appConfig.resultItemModel.getThumbnailUrl;
  const getThumb =
    registry.resolve[thumbFactoryName] ||
    ((result, config, fallback) => fallback);

  return getThumb(this._result, this.appConfig);
}

/**
 * Superclass for result models.
 *
 * It proxies the original hit. See ResultModel for example how to use this.
 */
export class BasicModel {
  constructor(record, config, field_filters) {
    const basic = {
      appConfig: config,
      _original: record,
      _result: convertHitToResult(
        record,
        field_filters || config.field_filters,
      ),
    };

    return new Proxy(basic, this);
  }

  get(target, name) {
    if (target.hasOwnProperty(name)) return target[name];

    const proto = Object.getPrototypeOf(this);
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    if (descriptors[name] && descriptors[name].get) {
      const value = descriptors[name].get.bind(target).apply();
      delete target[name];
      target[name] = value;
      return target[name];
    } else {
      return target._result[name];
    }
  }
}

export class ResultModel extends BasicModel {
  get daysSinceIssued() {
    const raw = this._result['issued']?.raw;
    const issued = raw ? DateTime.fromISO(raw) : DateTime.local();
    const res = DateTime.local().diff(issued, 'days').as('days');
    return res;
  }

  get id() {
    return this.id?.raw;
  }

  get isNew() {
    return this.daysSinceIssued < 30;
  }

  get issued() {
    const raw = this._result['issued']?.raw;
    return raw ? DateTime.fromISO(raw) : DateTime.local();
  }

  get expires() {
    const raw = this._result['expires']?.raw;
    return raw ? DateTime.fromISO(raw) : null;
  }

  // get isExpired() {
  //   return this.expires ? this.expires < DateTime.local() : false;
  // }

  get isExpired() {
    return this._result?.['expires']?.raw
      ? Date.parse(this._result['expires']?.raw) < Date.now()
      : false;
  }

  get metaCategories() {
    return this._result.subject?.raw;
  }

  get clusterIcon() {
    const clusterIcons = this.appConfig.icons['Content types'];
    const type = this._result.objectProvides?.raw;
    const icon = clusterIcons[type] || clusterIcons.fallback;
    return icon;
  }

  get clusterInfo() {
    const clusterIcons = this.appConfig.icons['Content types'];

    let clusters = {};
    let ops = this._result.objectProvides?.raw;
    if (!Array.isArray(ops)) {
      ops = [ops];
    }
    ops.forEach((op) => {
      let cluster =
        this.appConfig.contentSectionsParams.clusterMapping[op] || 'Others';
      if (clusters[cluster] === undefined) {
        clusters[cluster] = { content_types: [] };
        clusters[cluster].icon = clusterIcons[op] || clusterIcons.fallback;
      }
      clusters[cluster].content_types.push(op);
    });
    return clusters;
  }

  get clusterName() {
    return (
      this.appConfig.contentSectionsParams.clusterMapping[
        this._result.objectProvides?.raw
      ] || 'Others'
    );
  }

  get href() {
    return this._result.about?.raw;
  }

  get source() {
    let source = this._result.cluster_name?.raw;
    if (Array.isArray(source)) {
      return source.join(' ');
    }
    return this._result.cluster_name?.raw;
  }

  get title() {
    if (!this._result?.title) {
      console.log('result', this._result);
    }
    return this._result.title?.raw;
  }

  get description() {
    const fieldName = this.appConfig.resultItemModel.descriptionField;
    return this._result[fieldName]?.raw;
  }

  get hasImage() {
    // WIP, TODO: we need a way to define real images vs fallback
    // and I am not sure we can do it at this level.
    // Example of a fallback image:
    // https://www.eea.europa.eu/help/faq/what-is-the-status-of/image_preview
    // return parseInt(1 + Math.random() * 3) === 1;
    const thumb = _getThumb.bind(this).apply() || '';
    return thumb.search(/portal_depiction/) === -1;
  }

  get thumbUrl() {
    return _getThumb.bind(this).apply();
  }

  get highlight() {
    return this._result?._meta?.highlight;
  }

  get website() {
    return this.href ? new URL(this.href).hostname : this.href;
  }

  get tags() {
    const tagsField = this.appConfig.resultItemModel.tagsField;
    return this._result[tagsField]?.raw;
  }

  get metaTypes() {
    // TODO: why no type for some results?
    // if (this._result.objectProvides.raw.length == 0) {
    //   console.log(this._result);
    //   // objectProvides:
    //   //   raw: []
    //   //   [[Prototype]]: Object
    // }
    return this._result.objectProvides?.raw;
  }

  get explanation() {
    return this._original?._explanation;
  }
}
