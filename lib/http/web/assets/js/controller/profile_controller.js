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
   * This controller handles all actions for editing and viewing the profile
   */
  root.gendok.controller('profileController', function ($scope, $stateParams,
                          $window, $state, profileService) {
    $scope.error_message;
    $scope.success_message;
    $scope.editable = false;

    profileService.getProfile(function success(response) {
      $scope.profile = response.data;
      $scope.profile_original = angular.copy(response.data);
    }, function error(response) {

    });

    /*
     * Updates the profile with values from the form.
     */
    $scope.update = function (profile) {
      profileService.updateProfile(function success(response) {
        $scope.editable = false;
        $scope.profile_original = angular.copy(profile);
        $scope.success_message = 'Successfully saved your profile.';
        $state.go('home');
      }, function error(response) {
        // model for form validation styling
        $scope.validation_errors = response.data.errors;

        // model for status message
        $scope.error_message = 'Error while saving your profile.';
      }, profile);
    };

    $scope.edit = function () {
      $scope.editable = true;
    };

    $scope.reset = function () {
      $scope.editable = false;
      $scope.profile = angular.copy($scope.profile_original);
    };
  });
})(window);
