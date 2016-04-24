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
    $scope.editable = false;

    profileService.getProfile(
      function (response) {
        $scope.profile = response.data;
        $scope.profileOriginal = angular.copy(response.data);
      },

      function (response) {
        $scope.errorMessage = 'Error while loading your profile.';
      }
    );

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

    $scope.edit = function () {
      $scope.editable = true;
    };

    $scope.reset = function () {
      $scope.editable = false;
      $scope.profile = angular.copy($scope.profileOriginal);
    };
  });
})(window);