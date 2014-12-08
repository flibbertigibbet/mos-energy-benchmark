(function () {
    'use strict';

    /*
     * ngInject
     */
    function MapController($scope, $timeout) {

        // temp:  http://azavea-demo.cartodb.com/api/v2/viz/701a2d94-44f2-11e4-bb22-0e10bcd91c2b/viz.json
        // age: http://azavea-demo.cartodb.com/api/v2/viz/d9998c20-7bf6-11e4-b489-0e853d047bba/viz.json

        console.log('in map controller');
        cartodb.createVis('mymap', 'http://azavea-demo.cartodb.com/api/v2/viz/701a2d94-44f2-11e4-bb22-0e10bcd91c2b/viz.json')
            .done(function(vis, layers) {
                console.log('viz created');
                var nativeMap = vis.getNativeMap();
                var overlay = layers[1];
                console.log(nativeMap);
                console.log(overlay);

                //var sublayer = overlay.getSubLayer(0);
                //overlay.infowindow.set('energy_star_score', '<p>foo!</p>');

                var opts = {infowindowTemplate: '<p>foo!</p>',
                            triggerEvent: 'featueHover'
                            };

                //var info = vis.addInfowindow(nativeMap, overlay, ['energy_star_score'], opts);
                //console.log(info);
            });

        //$timeout(function () { map.invalidateSize(); });

    }

    angular.module('mos.views.map')
    .controller('MapController', MapController);

})();