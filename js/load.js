// Load text resource ower the network
function loadResource(url, type = 'TEXT') {
  return fetch(url)
    .then((response) => {
        if (response.status < 200 || response.status > 299) {
            throw new Error(response.statusText + ' : ' + url);
        } else {
            if ( type === 'TEXT') {
                return response.text();
            } else if ( type === 'JSON') {
                return response.json();
            } else if ( type === 'IMAGE') {
                return new Promise((resolve) => {
                  const image = new Image();
                  image.onload = () => {
                    resolve(image);
                  }
                  image.src = url;
                });
            } else {
                throw new Error('Error unknown resource type : ', type);
            }
        }
    })
    .catch((error) => {
        throw new Error(error);
    });
}