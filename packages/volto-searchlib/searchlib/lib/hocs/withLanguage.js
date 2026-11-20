import { useSelector } from 'react-redux';
export default function withLanguage(WrappedComponent) {
  function WithLanguage(props) {
    const currentLang = useSelector((state) => state.intl.locale);
    return <WrappedComponent {...props} language={currentLang} />;
  }
  return WithLanguage;
}
