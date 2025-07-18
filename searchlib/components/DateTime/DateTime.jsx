// import { DateTime } from 'luxon';
//
// const FormatDateTime = (props) => {
//   const { value, format = 'DATE_SHORT' } = props;
//
//   if (value === null){
//     return null;
//   }
//   const dt = value
//     ? value.isLuxonDateTime
//       ? value
//       : DateTime.fromISO(value)
//     : DateTime.local();
//
//   return format === 'DATE_MED'
//     ? dt.toFormat('d MMM yyyy')
//     : dt.toLocaleString(DateTime[format]);
// };
//
// export default FormatDateTime;

const FormatDateTime = (props) => {
  const { value, format = 'DATE_SHORT' } = props;

  if (value === null) {
    return null;
  }

  const dt = value instanceof Date ? value : new Date(value);

  const formatOptions = {
    DATE_SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
    DATE_MED: { day: 'numeric', month: 'short', year: 'numeric' },
  };

  if (format === 'DATE_MED') {
    return dt.toLocaleDateString('en-US', formatOptions.DATE_MED);
  } else {
    return dt.toLocaleDateString('en-US', formatOptions.DATE_SHORT);
  }
};

export default FormatDateTime;
