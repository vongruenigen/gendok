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
   * This controller handles all actions for editing and viewing the profile.
   */
  root.gendok.controller('profileController', function ($scope, $stateParams,
                         $window, $state, $location, profileService, authService) {
    $scope.editable = false;

    /**
     * Loads the profile when viewing it on the profile view.
     */
    $scope.getProfile = function () {
      profileService.getProfile(
        function (response) {
          $scope.profile = response.data;
          $scope.profileOriginal = angular.copy(response.data);
        },

        function (response) {
          $scope.errorMessage = 'Error while loading your profile.';
        }
      );
    };

    /**
     * Loads the name of the user who just confirmed its account.
     */
    $scope.confirmUser = function () {
      var token = $location.search().token;

      profileService.confirm(
        function success(res) {
          authService.setUser(res.data.email, res.data.token);
          $state.go('home');
        },

        function error(response) {
          $state.go('home');
        }, token);
    };

    /*
     * Updates the profile with values from the form.
     */
    $scope.update = function (profile) {
      profileService.updateProfile(function success(response) {
        $scope.editable = false;
        $scope.profileOriginal = angular.copy(profile);
        $scope.successMessage = 'Successfully saved your profile.';
        $state.go('home');
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = 'Error while saving your profile.';
      }, profile);
    };

    // This function signs up the user after hitting the submit button on the
    // signup page.
    $scope.signup = function (profile) {
      profile = {
        email: (profile && profile.email) || '',
        name: (profile && profile.name) || '',
        password: (profile && profile.password) || '',
        passwordConfirmation: (profile && profile.passwordConfirmation) || ''
      };

      profileService.signup(function success(response) {
        $scope.successMessage = "You've been registered successfully! Please" +
                                ' check your e-mail account and confirm your' +
                                ' e-mail address before signing in.';
        $state.go('home');
      }, function error(response) {
        // model for form validation styling
        $scope.validationErrors = response.data.errors;

        // model for status message
        $scope.errorMessage = 'Error(s) occured while creating your profile.';
      }, profile);
    };

    /*
     * Enables the html form for editing the profile.
     */
    $scope.edit = function () {
      $scope.editable = true;
    };

    /*
     * Disables the current form and resets the values of the profile.
     */
    $scope.reset = function () {
      $scope.editable = false;
      $scope.profile = angular.copy($scope.profileOriginal);
    };
  });
})(window);
