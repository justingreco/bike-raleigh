angular.module('bikeRaleigh.controllers', ['geolocation'])
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state) {
  $scope.shopClick = function (shop) {
    console.log(shop);
    $rootScope.map.setView(shop.feature.geometry.coordinates.reverse(), 16);
    $state.go('app.map')    
  };
  $scope.greenwayClick = function (greenway) {
    console.log(greenway.feature.properties.name); 
    var latLngs = [];
    angular.forEach($rootScope.routes._layers, function (route) {
      if (route.feature.properties.name === greenway.feature.properties.name) {
        latLngs.push(route.getLatLngs());
      }
    });
    var pl = L.multiPolyline(latLngs);
    $rootScope.map.fitBounds(pl.getBounds());
    $state.go('app.map');
  };
  $scope.filterGreenways = function (greenway) {
    return greenway.feature.properties.category === 'Paved Greenway' && greenway.feature.properties.name;
  };
})
.controller('MapCtrl', function($scope, $http, $rootScope, geolocation) {
  $rootScope.map = L.map('map').setView([35.81889, -78.64447], 10);

  L.esri.basemapLayer('Topographic').addTo($rootScope.map);

  $scope.geoLocate = function () {
    navigator.geolocation.getCurrentPosition(function (position) {
      $rootScope.map.setView([position.coords.latitude, position.coords.longitude], 16);
    });
  };
  $http.get('data/bikemap.geojson').success(function (data) {
    var gj = L.geoJson(data, {
      style: function (feature, layer) {
        switch (feature.properties.category) {
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
    $rootScope.routes = gj;
  });
  $http.get('data/bikeshops.geojson').success(function (data) {
    var icon = L.icon({iconUrl: 'img/bicycle-24@2x.png', iconSize: [24,24]});
    var gj = L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return new L.Marker(latlng, {icon: icon});
      }
    }).addTo($rootScope.map);
    $rootScope.bikeShops = gj;
  });
});
