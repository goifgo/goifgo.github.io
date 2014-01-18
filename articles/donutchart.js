"use strict"
var bdata = {
	latest: [{label:'jan', values:[25,20,10]}],
	old: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}, {label: 'may', values: [160,170,180]},
		{label: 'jun', values: [185,200,250]}]
}

var PieChart = Ractive.extend({
	init: function(options){
		this.cdata = options.bdata.latest[0].values;
		this.legend = options.data.legend;
		this.divId = options.divId;
		this.chartType = options.data.chartType;
		this.drawChart();
	},
	drawChart: function(){
		var self = this;
		var svgWidth = this.nodes[this.divId].clientWidth;
		var svgHeight = this.nodes[this.divId].clientHeight;	
		this.outerRadius = svgWidth > svgHeight ? svgHeight * 0.4 : svgWidth * 0.45;
		this.innerRadius = this.outerRadius * 0.4;
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			sectors: self.sectorsM(),
		});
	},
	// The term angle has been used loosely here to mean angle in radians i.e startAngle means startAngleInRadians
	sectorsM: function(){
		var r0 = this.innerRadius;
		var r1 = this.outerRadius;
		var arcs = this.arcs();
		var self = this;
		//Convert arc angles into (x,y) points
		var sectors = []
		arcs.forEach(function(d, i){
			var a0 = d.startAngle;
			var a1 = d.endAngle;

			var c0 = Math.cos(a0); // cos is for x. Multiplying with r to convert from unit circle
			var s0 = Math.sin(a0); // sin is for y
			var c1 = Math.cos(a1);
			var s1 = Math.sin(a1);
			
			var labelRadians = (d.endAngle + d.startAngle)/2;
			var largeArcFlag = (d.endAngle - d.startAngle) > Math.PI ? 1 : 0; 
			var path, valueLabel;
			if (self.chartType == 'donut') {
				path = "M" + c0 * r1 + " " + s0 * r1 // arc starting point
				+ " A" + r1 + " " + r1 + " 0 " + largeArcFlag + " 1 " + c1 * r1 + " " + s1 * r1 // draw arc to the arc ending ponit in clockwise
				+ " L" + c1 * r0 + " " + s1 * r0 // draw line to inner circle coordinate.
				+ " A" + r0 + " " + r0 + " 0 " + largeArcFlag + " 0 " + c0 * r0 + " " + s0 * r0 // draw arc to the arc ending ponit in Anti-clockwise
				+ " Z"; // move to strarting point
				valueLabel = {x: Math.cos(labelRadians) * (r1 - (r1-r0)/2), y: Math.sin(labelRadians) * (r1- (r1-r0)/2)}; 
			} else if (self.chartType == 'pie') {
				path = "M" + c0 * r1 + " " + s0 * r1 // arc starting point
				+ " A" + r1 + " " + r1 + " 0 " + largeArcFlag + " 1 " + c1 * r1 + " " + s1 * r1 // draw arc to the arc ending ponit in clockWise
				+ " L 0 0"
				+ " Z"; // move to strarting point
				valueLabel = {x: Math.cos(labelRadians) * r1 / 2, y: Math.sin(labelRadians) * r1 / 2}; 
			}
			sectors[i] = {
				color: self.legend.colors[i], 
				value: d.data,
				valueLabel: valueLabel,
				path: path,
			}
		});
		return sectors;
		//Syntax for Arc(A) in path	
		//A rx ry x-axis-rotation large-arc-flag sweep-flag x y
		// x-axix-rotation will be useful if rx and ry are different
		// large-arc-flag: for every arc there are two possible ways to draw. If arc value < PI set 0 else 1, for drawing pie chart.
		// sweep-flag: colckwise or anti-clockwise . 1 for clockwise and 0 for anti-clockwise direction 
	},

	// [20, 30, 40] --> [{startAngle: 0, endAngle: 1.3962, data: 20}, ....]
	arcs: function(){
		var arr = this.cdata;
		var startAngle = 0; // If you use Math.PI here instead of zero, you can get half Circle.
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
});

var cfgObj = {
	el: '#container',
	template: '#pieChartT',
	divId: 'pieChart', // Required while setting svgWidth and svgHeight via nodes 
	bdata: bdata,
	data: {
		chartTitle: 'Revenue YTD',
		chartType: 'donut', // other option 'pie'
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

// Pie Chart Notes
// 360deg = 2 * PI radians = endAngle
// Step1: Findout radians per unit of data i.e. k = 2 * PI / sum(array)
// Step2: Findout arc startAngle and endAngle i.e startAngle = 0 and endAngle = k * array[i] . For next item endAngle become startAngle
// Step3: Findout (x,y) coordinates of arcAngles i.e x = cos(angle) and y = sin(angle)
// Step4: Multiply (x,y) values with radius i.e multiply unit circle values with radius
// Step5: Draw Path

