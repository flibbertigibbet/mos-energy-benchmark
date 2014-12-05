(function () {
    'use strict';

    /*
     * ngInject
     */
    function MapController($scope, $timeout) {

        cartodb.createVis('mymap', 'http://azavea-demo.cartodb.com/api/v2/viz/d9998c20-7bf6-11e4-b489-0e853d047bba/viz.json')
            .done(function(vis, layers) {
                
            });

    }

    angular.module('mos.views.map')
    .controller('MapController', MapController);

})();