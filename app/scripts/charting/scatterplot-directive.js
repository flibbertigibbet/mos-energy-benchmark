(function () {
    'use strict';

    // Define object config of properties for this chart directive
    var ScatterPlotDefaults = {
        plotWidth: 800,
        plotHeight: 400,
        pointFillColor: '#14bfd6',
        pointStrokeColor: '#ddd',
        xDefaultDim: 'site_eui',
        yDefaultDim: 'total_ghg',
        areaDefaultDim: 'electricity',
        colorDefaultDim: 'sector',
        minRadius: 1,
        maxRadius: 6
    };

    /**
     * ngInject
     */
    function scatterPlot (ColorService, ScatterPlotDefaults) {

        var PLOT_CLASS = 'mos-scatterplot';

        // Private vars
        var chart = null;
        var leftaxis = null;
        var leftaxisg = null;
        var bottomaxis = null;
        var bottomaxisg = null;

        // Begin directive module definition
        var module = {};

        module.restrict = 'EA';
        module.templateUrl = 'scripts/charting/scatterplot-partial.html';
        module.controller = 'ChartingController';

        module.scope = {
            data: '=',              // Required
            id: '@',                // Required
            plotWidth: '@',
            plotHeight: '@',
            pointFillColor: '@',
            pointStrokeColor: '@',
            xDefaultDim: '@',
            yDefaultDim: '@',
            areaDefaultDim: '@',
            colorDefaultDim: '@',
            minRadius: '@',
            maxRadius: '@',
            margin: '&'
        };

        module.link = function ($scope, element, attrs) {
            $scope.configure(ScatterPlotDefaults);

            var config = $scope.config;

            $scope.axisOptions = ColorService.getSizeByFields();
            $scope.colorOptions = ColorService.getColorByFields();

            $scope.selected = {
                x: config.xDefaultDim,
                y: config.yDefaultDim,
                color: config.colorDefaultDim,
                area: config.areaDefaultDim
            };

            $scope.changeSelectedOption = function (option, key) {
                $scope.selected[option] = key;
                $scope.plotComplete = false;
                $scope.redraw($scope.data);
            };

            // TODO: maybe do legends with superscripts, like this?
            // http://bl.ocks.org/mbostock/6738229

            element.addClass(PLOT_CLASS);
            chart = d3.select('#' + attrs.id + ' .chart')
                    .attr('width', config.plotWidth)
                    .attr('height', config.plotHeight);
            leftaxis = d3.svg.axis().orient('left');
            leftaxisg = chart.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + config.margin.left + ',0)');
            bottomaxis = d3.svg.axis().orient('bottom');
            bottomaxisg = chart.append('g')
                               .attr('class', 'x axis')
                               .attr('transform', 'translate(0, ' +
                                           (config.plotHeight - config.margin.bottom) +
                                           ')');

            // add legend for color
            var setSecondLegend = function() {
                // first remove previous second legend
                $('div.cartodb-legend.choropleth').remove();
                $('div.cartodb-legend.custom').remove();
                var parent = $('#scatterplot');
                console.log(parent);
                $(parent).append(ColorService.getLegend($scope.selected.color));
            };

            // Overridden ChartingController method
            $scope.plot = function(data) {
                var xDim = $scope.selected.x;
                var yDim = $scope.selected.y;
                var areaDim = $scope.selected.area;
                var colorDim = $scope.selected.color;

                // Need to make sure that all values are at least 1 for a log scale.
                var datumX = function(datum) { return datum[xDim] < 1 ? 1 : datum[xDim]; };
                var datumY = function(datum) { return datum[yDim] < 1 ? 1 : datum[yDim]; };
                // Return the radius of a circle with area of this item
                var datumR = function(datum) {
                    if (datum[xDim] < 1 || datum[yDim] < 1) {
                        return 0;
                    }
                    return Math.sqrt(datum[areaDim] / Math.PI);
                };

                // Create SVG element inside container
                // Set up scaling and axes
                var x = d3.scale.log()
                        .domain([1, d3.max(data, datumX)])
                        .range([config.margin.left,
                                config.plotWidth - config.margin.right]);

                var y = d3.scale.log()
                        .domain([1, d3.max(data, datumY)])
                        .range([config.plotHeight - config.margin.bottom,
                                config.margin.top]);

                var r = d3.scale.linear()
                        .domain([0, d3.max(data, datumR)])
                        .range([config.minRadius, config.maxRadius]);

                leftaxis.scale(y);
                bottomaxis.scale(x);
                leftaxisg.call(leftaxis);
                bottomaxisg.call(bottomaxis);

                // Add tooltips
                var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-10, 0])
                        .html(function(d) {
                            /* jshint camelcase:false */
                            return '<span class="propertyName">' + d.property_name + '</span>';
                            /* jshint camelcase:true */
                        });
                chart.call(tip);

                // Create circles
                var circles = chart.selectAll('circle')
                                  .data(data);

                circles.enter().append('circle')
                       .attr('cx', function (d) { return x(datumX(d)); })
                       .attr('cy', function (d) { return y(datumY(d)); })
                        // Radius of zero initially so it can be animated on load
                       .attr('r', 0)
                       .attr('fill', config.pointFillColor)
                       .attr('stroke', config.pointStrokeColor)
                       .on('mouseover', tip.show)
                       .on('mouseout', tip.hide);
                circles.exit().remove();

                circles.transition().duration(2000)
                       .attr('cx', function (d) { return x(datumX(d)); })
                       .attr('cy', function (d) { return y(datumY(d)); })
                       .attr('fill', function (d) { return ColorService.getColor(colorDim, d[colorDim]); })
                       .attr('stroke', config.pointStrokeColor )
                       .attr('r', function (d) { return r(datumR(d)); });

                setSecondLegend();
            };
        };

        return module;
    }

    angular.module('mos.charting')
    .constant('ScatterPlotDefaults', ScatterPlotDefaults)
    .directive('mosScatterplot', scatterPlot);

})();
