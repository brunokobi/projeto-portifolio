// Singleton: ipapi.co é chamado uma única vez, resultado compartilhado
let _promise = null;

export const getGeoIP = () => {
  if (!_promise) {
    _promise = fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .catch(() => ({}));
  }
  return _promise;
};
