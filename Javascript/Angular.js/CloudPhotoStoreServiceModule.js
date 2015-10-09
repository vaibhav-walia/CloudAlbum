angular.module('CloudPhotoStoreServiceModule', [])
    .service('CloudPhotoStoreService', ['$http', function($http) {
        return {
            show: function(album, filename) {
                return $http.get("http://cloudalbum-vwalia.c9.io:8081/show?album=" + album + "&filename=" + filename);
            },
            showAll: function() {
                //call server to get metadata for all available images
                return $http.get("http://cloudalbum-vwalia.c9.io:8081/showAll");
            },
            upload: function(file) {
                var fd = new FormData();
                fd.append('file', file);
               return $http.post('http://cloudalbum-vwalia.c9.io:8081/upload?album=albumx', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-type': undefined
                    }
                });
            }
        }
    }]);