(function ($) {
  "use strict";

  /*-------------------------------------
   // Marker Map
   -------------------------------------*/
  if ($("#markergoogleMap").length) {
    window.onload = function () {
      var styles = [{
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{
          color: '#b7d0ea'
        }]
      }, {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{
          visibility: 'off'
        }]
      }, {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{
          visibility: 'off'
        }]
      }, {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{
          color: '#c2c2aa'
        }]
      }, {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{
          color: '#b6d1b0'
        }]
      }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
          color: '#6b9a76'
        }]
      }];
      var options = {
        mapTypeControlOptions: {
          mapTypeIds: ['Styled']
        },
        center: new google.maps.LatLng(-37.81618, 144.95692),
        zoom: 10,
        disableDefaultUI: true,
        mapTypeId: 'Styled'
      };
      var div = document.getElementById('markergoogleMap');
      var map = new google.maps.Map(div, options);
      var styledMapType = new google.maps.StyledMapType(styles, {
        name: 'Styled'
      });
      map.mapTypes.set('Styled', styledMapType);

      var marker = new google.maps.Marker({
        position: map.getCenter(),
        animation: google.maps.Animation.BOUNCE,
        icon: 'img/map-marker.png',
        map: map
      });
    };
  }

})(jQuery);