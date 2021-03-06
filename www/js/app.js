// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('bikeRaleigh', ['ionic', 'bikeRaleigh.controllers', 'angular-toArrayFilter', 'angular.filter', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.bikeShops', {
    url: "/bikeshops",
    views: {
      'menuContent': {
        templateUrl: "templates/bikeShops.html"
      }
    }
  })
  .state('app.greenways', {
    url: "/greenways",
    views: {
      'menuContent': {
        templateUrl: "templates/greenways.html"
      }
    }
  })
  .state('app.map', {
    url: "/map",
    views: {
      'menuContent': {
        templateUrl: "templates/map.html",
        controller: 'MapCtrl'
      }
    }
  })
  .state('app.bikeBenefits', {
    url: "/bikeBenefits",
    views: {
      'menuContent': {
        templateUrl: "templates/bikeBenefits.html"
      }
    }
  })  
  .state('app.legend', {
    url: "/legend",
    views: {
      'menuContent': {
        templateUrl: "templates/legend.html",
        controller: 'LegendCtrl'
      }
    }
  })
  .state('app.feedback', {
    url: "/feedback",
    views: {
      'menuContent': {
        templateUrl: "templates/feedback.html",
        controller: 'FeedbackCtrl'
      }
    }
  })  
/*  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  })*/;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
