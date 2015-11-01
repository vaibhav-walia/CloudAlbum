var app = angular.module('CloudPhotoStoreModule', ['CloudPhotoStoreServiceModule', 'ui.bootstrap', 'ngRoute', 'ngCookies']);
app.config(['$routeProvider', function($routeProvider) {

	$routeProvider
		.when('/', {
			controller: 'CloudPhotoStoreController',
			templateUrl: 'home.html'
		})
		.when('/login', {
			controller: 'CloudPhotoStoreController',
			templateUrl: 'login.html'
		})
		.when('/register', {
			controller: 'CloudPhotoStoreController',
			templateUrl: 'register.html'
		})
		.otherwise({
			redirectTo: '/login'
		});
}]);

app.run(['$rootScope', '$location', '$cookieStore', '$http',
	function($rootScope, $location, $cookieStore, $http) {
		// keep user logged in after page refresh
		$rootScope.globals = $cookieStore.get('globals') || {};
		if ($rootScope.globals.token) {
			$http.defaults.headers.common['x-access-token'] = $rootScope.globals.token; // jshint ignore:line
		}

		$rootScope.$on('$locationChangeStart', function(event, next, current) {
			// redirect to login page if not logged in
			if ($location.path() !== '/login' && !$rootScope.globals.token) {
				$location.path('/login');
			}
		});
	}
]);

app.controller('CloudPhotoStoreController', ['$rootScope', '$scope', '$modal', 'CloudPhotoStoreService', '$http', '$cookieStore', '$location', function($rootScope, $scope, $modal, CloudPhotoStoreService, $http, $cookieStore, $location) {
	$rootScope.datastructures = {};
	$rootScope.datastructures.files = [];
	/*    $scope.socket = io("https://cloudalbum-vwalia.c9.io:8081");
	    $scope.socket.on('news',function(data){
	    	console.log(data);
	    });
	    $scope.$on('destroy',function(){
	    	$scope.socket.removeAllListeners();
	    });*/

	//authenticate user
	$scope.login = function() {
		//call the webservice to authenticate user using the username and password provided
		$scope.loginDataLoading = true;
		CloudPhotoStoreService.authenticate($scope.username, $scope.password).then(function(result) {
			$scope.loginDataLoading = false;
			if (result.data.success === true) {
				$scope.error = '';
				//save token in cookie
				$rootScope.globals.token = result.data.token;
				$rootScope.globals.user = $scope.username;
				$http.defaults.headers.common['x-access-token'] = result.data.token; // jshint ignore:line
				$cookieStore.put('globals', $rootScope.globals);
				$location.path('/');
			}
			else
				$scope.error = result.data.message;
		});
	};

	$scope.logout = function() {
		$rootScope.globals = {};
		$cookieStore.remove('globals');
		$location.path('/login');
	}

	//method to delete a file
	$scope.delete = function(index) {
        $rootScope.dataLoading = true;
		CloudPhotoStoreService.delete($scope.datastructures.files[index]).then(function(retval) {
			$rootScope.dataLoading = false;
			$rootScope.datastructures.files.splice(index, 1);
		}, function(err) {
			alert('Oops..Something went wrong!');
		});
	};

	//method to reload images
	$scope.reload = function() {
		$rootScope.dataLoading = true;
		CloudPhotoStoreService.showAll($rootScope.globals).then(function(jsonResult) {
			$rootScope.dataLoading = false;
			console.log(jsonResult.data);
			var results = jsonResult.data;
			if (results.success === true) {
				$rootScope.datastructures.files.length = 0;
				results.data.forEach(function(result) {
					$rootScope.datastructures.files.push({
						url: result.link,
						ID: result.picID
					});
				});
				$rootScope.datastructures.files.reverse(); // = images.reverse().splice(0, 3);
			}
			else if (results.message == 'Failed to authenticate token.' || results.message == 'No token provided.') {
				console.log('here');
				$scope.logout();
			}
		});
	};

	$scope.uploadFile = function() {
		var mIns = $modal.open({
			backdrop: true,
			backdropClick: true,
			dialogFade: false,
			keyboard: true,
			templateUrl: 'modal.html',
			controller: 'uploadModalController',
			resolve: {} // empty storage
		});
		mIns.result.then(function(scope) {
			//redirect to home page and set dataLoading true
			$location.path('/');
			$rootScope.dataUploading = true;
			CloudPhotoStoreService.upload(scope.myFile, $rootScope.globals).then(function(serviceResponse) {
				$rootScope.dataUploading = false;
				console.log("Upload Response: " + serviceResponse.data);
				$rootScope.datastructures.files.unshift({'ID':serviceResponse.data.data.picID,'url':serviceResponse.data.data.link});
			}, function(err) {
				alert('Uh-Oh Upload failed! Try again later');
				$location.path('/');
			}, function(notifyData) {
				console.log(notifyData);
			});
		},function(dismissMessage){
			$location.path('/');
		});
	};
	//reload whenever controller is reloaded
	$scope.reload();
}]);

app.controller('uploadModalController', ['CloudPhotoStoreService', '$scope', function(backendService, $scope) {
	$scope.uploadClicked = function() {
		$scope.$close($scope);
	}

	$scope.cancel = function() {
		$scope.$dismiss('cancel');
		//$location.path('/');
	};
}]);

app.directive('fileModel', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attributes) {
			element.bind('change', function() {
				$parse(attributes.fileModel).assign(scope, element[0].files[0]);
				scope.$apply();
			});
		}
	};


}]);
