'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$upload', 'ngAudio', '$http',
	function($scope, $stateParams, $location, Authentication, Projects, $upload, ngAudio, $http ) {
		$scope.authentication = Authentication;

		// static project options
		$scope.statusOpts = ['Not started', 'Open', 'Client Completed', 'Completed', 'Suspended'];
		$scope.priorityOpts = ['None', 'Very low', 'Low', 'Medium', 'High', 'Very high'];
		$scope.phaseStatusOpts = ['not started','open','complete','suspended'];
		$scope.loadAudio = 0;
		$scope.audio = Array;

		// check for user global variable then load from user me page
		if(typeof user === 'undefined'){
			$http.get('/api/users/me') 
			  .then(function(result) {
			    user = result.data;
			});
		}

		$scope.updateTalent = function(talentId, talentName){
			// gen talent object
			var talent = {'talentId': talentId, 'name': talentName};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.talent.length; ++i){
				if($scope.project.talent[i].talentId === talentId){
					$scope.project.talent.splice(i, 1);
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.project.talent.push(talent);
			}

			// update project store
			$scope.update();
		};

		$scope.updateTeam = function(userId, firstName, lastName){
			// gen user object
			var user = {'userId': userId, 'name': firstName + ' ' + lastName};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.team.length; ++i){
				if($scope.project.team[i].userId === userId){
					$scope.project.team.splice(i, 1);
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.project.team.push(user);
			}

			// update project store
			$scope.update();
		};

		$scope.updateClient = function(userId, firstName, lastName){
			// gen user object
			var user = {'userId': userId, 'name': firstName + ' ' + lastName};

			// check for existing item
			var found = 0;
			for(var i = 0; i < $scope.project.client.length; ++i){
				if($scope.project.client[i].userId === userId){
					$scope.project.client.splice(i, 1);
					found = 1;
				}
			}

			// add talent if never found
			if(found === 0){
				$scope.project.client.push(user);
			}

			// update project store
			$scope.update();
		};

		// update auditions approval status
		$scope.audApprov = function(key){

			var now = new Date();
			if(typeof $scope.project.auditions[key].approved === 'undefined'){
				$scope.project.auditions[key] = {
					file: $scope.project.auditions[key].file,
					approved: {selected: true,
								by: {
									userId: user._id,
									name: user.firstName + ' ' + user.lastName,
									date: now.toJSON()
								}}
				};
			} else {
				if($scope.project.auditions[key].approved.selected === true){
					$scope.project.auditions[key].approved.selected = false;
					$scope.project.auditions[key].approved.by.userId = '';
					$scope.project.auditions[key].approved.by.name = '';
					$scope.project.auditions[key].approved.by.date = '';
				} else {
					$scope.project.auditions[key].approved.selected = true;
					$scope.project.auditions[key].approved.by.userId = user._id;
					$scope.project.auditions[key].approved.by.name = user.firstName + ' ' + user.lastName;
					$scope.project.auditions[key].approved.by.date = now.toJSON();
				}
			}

			// update project store
			$scope.update();
		};

		// update auditions approval status
		$scope.scrApprov = function(key){

			var now = new Date();
			if(typeof $scope.project.scripts[key].approved === 'undefined'){
				$scope.project.scripts[key] = {
					file: $scope.project.scripts[key].file,
					approved: {selected: true,
								by: {
									userId: user._id,
									name: user.firstName + ' ' + user.lastName,
									date: now.toJSON()
								}}
				};
			} else {
				if($scope.project.scripts[key].approved.selected === true){
					$scope.project.scripts[key].approved.selected = false;
					$scope.project.scripts[key].approved.by.userId = '';
					$scope.project.scripts[key].approved.by.name = '';
					$scope.project.scripts[key].approved.by.date = '';
				} else {
					$scope.project.scripts[key].approved.selected = true;
					$scope.project.scripts[key].approved.by.userId = user._id;
					$scope.project.scripts[key].approved.by.name = user.firstName + ' ' + user.lastName;
					$scope.project.scripts[key].approved.by.date = now.toJSON();
				}
			}

			// update project store
			$scope.update();
		};

		// Create new Project
		$scope.create = function() {
			// Create new Project object
			var project = new Projects ({
				title: this.title,
				estimatedCompletionDate: this.estimatedCompletionDate,
				estimatedTime: this.estimatedTime,
				actualTime: this.actualTime,
				status: this.status,
				priority: this.priority,
				description: this.description
			});

			// Redirect after save
			project.$save(function(response) {
				$location.path('projects/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Project
		$scope.remove = function( project ) {
			if ( project ) { project.$remove();

				for (var i in $scope.projects ) {
					if ($scope.projects [i] === project ) {
						$scope.projects.splice(i, 1);
					}
				}
			} else {
				$scope.project.$remove(function() {
					$location.path('projects');
				});
			}
		};

		// Update existing Project
		$scope.update = function() {
			var project = $scope.project;

			project.$update(function() {
				$location.path('projects/' + project._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// update phase options
		$scope.updateStatus = function(idx){
			// update project store
			$scope.update();
		};
		$scope.updateStartDate = function(idx){
			// update project store
			$scope.update();
		};
		$scope.updateEndDate = function(idx){
			// update project store
			$scope.update();
		};

		// Find a list of Projects
		$scope.find = function() {
			$scope.projects = Projects.query();
		};

		// Find existing Project
		$scope.findOne = function() {
			$scope.project = Projects.get({ 
				projectId: $stateParams.projectId
			});
		};

		// load project in view
		$scope.loadProject = function(){
			this.findOne();

			// enable audio load after watch
			$scope.loadAudio = 1;
		};

		// load audio files into player after project object has finished loading
		$scope.$watch('project.auditions', function(val){
			if($scope.loadAudio === 1){
				$scope.loadAudioPlayer();	
			}
		});

		// load audio files
		$scope.loadAudioPlayer = function(){
			if(typeof $scope.project.auditions !== 'undefined'){
				for(var i = 0; i < $scope.project.auditions.length; ++i){
					if($scope.project.auditions[i].file.type === 'audio/mp3'){
						$scope.audio[i] = ngAudio.load('/res/auditions/'+$scope.project._id+'/'+$scope.project.auditions[i].file.name);
					}
				}
			}
		};

		// save discussion item
		$scope.saveDiscussion = function(){
			var now = new Date();
			var item = {date: now.toJSON(), userid: user._id, username: user.username, item: this.discussion};

			$scope.project.discussion.push(item);

			// update project store
			$scope.update();
		};

		// update projects scripts list
		$scope.updateScripts = function(file){
			var script = {file: file};
			
			// push new script object
			$scope.project.scripts.push(script);

			// update project store
			$scope.update();

		};

		$scope.delScript = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/scripts/' + $scope.project._id + '/' + $scope.project.scripts[idx].file.name;

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.scripts.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadScript = function($files) {
	    //$files: an array of files selected, each file has name, size, and type. 
	    for (var i = 0; i < $files.length; i++) {
	      var file = $files[i];
	      $scope.updateScripts(file);
	      $scope.upload = $upload.upload({
	        url: 'projects/uploads/script', //upload.php script, node.js route, or servlet url 
	        //method: 'POST' or 'PUT', 
	        //headers: {'header-key': 'header-value'}, 
	        //withCredentials: true, 
	        data: {project: $scope.project},
	        file: file, // or list of files ($files) for html5 only 
	        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s) 
	        // customize file formData name ('Content-Desposition'), server side file variable name.  
	        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'  
	        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code 
	        //formDataAppender: function(formData, key, val){} 
	      }).progress(function(evt) {
	        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	      }).success(function(data, status, headers, config) {
	        // file is uploaded successfully 
	        console.log(data);
	      });
	      //.error(...) 
	      //.then(success, error, progress);  
	      // access or attach event listeners to the underlying XMLHttpRequest. 
	      //.xhr(function(xhr){xhr.upload.addEventListener(...)}) 
    	 }
	    /* alternative way of uploading, send the file binary with the file's content-type.
	       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
	       It could also be used to monitor the progress of a normal http post/put request with large data*/
	    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code. 
	  	};

	  	// update projects scripts list
		$scope.updateAuditions = function(file){
			var audition = {file: file};
			
			// push new script object
			$scope.project.auditions.push(audition);

			// update project store
			$scope.update();

		};

		$scope.delAudition = function(idx){
			// verify user wants to delete file
			if (confirm('Are you sure?')) {

				var file = '/res/auditions/' + $scope.project._id + '/' + $scope.project.auditions[idx].file.name;

				var delFileCnt = $scope.project.deleteFiles.length;

				$scope.project.deleteFiles[delFileCnt] = file;

				$scope.project.auditions.splice(idx, 1);

				// update project store
				$scope.update();
				
			}
		};

		$scope.uploadAudition = function($files) {
		    //$files: an array of files selected, each file has name, size, and type. 
		    for (var i = 0; i < $files.length; i++) {
		      var file = $files[i];
		      $scope.updateAuditions(file);
		      $scope.upload = $upload.upload({
		        url: 'projects/uploads/audition', //upload.php script, node.js route, or servlet url 
		        //method: 'POST' or 'PUT', 
		        //headers: {'header-key': 'header-value'}, 
		        //withCredentials: true, 
		        data: {project: $scope.project},
		        file: file, // or list of files ($files) for html5 only 
		        //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s) 
		        // customize file formData name ('Content-Desposition'), server side file variable name.  
		        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'  
		        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code 
		        //formDataAppender: function(formData, key, val){} 
		      }).progress(function(evt) {
		        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
		      }).success(function(data, status, headers, config) {
		        // file is uploaded successfully 
		        console.log(data);
		      });
		      //.error(...) 
		      //.then(success, error, progress);  
		      // access or attach event listeners to the underlying XMLHttpRequest. 
		      //.xhr(function(xhr){xhr.upload.addEventListener(...)}) 
		    }
		    /* alternative way of uploading, send the file binary with the file's content-type.
		       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
		       It could also be used to monitor the progress of a normal http post/put request with large data*/
		    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code. 
		  };

		}
]);