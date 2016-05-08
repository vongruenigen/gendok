/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

;(function (root) {
  'use strict';

  /**
   * This controller handles all actions for creating, updating, deleting users.
   */
  root.gendok.controller('userController',
        function ($scope, $stateParams, $location, $state, $window, userService) {
    $scope.editable = false;

    /*
     * Creates a new user when form is sent and switchs to the view/update
     * view of the created user.
     */
    $scope.create = function () {
      resetMessages();

      userService.createUser(function success(response) {
        // rederict to the created template
        $state.go('userViewUpdate', {userId: response.data.id});
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while saving the user.';
      }, $scope.user);
    };

    /*
     * Sets $scope.user to the user with the id from the url and saves
     * a copy from the user in $scope.userOriginal.
     */
    $scope.getUser = function () {
      userService.getUser(function success(response) {
        response.data.isAdmin = response.data.isAdmin ? 'true' : 'false';
        $scope.user = response.data;
        $scope.userOriginal = angular.copy(response.data);
      }, function error(response) {

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while showing the user.';
      }, $stateParams.userId);
    };

    var handleErrorCodes = function (status) {
      switch (status) {
        case 401:
          $state.go('signin');
          break;
        case 404:
          $state.go('notFound');
          break;
      }
    };

    /*
     * Sets $scope.users to the array with all users.
     */
    $scope.getAllUsers = function () {
      userService.getAllUsers(function success(response) {
        $scope.users = response.data;
      }, function error(response) {

        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while retrieving all users.';
      });
    };

    /*
     * Updates the user with values from the form.
     */
    $scope.update = function () {
      resetMessages();

      userService.updateUser(function success(response) {
        $scope.editable = false;
        $scope.userOriginal = angular.copy($scope.user);
        $scope.successMessage = 'User ' + response.data.name + ' successfully updated!';
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;
        handleErrorCodes(response.status);
        $scope.errorMessage = 'An error occured while updating the user.';
      }, $scope.user);
    };

    /*
     * Deletes the user with the given Id.
     */
    $scope.delete = function (userId) {
      resetMessages();
      if ($window.confirm('Are you sure you want to delete this user?')) {
        // delete user via the api
        userService.deleteUser(function success(response) {
          //reload all templates via the api
          userService.getAllUsers(function success(response) {
            $scope.users = response.data;
            $scope.successMessage = 'The user was successfully deleted!';
          }, function error(response) {

            handleErrorCodes(response.status);
            $scope.errorMessage = 'An error occured while retrieving all users.';
          });
        }, function error(response) {

          handleErrorCodes(response.status);
          $scope.errorMessage = 'An error occured while deleting the user.';
        }, userId);
      }
    };

    /*
     * Enables the html form for editing the user.
     */
    $scope.edit = function () {
      resetMessages();
      $scope.editable = true;
    };

    /*
     * Disables the current form and resets the values of the user.
     */
    $scope.reset = function () {
      $scope.editable = false;
      resetMessages();
      $scope.user = angular.copy($scope.userOriginal);
    };

    var resetMessages = function () {
      $scope.errorMessage = null;
      $scope.successMessage = null;
      $scope.validationErrors = null;
    };

    /*
     * Sets all relevant default values/units for a new user.
     */
    $scope.setDefaultUser = function () {
      $scope.user = {};
      $scope.user.isAdmin = 'false';
      $scope.user.name = '';
      $scope.user.email = '';
      $scope.user.password = '';
      $scope.user.passwordConfirmation = '';
    };
  });
})(window);
