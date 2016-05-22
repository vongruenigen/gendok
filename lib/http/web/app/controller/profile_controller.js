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
      // In case the reset-pw flag is set on the url we show a message to the
      // user that it should set a new password.
      if ($stateParams.resetPassword) {
        $scope.successMessage = 'Please set a new password for your profile.';
      }

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

    /**
     * Resets the password for the user and shows a success message.
     */
    $scope.resetPasswordReq = function (email) {
      if (!email) {
        return;
      }

      profileService.resetPasswordReq(
        function success(response) {
          $scope.successMessage =  'We\'ve sent you an email to ' + email +
                                   ' with the reset password link for ' +
                                   'your profile.';
        },

        function error(response) {
          $scope.errorMessage = 'Error while resetting your password.';
        }, email);
    };

    /**
     * Verifies the token in the url and signs in the user if it's valid. The
     * user is then redirected to the profile page and prompted to set a new
     * password.
     */
    $scope.resetPassword = function () {
      var token = $location.search().token;

      profileService.resetPassword(
        function success(res) {
          authService.setUser(res.data.email, res.data.token);
          $state.go('profile', {resetPassword: true});
        },

        function error(response) {
          $state.go('home');
        }, token);
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
