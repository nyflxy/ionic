angular.module('education', ['ionic'])
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

.factory('Universitys', function() {
  return {
    all: function() {
      var universityString = window.localStorage['universitys'];
      if(universityString) {
        return angular.fromJson(universityString);
      }
      return [];
    },
    save: function(universitys) {
      window.localStorage['universitys'] = angular.toJson(universitys);
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveUniversity']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveUniversity'] = index;
    }
  }
})

.controller('EducationCtrl', function($scope, $timeout, $ionicModal, Projects,Universitys, $ionicSideMenuDelegate,$http) {

  var api_server_address = "http://localhost:8500";


  /*Project function*/
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
      var projects = [
        {"title":"高等院校"},
        {"title":"专业目录"},
        {"title":"教材信息"},
      ];
      window.localStorage['projects'] = angular.toJson(projects)
  }
  $scope.initProject();
  $scope.projects = Projects.all();

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

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  /*University function */
  $scope.initUniversity = function(){
    $http.get(api_server_address + "/api/university/list")
    .success(function(res){
      var universitys = res.response.data;
      var universitys_pager = res.response.pager;
      console.log(universitys);
      console.log(universitys_pager);
      window.localStorage["universitys"] = angular.toJson(universitys);
      $scope.universitys = Universitys.all();
      $scope.universitys_pager = universitys_pager;
    });
  }
  $scope.initUniversity();

  /*Task function*/
  $scope.selectTask = function(task,index){
    $scope.activeTask = task;
    $scope.taskDetailModal.show({
      content: 'Loading',
	    animation: 'fade-out',
	    showBackdrop: true,
	    maxWidth: 200,
	    showDelay: 0
    });
  }

  $scope.backToProject = function(){
    $scope.taskDetailModal.hide();
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

  $scope.doUniversityRefresh = function(){
    $scope.initUniversity();
    $scope.universitys = Universitys.all();
    $scope.$broadcast('scroll.refreshComplete');
  }
  //格式化字符串
  String.format = function(src){
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    };

  $scope.loadUniversityMore = function(keyword){
    if(!keyword){
      keyword = $scope.keyword || "";
    }
    var pager = $scope.universitys_pager;
    var enable = pager.enable;
    var has_more = pager.has_more;
    var page = pager.page + 1;
    var page_size = pager.page_size;
    if(enable && has_more){
      $http.get(String.format("{0}/api/university/list?page={1}&page_size={2}&keyword={3}",api_server_address,page,page_size,keyword))
      .success(function(res){
        var universitys = res.response.data;
        var universitys_pager = res.response.pager;
        console.log(universitys);
        console.log(universitys_pager);
        $scope.universitys = $scope.universitys.concat(universitys)
        window.localStorage["universitys"] = angular.toJson($scope.universitys);
        $scope.universitys_pager = universitys_pager;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }
  }
  $scope.searchUniversity = function(keyword){
    var keyword = keyword;
    if(!keyword){
      alert("请输入关键词查询");
      return
    }
    $scope.keyword = keyword;
    var pager = $scope.universitys_pager;
    var enable = pager.enable;
    var has_more = pager.has_more;
    var page = pager.page + 1;
    var page_size = pager.page_size;
    if(enable && has_more){
      $http.get(String.format("{0}/api/university/list?page={1}&page_size={2}&keyword={3}",api_server_address,page,page_size,keyword))
      .success(function(res){

        $scope.universitys = [];
        window.localStorage["universitys"] = [];

        var universitys = res.response.data;
        var universitys_pager = res.response.pager;
        console.log(universitys);
        console.log(universitys_pager);
        $scope.universitys = $scope.universitys.concat(universitys)
        window.localStorage["universitys"] = angular.toJson($scope.universitys);
        $scope.universitys_pager = universitys_pager;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }
  }

  /*Work function*/
  $scope.addWork = function(){
    $scope.newWorkModel.show();
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

  // Create our modal
  // new task
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

    // task detail
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
