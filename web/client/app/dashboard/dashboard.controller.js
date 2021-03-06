'use strict';

angular.module('piraBoardApp')
.controller('DashboardCtrl', function ($scope, $http, $q, Auth, Modal, User, Group) {
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.currentGroup = {
      active: [],
      invited: []
    };
    $scope.addGroupToggle = false; 
    $scope.profileToggle = false;
    $scope.infoBoxToggle = false;
  User.get().$promise.then( function (result) {
    $scope.user = result;
    $scope.numberGroups = result.group.length;
    $scope.numberLead = 0
    for (var key in result.isAdmin) {
      if (result.isAdmin[key]) { 
        $scope.numberLead++;
      }
    }
    $scope.usersGroups = result.group;
    return result;
  });

    //When groups are added, they are also added here with their $scope.groups index
    $scope.groups = [];
    $scope.numGroups = $scope.groups.length;
    // this needs to be moved up

    // gets the current group the user is clicked on
    $scope.getGroup = function (index) {
      $scope.infoBoxToggle = true;
      $scope.profileToggle = false;

      Group.getActiveMembers($scope.usersGroups[index]).$promise.then(function (result) {
        var master = [];
        for (var i = 0; i < result.length; i++) {
          var store = result[i];
          var member = {
            name: store.name,
            email: store.email,
            phonenumber: store.phonenumber,
            location: store.location,
            bio: store.bio,
            photo: store.photo,
            isAdmin: store.isAdmin,
            _id: store._id
          };
          master.push(member);
        }
        // sets group name
        $scope.currentGroup.groupName = $scope.usersGroups[index];
        // sets currentGroup to contain all group information
        $scope.currentGroup.active = master;
      });      
      // Group.getInvitedMembers($scope.usersGroups[index]).$promise.then(function (result) {
      //   console.log('RESanyhting')
      //   var master = [];
      //   for (var i = 0; i < result.length; i++) {
      //     var store = result[i];
      //     var member = {
      //       name: store.name,
      //       email: store.email,
      //       _id: store._id
      //     };
      //     master.push(member);
      //   }
      //   $scope.currentGroup.invited = master; // sets currentGroup to contain all group information
      // });
    };

    $scope.createGroup = function (name, callback) {
      var user = User.get().$promise;
      var groups = $http.get('/api/users/userGroups');
      $scope.addGroupToggle = false;
      $q.all([user, groups]).then(function (result) {
        var user = result[0];
        var groups = result[1].data;
        if (groups.indexOf(name) < 0) {
          $http.post('/api/users/userGroup/' + name, {user: user})
          .success(function(data) {
            $scope.updateGroups();
          })
          .error(function(){
            console.log('Post to /api/users failed!')
          });
        } else {
          $scope.groupName = '';
          alert('Group name already exists!  Choose another name.');
        }
      });
    };

    $scope.isCurrentGroup = function (group) {
      return $scope.currentGroup.groupName === group;
    };

    $scope.updateGroups = function (callback) {
      User.get().$promise.then( function (result) {
        $scope.numberGroups = result.group.length;
        $scope.usersGroups = result.group;
        $scope.groupName = '';
        $scope.numberLead = $scope.numberLead + 1;
      });
    };

    $scope.getCurrentGroup = function (group) {
      $http.get('/api/users/getUsersOfGroup/' + group)
      .success(function (data) {
        $scope.currentgroup = data;
      }); 
    };
    
    $scope.initPiraBoard = function (data) {
      return Modal.app(data);
    }
  });