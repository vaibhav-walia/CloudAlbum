angular.module('CloudPhotoStoreServiceModule', [])
    .service('CloudPhotoStoreService', ['$http', function($http) {
        return {
            show: function(album, filename) {
                return $http.get("https://cloudalbum-vwalia.c9.io:8081/show?album=" + album + "&filename=" + filename);
            },
            showAll: function(globals) {
                //call server to get metadata for all available images
                return $http.get("http://cloudalbum-vwalia.c9.io:8081/api/pictures/user/"+globals.user);//+'?token='+globals.token);
            },
            upload: function(file,globals) {
                var fd = new FormData();
                fd.append('file', file);
                fd.append('username',globals.user);
                return $http.post('http://cloudalbum-vwalia.c9.io:8081/api/pictures', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-type': undefined/*,
                        'x-access-token' : globals.token*/
                    }
                });
            },
            delete: function(file) {
                return $http.delete('http://cloudalbum-vwalia.c9.io:8081/api/pictures/' + file.ID);
            },
            authenticate: function(username, password) {
                //call webservice to authenticate and return the promise
                return $http({
                    method: 'POST',
                    url: 'http://cloudalbum-vwalia.c9.io:8081/api/authenticate',
                    data: $.param({
                        username: username,
                        password: password
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            }
        };
    }]);