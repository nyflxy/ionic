angular.module('todo', ['ionic'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate,$http) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }


  // Load or initialize projects
  $scope.initProject = function(){
    $http.get("http://127.0.0.1:8500/api/projects")
    .success(function(res){
      projects = res.response.data;
      window.localStorage['projects'] = angular.toJson(projects);
    });
    $http.get("http://127.0.0.1:8500/api/members")
    .success(function(res){
      members = res.response.data;
      window.localStorage['members'] = angular.toJson(members);
    });
  }
  $scope.initProject();
  $scope.projects = Projects.all();
  $scope.members = angular.fromJson(window.localStorage['members']);
//  $scope.members = [{"name":"niyoufa","id":1}];
  console.log($scope.members);

  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Project name');
    if(projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  $scope.refreshProjects = function(){
    $scope.initProject();
    $scope.projects = Projects.all();
  }

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

    // new task
  $ionicModal.fromTemplateUrl('task-detail.html', function(modal) {
    $scope.taskDetailModal = modal;
  }, {
    scope: $scope
  });

//new work
  $ionicModal.fromTemplateUrl('new-work.html', function(modal) {
    $scope.newWorkModel = modal;
  }, {
    scope: $scope
  });

  $scope.selectTask = function(task,index){
    $scope.activeTask = task;
    $scope.taskDetailModal.show();
  }

  $scope.backToProject = function(){
    $scope.taskDetailModal.hide();
  }

  $scope.addWork = function(){
    $scope.newWorkModel.show();
  }

  $scope.createTask = function(task) {
    if(!$scope.activeProject || !task) {
      return;
    }
    $scope.activeProject.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }

  $scope.newWork = function(){
      $scope.newWorkModel.show();
  }

  $scope.closeNewWork = function(){
    $scope.newWorkModel.hide();
    work.content = "";
    work.hour = "";
    work.username = "";
    work.date = "";
  }

  $scope.createWork = function(work){
    if(!$scope.activeTask || !work){
      return;
    }
    if(!$scope.activeTask.work_list){
      $scope.activeTask.work_list = [];
    }
    for(var i=0,len=$scope.activeTask.work_list.length;i<len;i++){
      if(work.username == $scope.activeTask.work_list[i].username){
        alert("您今天已添加工作日报！");
        return;
      }
    }
    var content = work.content;
    var hour = work.hour;
    var username = work.username.split(":")[1];
    var date = "今天";
    $scope.activeTask.work_list.push({
      "content":work.content,
      "hour":work.hour,
      "username":username,
      "date":date,
    });
    $scope.newWorkModel.hide();

    // Inefficient, but save all the projects// Inefficient, but save all the projects
    work.content = "";
    work.hour = "";
    work.username = "";
    work.date = "";
  }

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
//  $timeout(function() {
//    if($scope.projects.length == 0) {
//      while(true) {
//        var projectTitle = prompt('Your first project title:');
//        if(projectTitle) {
//          createProject(projectTitle);
//          break;
//        }
//      }
//    }
//  });

});
