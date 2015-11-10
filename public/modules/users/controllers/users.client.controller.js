'use strict';

// Users controller
angular.module('users').controller('UsersController', ['$scope', '$stateParams', '$location', 'Authentication', 'UsersEdit', 'UsersFind', '$http', '$rootScope', '$base64',
	function($scope, $stateParams, $location, Authentication, UsersEdit, UsersFind, $http, $rootScope, $base64) {
		$scope.authentication = Authentication;

		$scope.roleOpts = ['user', 'admin', 'producer/auditions director', 'production coordinator', 'talent director', 'client', 'client-client'];

		// various values

		// used for paginator
		$scope.loadPass = false;
		$scope.Math = window.Math;
		$scope.currentPage = 0;
		$scope.filtered = [];
		$scope.limit = 0;
		$scope.range = function(min, max, step){
		    step = step || 1;
		    var input = [];
		    for (var i = min; i <= max; i += step) input.push(i);
		    return input;
		};
	    $scope.setPage = function () {
	        $scope.currentPage = this.n;
	    };
	    $scope.changePage = function(page){
	    	var curSel = page * $scope.limit;

	    	if(curSel < $scope.filtered.length && curSel >= 0){
	    		$scope.currentPage = page;
	    	}
	    };
	    $scope.$watch('filtered', function(val){
	    	$scope.currentPage = 0;
	    }, true);

		// Find a list of Users
		$scope.find = function() {
			$scope.users = UsersEdit.query();
		};
		$scope.findFilter = function(selUserLevel) {
			$scope.users = UsersFind.query({userLevel: selUserLevel});
		};

		// refresh list of users on refresh emit
		$rootScope.$on('refresh', $scope.find());
		$rootScope.$on('refreshFilter',
			function(event, args) {
				$scope.findFilter(args);
			}
		);

		$scope.decodedPass = function(encodedPass){
			var convertedPass = '';
			if(typeof encodedPass !== 'undefined'){
				convertedPass = $base64.decode(encodedPass);
			}

			return convertedPass;
		};

		// Find existing Users
		$scope.findOne = function() {
			$scope.useredit = UsersEdit.get({
				userIdEdit: $stateParams.userIdEdit
			});
		};
		$scope.$watchCollection('useredit', function(){
			// check for load password pass
			if($scope.loadPass === false){
				$scope.useredit.newpassword  = $scope.decodedPass($scope.useredit.passwordText);
				// ensure password is loaded
				if($scope.useredit.newpassword){
					$scope.loadPass = true;
				}
			}
		});

		$scope.getOne = function(userId) {
			$scope.useredit = UsersEdit.get({
				userIdEdit: userId
			});
		};

		// Update existing User
		$scope.update = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new UsersEdit($scope.useredit);

				user.edited = Authentication;

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		$scope.remove = function( useredit ) {

			if(confirm('Are you sure?')){
				if ( useredit ) { useredit.$remove();

					for (var i in $scope.users ) {
						if ($scope.users[i] === useredit ) {
							$scope.users.splice(i, 1);
						}
					}
				} else {
					$scope.useredit.$remove(function() {
						$location.path('usersedit');
					});
				}
			}
		};

		$scope.create = function() {
			var useredit = {
				firstName: this.firstName,
				lastName: this.lastName,
				displayName: this.displayName,
				company: this.company,
				email: this.email,
				username: this.username,
				phone: this.phone,
				password: this.password,
				notes: this.notes,
				roles: this.roles
			};

			// Redirect after save
			$http.post('/usersedit/create', useredit).
			success(function(data, status, headers, config) {
				$location.path('/usersedit');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
