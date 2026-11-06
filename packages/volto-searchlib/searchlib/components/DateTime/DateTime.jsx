import { DateTime } from 'luxon';

const FormatDateTime = (props) => {
  const { value, format = 'DATE_SHORT' } = props;

  if (value === null) {
    return null;
  }
  const dt = value
    ? value.isLuxonDateTime
      ? value
      : DateTime.fromISO(value)
    : DateTime.local();

  return format === 'DATE_MED'
    ? dt.toFormat('d MMM yyyy')
    : dt.toLocaleString(DateTime[format]);
};

export default FormatDateTime;
