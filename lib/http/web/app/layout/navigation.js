/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

;(function ($) {
  'use strict';

  $(document).ready(function () {
    var mobileNavOpen = false;
    var navisResizedByMobileWidth = false;
    var navisResizedByOnScroll = false;

    var nav = $('nav');
    var navSection = $('nav > section');
    var navUl = $('nav > section > div.nav_list');
    var navList = $('nav > section > div.nav_list > ul li');
    var navLink = $('nav > section > div.nav_list > ul li a');
    var menuButton = $('#menu_button');
    var menuExtension = $('#menu_extension');

    //modifiable variables
    var resizeNavigationInMobileWidth = false;
    var resizeNavigationOnScroll = true;
    var widthSwitchMobile = 800;

    if (resizeNavigationInMobileWidth) {
      checkForResizeNavigationOnWindowResize();

      $(window).resize(function () {
        checkForResizeNavigationOnWindowResize();
      });
    }

    if (resizeNavigationOnScroll) {
      $(document).on('scroll', function () {
        checkForResizeOnScroll();
      });
    }

    function checkForResizeNavigationOnWindowResize() {
      if (!navisResizedByOnScroll) {
        if ($(window).width() < widthSwitchMobile) {
          navSection.addClass('small_nav');
          navisResizedByMobileWidth = true;
        } else if ($(window).width() > widthSwitchMobile) {
          navSection.removeClass('small_nav');
          navisResizedByMobileWidth = false;
        }
      }
    }

    function checkForResizeOnScroll() {
      if (!navisResizedByMobileWidth) {
        if ($(document).scrollTop() > 20) {
          navSection.addClass('small_nav');
          navisResizedByOnScroll = true;
        } else {
          navSection.removeClass('small_nav');
          navisResizedByOnScroll = false;
        }
      }
    }

    menuButton.click(function () {
      toggleMenu();
    });

    menuExtension.click(function () {
      closeMenu();
    });

    navUl.click(function () {
      closeMenu();
    });

    function toggleMenu() {
      if (mobileNavOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function openMenu() {
      if (!mobileNavOpen) {
        $('html').addClass('scroll_lock');
        nav.css('background-position', 'right bottom');
        navUl.css('right', '0px');
        menuExtension.removeClass('hide_extension');
        mobileNavOpen = true;
        menuButton.addClass('is_active');
        console.log('open');
      }
    }

    function closeMenu() {
      if (mobileNavOpen) {
        $('html').removeClass('scroll_lock');
        navUl.css('right', '-201px');
        nav.css('background-position', 'left bottom');
        menuExtension.addClass('hide_extension');
        mobileNavOpen = false;
        menuButton.removeClass('is_active');
        console.log('closed');
      }
    }
  });
})(jQuery);
