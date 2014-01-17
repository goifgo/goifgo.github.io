"use strict"
var bdata = {
	latest: [{label:'jan', values:[125,145,135]}],
	old: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}, {label: 'may', values: [160,170,180]},
		{label: 'jun', values: [185,200,250]}]
}

var PieChart = Ractive.extend({
	init: function(options){
		this.cdata = options.bdata.latest[0].values;
		this.legend = options.data.legend;
		this.divId = options.divId;
		this.drawChart();
	},
	drawChart: function(){
		var self = this;
		var svgWidth = this.nodes[this.divId].clientWidth;
		var svgHeight = this.nodes[this.divId].clientHeight;	
		this.radius = svgHeight * 0.4
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			sectors: self.sectorsM(),
		});
	},
	sectorsM: function(){
		var r = this.radius;
		var arcs = this.arcs();
		//Convert arc angles into (x,y) points
		var sectors = []
		var self = this;
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
	// [20, 30, 40] --> [{startAngle: 0, endAngle: 1.3962, data: 20}, ....]
	arcs: function(){
		var arr = this.cdata;
		var startAngle = 0
		var endAngle = 2 * Math.PI // in radians i.e 2 * 3.14159 i.e 2 * 22/7
		var radiansPerUnit = (endAngle - startAngle)/arr.reduce(function(p,n){return p + n})
		var arcs = [];
		arr.forEach(function(d,i){
			arcs[i] = {
				startAngle: startAngle,
				endAngle: startAngle += d * radiansPerUnit,
				data: d
			}
		});
		return arcs;
	},
	// {input: [], output: []} --> function
	linearScale: function(obj){
		var inputDomain = obj.input || [0, 1];
		var outputRange = obj.output || [0, 1];
		var factor = (outputRange[1] - outputRange[0]) / (inputDomain[1] - inputDomain[0]);
		return function(value){
			return outputRange[0] + (value - inputDomain[0]) * factor;
		};
	},
});

var cfgObj = {
	el: '#container',
	template: '#pieChartT',
	divId: 'pieChart', // Required while setting svgWidth and svgHeight via nodes 
	bdata: bdata,
	dualRadius: true,
	data: {
		chartTitle: 'Revenue YTD',
		legend: {
			colors:['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.6)'],
			colorLables: ['Chemestry', 'Physics', 'Maths'],
		},
	}
};

// Anything that you add to "data" in ractive instance, will be availabe in template
// Anything that you add via ractive.set() will be added to 'data' and wil be availble in template
// In case if you are using Ractive.extend() anything that you add to this.set() via init method will be added to 'data' and will be available in template
// If you override by setting this.data in init method, your TEMPLATE WON'T WORK, though your js works. Overridden values will be available in template. Often that may not be what you needed.

// Any key-values that you intend to use in template add them to 'data' key othewise you have to deal with them twice, once in cfgObj and once in Ractive.extend init set methods
// Any key-values that you intend to use in template after manipulating them in js, may be you can use separate key and after manipulating you can use .set() method to make it available in template

// Arrays that you intend to use in templates, must be used by iterating i.e {{#arr:i}} {{/arr}}. You can not directly use myarr[5].value . If you want use myarray.5.value . Refer issue #386. Its a bug.

var pieChart = new PieChart(cfgObj);
var resize = function(){
	pieChart.drawChart();
};
window.onresize = resize;
