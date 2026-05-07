
app.factory('dataFactory', function ($http) {

 
    var csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
        $http.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
    }

    return {
      
        httpRequest: function (url, method, params, dataPost, upload) {
            var config = {
                url:    url,
                method: method || 'GET'
            };

            if (params)   config.params = params;
            if (dataPost) config.data   = dataPost;
            if (upload)   config.upload = upload;

            return $http(config).then(function (response) {
                return response.data;
            });
        }
    };
});