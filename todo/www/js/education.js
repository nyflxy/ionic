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
  //格式化字符串
  String.format = function(src){
      if (arguments.length == 0) return null;
      var args = Array.prototype.slice.call(arguments, 1);
      return src.replace(/\{(\d+)\}/g, function(m, i){
          return args[i];
      });
  };

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
      window.localStorage['projects'] = angular.toJson(projects);
      $scope.projects = Projects.all();
      $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];
  }

  $scope.initProject();
  $scope.refreshProjects = function(){
    $scope.initProject();
    $scope.toggleProjects(false);
  }

  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

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

  $scope.doUniversityRefresh = function(){
    $scope.initUniversity();
    $scope.universitys = Universitys.all();
    $scope.$broadcast('scroll.refreshComplete');
  }

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

    // task detail
  $ionicModal.fromTemplateUrl('task-detail.html', function(modal) {
    $scope.taskDetailModal = modal;
  }, {
    scope: $scope
  });

});
