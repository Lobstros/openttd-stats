/**
 ** I take no responsibility for any sanity damage resulting from looking at this code. It is a complete and utter mess.
 **
 ** To use, add something like the following to page this file is included in:
 **     <h2>Company value</h2>
 **     <svg id="moneychart" width="800" height="600"></svg>
 **     <h2>Combined fleet size</h2>
 **     <svg id="vehiclechart" width="800" height="600"></svg>
 **
 **/

allcompanydata.forEach(function(company) {
  company.data.forEach(function(d) { d.t = new Date(d.t * 1000); });
});

var tmin = d3.min(allcompanydata, function(company){ return d3.min(company.data, function(d) { return d.t; } ); });
var tmax = d3.max(allcompanydata, function(company){ return d3.max(company.data, function(d) { return d.t; } ); });
var valuemin = d3.min(allcompanydata, function(c){ return d3.min(c.data, function(d) { return d.value; } ); });
var valuemax = d3.max(allcompanydata, function(c){ return d3.max(c.data, function(d) { return d.value; } ); });
var vehiclemin = d3.min(allcompanydata, function(c){ return d3.min(c.data, function(d) { return d.trains + d.cars + d.planes + d.ships; } ); });
var vehiclemax = d3.max(allcompanydata, function(c){ return d3.max(c.data, function(d) { return d.trains + d.cars + d.planes + d.ships; } ); });

var width = 800,
    height = 600,
    margin = { top: 20, right: 15, bottom: 20, left: 50 }

function makeChart(chartid, xaxis, yaxis, w, h, margin) {

var chart = d3.select("#"+chartid)

  chart.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h - margin.bottom) + ")")
    .call(xaxis);
  chart.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin.left) + ",0)")
    .call(yaxis);

    return chart;
}

function makeTimeScale (range, domain) {
    return d3.time.scale()
             .range(range)
             .domain(domain);
}

function makeLinearScale (range, domain) {
    return d3.scale.linear()
             .range(range)
             .domain(domain);
}

var xScale = makeTimeScale([margin.left, width - margin.right], [tmin,tmax])
var yScaleMoney = makeLinearScale([height - margin.top, margin.bottom], [valuemin, valuemax])
var yScaleVehicle = makeLinearScale([height - margin.top, margin.bottom], [vehiclemin, vehiclemax])
var xAxis = d3.svg.axis().scale(xScale);
var yAxisMoney = d3.svg.axis().scale(yScaleMoney).orient("left").tickFormat(d3.format("1s"));
var yAxisVehicle = d3.svg.axis().scale(yScaleVehicle).orient("left").tickFormat(d3.format("1s"));

moneychart = makeChart("moneychart", xAxis, yAxisMoney, width, height, margin)
vehiclechart = makeChart("vehiclechart", xAxis, yAxisVehicle, width, height, margin)
/*spendchart = makechart("spendchart", xAxis, yAxisSpend, width, height, margin)*/

var lineGenMoney = d3.svg.line()
.x(function(d) {return xScale(d.t);})
.y(function(d) {return yScaleMoney(d.value);})
.interpolate("linear");

var lineGenVehicle = d3.svg.line()
.x(function(d) {return xScale(d.t);})
.y(function(d) {return yScaleVehicle(d.cars + d.trains + d.planes + d.ships);})
.interpolate("step-after");

allcompanydata.forEach(function(company) {
  moneychart.append('svg:path')
     .attr('d', lineGenMoney(company.data))
     .attr('stroke', company.color)
     .attr('stroke-width', 2)
     .attr('fill', 'none');
  vehiclechart.append('svg:path')
     .attr('d', lineGenVehicle(company.data))
     .attr('stroke', company.color)
     .attr('stroke-width', 2)
     .attr('fill', 'none');
});

paths = moneychart.selectAll('path.line')
/*
 paths.selectAll('.point')
.data((d) -> d)
.enter().append("svg:circle")
.attr("class", 'point')
.attr("r", 4)
.attr("cx", (d, i) -> x(i))
.attr("cy", (d) -> y(d))
.on('mouseover', -> d3.select(this).attr('r', 8))
.on('mouseout', -> d3.select(this).attr('r', 4))
.on('click', (d, i) -> console.log d, i) 
*/

function addLegend (chart, data, margin) {
var legend = chart.selectAll('.legend')
    .data(data)
    .enter().append('g')
    .attr('class', 'legend');

legend.append('rect')
    .attr('x', margin.left + 25 )
    .attr('y', function(d, i){ return (i *  20) + 20;})
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) { return d.color; } );

legend.append('text')
    .attr('x', margin.left + 40 )
    .attr('y', function(d, i){ return (i *  20) + 30;})
    .text(function(d){ return d.name; });

return legend;
}

moneylegend = addLegend(moneychart, allcompanydata, margin);
vehiclelegend = addLegend(vehiclechart, allcompanydata, margin);
