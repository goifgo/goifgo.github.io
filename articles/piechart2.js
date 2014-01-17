"use strict"
var PieChart = Ractive.extend({
	init: function(options){
		this.cdata = options.bdata;
		this.divId = options.divId;
		this.drawChart()
	},
	drawChart: function(){
		var self = this;
		var svgWidth = this.nodes[this.divId].clientWidth;
		var svgHeight = this.nodes[this.divId].clientHeight;	
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			sectors: self.sectors,
		});
	},
	sectorsM: function(arcs){
		var self = this;
		var r = this.radius;
		var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]
		//Convert arc angles into (x,y) points
		var sectors = []
		arcs.forEach(function(d, i){
			var a0 = d.startAngle;
			var a1 = d.endAngle;
			var c0 = Math.cos(a0); // cos is for x
			var s0 = Math.sin(a0); // sin is for y
			var c1 = Math.cos(a1);
			var s1 = Math.sin(a1);
			sectors[i] = {
				color: self.legend.colors[i], 
				path: "M" + r * c0 + "," + s0
				+ "A" + r + "," + r + " 0 " + "0" + ",1 " + r * c1 + "," + r*s1
				+ "L" + "0,0"
				+ "Z"
			}
		});
		return sectors;
	},
	// ([20, 30, 40], 10) --> [{startAngle: 0, endAngle: 1.3962, data: 20}, ....]
	arcs: function(data, radius){
		var startAngle = 0
		var endAngle = 2 * Math.PI // in radians i.e 2 * 3.14159 i.e 2 * 22/7
		var radiansPerUnit = (endAngle - startAngle)/data.reduce(function(p,n){return p + n})
		var arcs = [];
		data.forEach(function(d,i){
			arcs[i] = {
				startAngle: startAngle,
				endAngle: startAngle += d * radiansPerUnit,
				data: d
			}
		});
		return arcs;
	},
});

var bdata = {
	latest: [{label:'jan', values:[125,145,135]}],
	old: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}, {label: 'may', values: [160,170,180]},
		{label: 'jun', values: [185,200,250]}]
}
var cfgObj = {
	el: '#container',
	template: '#pieChartT',
	divId: 'pieChart', // Required while setting svgWidth and svgHeight via nodes 
	chartTitle: 'Revenue YTD',
	bdata: bdata,
	dualRadius: true,
	radius: 100,
	legend: {
		colors:['green', 'blue', 'rgba(255,0,0,0.6)'],
		colorLables: ['Chemestry', 'Physics', 'Maths'],
	},
};
var pieChart = new PieChart(cfgObj)
