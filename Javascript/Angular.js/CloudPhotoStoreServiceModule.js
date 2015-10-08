angular.module('CloudPhotoStoreServiceModule', [])
    .service('CloudPhotoStoreService', ['$http', function($http) {
        return {
            show: function(album, filename) {
                return $http.get("http://cloudphotostoreservice-vaibhav-walia.c9.io/show?album=" + album + "&filename=" + filename);
            },
            showAll: function() {
                //call server to get metadata for all available images
                return $http.get("http://cloudphotostoreservice-vaibhav-walia.c9.io/showAll");
            },
            upload: function(file) {
                var fd = new FormData();
                fd.append('file', file);
               return $http.post('http://cloudphotostoreservice-vaibhav-walia.c9.io/upload', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-type': undefined
                    }
                });
            }
        }
    }]);