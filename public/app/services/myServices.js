app.factory('dataFactory', function($http){
  return {
    httpRequest: function(url,method,params,dataPost,upload){
      var pass = { url:url, method:method||'GET' };
      if(params) pass.params=params;
      if(dataPost) pass.data=dataPost;
      if(upload) pass.upload=upload;
      return $http(pass).then(r=>r.data);
    }
  };
});
