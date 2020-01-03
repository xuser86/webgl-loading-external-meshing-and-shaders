// Load text resource ower the network
function loadResource(url) {
  return fetch(url)
    .then((response) => {
      if (response.status < 200 || response.status > 299) {
        throw new Error(response.statusText + ' : ' + url);
      } else {
        return response.json();
      }
    })
    .catch((error) => {
        throw new Error(error);
    });
}