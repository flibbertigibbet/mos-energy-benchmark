(function () {
    'use strict';

    /*
     * ngInject
     */
    function MapController($scope, $timeout, $compile) {
        // temp:  http://azavea-demo.cartodb.com/api/v2/viz/701a2d94-44f2-11e4-bb22-0e10bcd91c2b/viz.json
        // age: http://azavea-demo.cartodb.com/api/v2/viz/d9998c20-7bf6-11e4-b489-0e853d047bba/viz.json

        // initialization
        $scope.compare_selections = [];  // array of up to three selections to compare
        $scope.current_popup_id = -1;    // track the cartodb_id of the last feature clicked

        console.log('in map controller; going to load map viz...');

        $scope.compare = function() {

        };

        // compiled AngularJS HTML conflicts with Carto moustache templating
        //var infowindow_click = $compile('<p><a onclick="foo()">Foo!</a></p>')($scope)[0];
        var infowindow_template = '<span><div class="cartodb-popup header yellow v2">' +
          '<a href="#close" class="cartodb-popup-close-button close">x</a>' +
          '<div class="cartodb-popup-content-wrapper">' +
            '<div class="cartodb-popup-content">' +
              '<h4>Address:</h4>' +
              '<p>{{address_1}}</p>' +
              '<h4>Emissions:</h4>' +
              '<p>{{direct_ghg_emissions_mtco2e}}</p>' +
              '<h4>ID:</h4>' + 
              '<p>{{cartodb_id}}</p>' +
              '<p><a onclick="myFoo()">Foo!</a></p>' +
            '</div>' +
          '</div>' +
          '<div class="cartodb-popup-tip-container"></div>' +
        '</div></span>';

        console.log(infowindow_template);

        // load map visualization
        cartodb.createVis('mymap', 'http://azavea-demo.cartodb.com/api/v2/viz/701a2d94-44f2-11e4-bb22-0e10bcd91c2b/viz.json')
            .done(function(vis, layers) {
                console.log('map viz loaded!');
                var nativeMap = vis.getNativeMap();
                var overlay = layers[1];
                console.log(nativeMap);
                console.log(overlay);

                var sublayer = overlay.getSubLayer(1);
                sublayer.infowindow.set('template', infowindow_template);

                sublayer.on('featureClick', function(e, latlng, pos, data, subLayerIndex) {

                    console.log('hey, that tickles!');

                    // if we want to, can go asynchronously fetch stuff here / do other things

                    
                    var qry = 'SELECT cartodb_id, energy_star_score, address_1, direct_ghg_emissions_mtco2e, property_name ' + 
                    'FROM mos_beb_2012 where cartodb_id = {{id}}';
                    var sql = new cartodb.SQL({ user: 'azavea-demo'});
                    sql.execute(qry, { id: data.cartodb_id})
                        .done(function(data) {
                            var data = data.rows[0];
                            console.log(data);
                            $scope.current_popup_id = data.cartodb_id;

                        }).error(function(errors) {
                            // returns a list
                            console.log('errors: ' + errors);
                        });
                    

                });

                console.log(sublayer.getSQL());
            });

        // $timeout(function () { map.invalidateSize(); });

    }

    angular.module('mos.views.map')
    .controller('MapController', MapController);

})();

// onclick event for infowindow
function myFoo() {
    'use strict';

    console.log('clicked infowindow');

    // get reference to AngularJS scope
    var scope = angular.element($("#mymap")).scope();

    // can reference things on scope within apply function
    scope.$apply(function() {
        scope.msg = 'yee haw';
        console.log(scope.current_popup_id);
    });
}