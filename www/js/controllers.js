angular.module('bikeRaleigh.controllers', ['geolocation'])
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state) {
  $scope.shopClick = function (shop) {
    console.log(shop);
    $rootScope.map.setView(shop.feature.geometry.coordinates.reverse(), 16);
    $state.go('app.map')    
  };
  $scope.greenwayClick = function (greenway) {
    console.log(greenway.feature.properties.NAME); 
    var latLngs = [];
    angular.forEach($rootScope.routes._layers, function (route) {
      if (route.feature.properties.NAME === greenway.feature.properties.NAME) {
        latLngs.push(route.getLatLngs());
      }
    });
    var pl = L.multiPolyline(latLngs);
    $rootScope.map.fitBounds(pl.getBounds());
    $state.go('app.map');
  };
  $scope.filterGreenways = function (greenway) {
    return greenway.feature.properties.CATEGORY === 'Paved Greenway' && greenway.feature.properties.NAME;
  };
})
.controller('MapCtrl', function($scope, $http, $rootScope, geolocation) {
  $rootScope.map = L.map('map', {zoomControl:false}).setView([35.75, -78.695], 10);
  var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo($rootScope.map);

  $rootScope.locate = L.control.locate().addTo($rootScope.map);
  $scope.locating = false;
  $scope.geoLocate = function () {
/*    navigator.geolocation.getCurrentPosition(function (position) {
      $rootScope.map.setView([position.coords.latitude, position.coords.longitude], 16);
    });*/
    $scope.locating = !$scope.locating;
    if ($scope.locating) {
      $rootScope.locate.start();
    } else {
      $rootScope.locate.stop();
    }
    
  };

  $rootScope.routes = L.esri.featureLayer({
    url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/3',
      simplifyFactor: 0.35,
      style: function (feature) {
        switch (feature.properties.CATEGORY) {
        case "Preferred Route":
          return {"color" : "#1d90d0", "opacity" : 1, "weight" : 6, "stroke": true};
        case "Difficult Connection":
          return {"color" : "#cb7327", "opacity" : 1, "weight" : 6};
        case "Bike Lanes":
          return {"color" : "#e458a0", "opacity" : 1, "weight" : 6};
        case "Sharrows":
          return {"color" : "#8972b3", "opacity" : 1, "weight" : 6};
        case "Paved Greenway":
          return {"color" : "#8ac33f", "opacity" : 1, "weight" : 6};
        case "Future Greenway":
          return {"color" : "#619143", "opacity" : 1, "weight" : 6, "dashArray" : "10 10 10 10", "lineCap" : "square"};
        case "Sidepath":
          return {"color" : "#ead515", "opacity" : 1, "weight" : 6};
        case "Unpaved Trail":
          return {"color" : "#ab9464", "opacity" : 1, "weight" : 6};
        }
      }      
  }).addTo($rootScope.map);


  L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
  
  var shopIcon = L.AwesomeMarkers.icon({
    icon: 'wrench',
    markerColor: 'darkred'
  }); 

  $rootScope.bikeShops = L.esri.featureLayer({
    url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/0',
      pointToLayer: function (geojson, latlng) {
        return new L.Marker(latlng, {icon: shopIcon});
        
      }  
  }).addTo($rootScope.map);

  var parkIcon = L.AwesomeMarkers.icon({
    icon: 'android-car',
    markerColor: 'cadetblue'
  }); 
  $rootScope.parking = L.esri.featureLayer({
    url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/1',
      pointToLayer: function (geojson, latlng) {
        return new L.Marker(latlng, {icon: parkIcon});
        
      }  
  }).addTo($rootScope.map);

});
