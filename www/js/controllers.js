angular.module('bikeRaleigh.controllers', ['geolocation'])
.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, $state, $window) {
  if (!$rootScope.map && $state.current.name != 'app.map') {
    $state.go('app.map');
    $window.location.reload(true);
  }
  $scope.benefitMemberClick = function (member) {
    console.log(member);
    $rootScope.map.setView(member.feature.geometry.coordinates.reverse(), 16);
    $state.go('app.map');
    $timeout(function () {
      member.openPopup(); 
    });    
  };  
  $scope.shopClick = function (shop) {
    console.log(shop);
    $rootScope.map.setView(shop.feature.geometry.coordinates.reverse(), 16);
    $state.go('app.map');
    $timeout(function () {
      shop.openPopup(); 
    });
  };
  $scope.greenwayClick = function (greenway) {
    $rootScope.routes.query()
      .where("NAME = '" + greenway.feature.properties.NAME + "'")
      .run(function (error, featureCollection) {
        $rootScope.map.fitBounds(L.geoJson(featureCollection).getBounds());
          $state.go('app.map');
        $timeout(function () {
            greenway.openPopup(); 
        });   
      });
      map.fitBounds(pl.getBounds());
  };
  $scope.filterGreenways = function (greenway) {
    return greenway.feature.properties.CATEGORY === 'Paved Greenway' && greenway.feature.properties.NAME;
  };
})
.controller('MapCtrl', function($scope, $http, $rootScope, geolocation) {
  if (!$rootScope.map) {
    var map = L.map('map', {zoomControl:false}).setView([35.75, -78.695], 10);
    var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    }).addTo(map);
    $rootScope.locate = L.control.locate({follow: true}).addTo(map);
    $scope.locating = false;
    $scope.geoLocate = function () {
      $scope.locating = !$scope.locating;
      if ($scope.locating) {
        $rootScope.locate.start();
      } else {
        $rootScope.locate.stop();
      }
    };
    var routes = L.esri.featureLayer({
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
    }).addTo(map);
    routes.bindPopup(function (feature) {
      if (!feature.properties.NAME) {
        feature.properties.NAME = '';
      }      
      return L.Util.template('<strong>{NAME}</strong><p>{CATEGORY}</p>', feature.properties);
    }); 
    $rootScope.routes = routes;
    L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
    var shopIcon = L.AwesomeMarkers.icon({
      icon: 'wrench',
      markerColor: 'darkred'
    }); 
    var bikeShops = L.esri.featureLayer({
      url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/0',
      pointToLayer: function (geojson, latlng) {
        return new L.Marker(latlng, {icon: shopIcon});
      }  
    }).addTo(map);
    bikeShops.bindPopup(function (feature) {
      return L.Util.template('<strong>{LABEL}</strong>', feature.properties);
    });
    $rootScope.bikeShops = bikeShops;
    var parkIcon = L.AwesomeMarkers.icon({
      icon: 'android-car',
      markerColor: 'cadetblue'
    }); 
    var parking = L.esri.featureLayer({
      url: 'http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/1',
      minZoom: 14,    
      pointToLayer: function (geojson, latlng) {
        return new L.Marker(latlng, {icon: parkIcon});
      }  
    }).addTo(map);
    parking.bindPopup(function (feature) {
      return L.Util.template('<strong>{TYPE}</strong><p>{ADDRESS}</p><p>{BETWEEN_}</p>', feature.properties);
    });
    $rootScope.parking = parking;

    var benefitIcon = L.AwesomeMarkers.icon({
      icon: 'ion-plus-round',
      markerColor: 'green'
    }); 
    var benefitMembers = L.esri.featureLayer({
      url: 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Bike_Friendly_Businesses/FeatureServer/0',
      pointToLayer: function (geojson, latlng) {
        return new L.Marker(latlng, {icon: benefitIcon});
        
      }  
    }).addTo(map);
    benefitMembers.bindPopup(function (feature) {
      return L.Util.template('<strong>{name}</strong><p>{address}</p><p>{discount}</p><p><a href="{web}" target="_blank">Website</a></p>', feature.properties);
    });
    $rootScope.benefitMembers = benefitMembers;
    $rootScope.map = map;
  }
})
.controller('LegendCtrl', function($scope, $http, $rootScope, $state, $window) {
  $scope.routeTypes = [];
  if (!$rootScope.map) {
    $state.go('app.map');
    $window.location.reload(true);
  }
  if (!$rootScope.pointLayers) {
      $rootScope.pointLayers = [
      {label: 'Bike Shops', layer: $rootScope.bikeShops, visible: true, image: 'img/shop.png'},
      {label: 'Bike Benefit Members', layer: $rootScope.benefitMembers, visible: true, image: 'img/benefits.png'}, 
      {label: 'Bike Parking', layer: $rootScope.parking, visible: true, image: 'img/parking.png'}];
  }
  $scope.pointLayerToggled = function (layer) {
    console.log(layer);
    if (layer.visible) {
      $rootScope.map.addLayer(layer.layer);
    } else {
      $rootScope.map.removeLayer(layer.layer);
    }
  };
  $scope.routeLayerToggled = function (layer) {
    if (layer.visible) {
      $scope.routeTypes.push(layer.label)
    } else {
      $scope.routeTypes.splice($scope.routeTypes.indexOf(layer.label), 1);
    }
    $rootScope.routes.setWhere("CATEGORY IN ('" + $scope.routeTypes.toString().replace(/,/g, "','") + "')");
    console.log($rootScope.routes.getWhere());
  };
  if (!$rootScope.routeLayers) {
    $http.get('http://mapstest.raleighnc.gov/arcgis/rest/services/Transportation/BikeRaleigh/MapServer/legend?f=json').then(function (response) {
      angular.forEach(response.data.layers, function (l) {
        if (l.layerName === 'Bike Routes') {
          angular.forEach(l.legend, function (i) {
            $scope.routeTypes.push(i.label);
            i.visible = true;
          });
          $rootScope.routeLayers = l.legend;
        }
      });
    });
  }
})
.controller('FeedbackCtrl', function($scope, $http, $rootScope) {

});