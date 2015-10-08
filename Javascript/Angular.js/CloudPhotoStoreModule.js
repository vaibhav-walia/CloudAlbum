var app = angular.module('CloudPhotoStoreModule', ['CloudPhotoStoreServiceModule', 'ui.bootstrap', 'ngAnimate']);
app.controller('CloudPhotoStoreController', ['$scope', '$modal', 'CloudPhotoStoreService', '$http', function($scope, $modal, CloudPhotoStoreService, $http) {
	$scope.datastructures = {};
	$scope.datastructures.files = [];
	CloudPhotoStoreService.showAll().then(function(jsonResult) {
		console.log(jsonResult.data);
		var results = jsonResult.data;
		//var images = [];
		$scope.datastructures.files.length = 0;
		results.forEach(function(result) {
			result.pictures.forEach(function(image) {
				$scope.datastructures.files.push(image.link);
			});
		});

		$scope.datastructures.files.reverse(); // = images.reverse().splice(0, 3);
	});

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
			CloudPhotoStoreService.upload(scope.myFile).then(function(data) {
				console.log(data);
				CloudPhotoStoreService.showAll().then(function(jsonResult) {
					console.log(jsonResult.data);
					var results = jsonResult.data;
					//var images = [];
					$scope.datastructures.files.length = 0;
					results.forEach(function(result) {
						result.pictures.forEach(function(image) {
							$scope.datastructures.files.push(image.link);
						});
					});

					$scope.datastructures.files.reverse(); // = images.reverse().splice(0, 3);
				});
			});
		});
	};
}]);

app.controller('uploadModalController', ['CloudPhotoStoreService', '$scope', function(backendService, $scope) {
	$scope.uploadClicked = function() {
		$scope.$close($scope);
	}

	$scope.cancel = function() {
		$scope.$dismiss('cancel');
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
