"use strict"
/*
var bdata = {
	latest: [{label: 'jan', values: [125,145]},{label: 'feb', values: [143,153]},{label: 'mar', values: [170,180]}, {label: 'apr', values: [150,160]}, {label: 'may', values: [160,170]},
		{label: 'jun', values: [185,200]}]
}

var bdata = {
	latest: [{label: 'jan', values: [145]},{label: 'feb', values: [153]},{label: 'mar', values: [180]}, {label: 'apr', values: [160]}, {label: 'may', values: [170]},
		{label: 'jun', values: [200]}]
}
*/

var bdata = {
	latest: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}, {label: 'may', values: [160,170,180]},
		{label: 'jun', values: [185,200,250]}],
	old: [{label: 'jan', values: [150]},{label: 'feb', values: [143]},{label: 'mar', values: [185]}, {label: 'apr', values: [160]}, {label: 'may', values: [180]},{label: 'jun', values: [200]},
			{label: 'jul', values: [170]},{label: 'aug', values: [180]},{label: 'sep', values: [250]}, {label: 'Oct', values: [200]}, {label: 'nov', values: [190]},{label: 'dec', values: [280]}]
}

// Single Or Multi Column Bar Chart
var BarChart = Ractive.extend({
	template: '#barChartT',
	init: function(options) {
		var self = this;
		this.bdata = options.bdata;
		this.cdata = options.bdata.latest;
		this.legend = options.legend;
		this.isStackBar = options.isStackBar || false;
		this.drawChart(this.bdata.latest);
		this.on({
			single: function(event){
				self.stackBar(false)
				self.cdataM(self.bdata.old)
				self.drawChart();
			},
			multiple: function(event){
				self.stackBar(false)
				self.cdataM(self.bdata.latest)
				self.drawChart();
			},
			stack: function(event){
				self.stackBar(true)
				self.cdataM(self.bdata.latest)
				self.drawChart();
			},
		})
	},
	barWidth: function(svgWidth){
		return svgWidth/(this.cdataM().length * 2) * .97;
	},
	cdataM: function(data){
		if (!arguments.length) return this.cdata;
		this.cdata = data;
	},
	stackBar: function (bool){
		if (!arguments.length) return this.isStackBar;
		this.isStackBar = bool;
	},
	dataScale: function(svgHeight){
		var data = this.cdataM();
		var self = this;
		var inputMax;
		if (!this.stackBar()) {
			inputMax = this.max(this.merge(this.pluck(data, 'values')));
		} else {
			inputMax = this.max(this.multiSum(this.pluck(data, 'values')));
		}
		var scale = this.linearScale({input:[0, inputMax], output:[0, svgHeight * 0.7]})
		var output = [];
		data.forEach(function(obj){
			obj.height = []
			obj.count = obj.values.length;
			obj.values.forEach(function(item, i){
				obj.height.push(scale(item))
			});
			obj.totalHeight = obj.height.reduce(function(p,n){return p+n}); // for stackbar
			obj.totalValue = obj.values.reduce(function(p,n){return p+n}); // for stackbar
			obj.accuHeights = self.accuSum(obj.height) // for stackbar
			output.push(obj)
		});
		return output;
	},
	linearScale: function(obj){
		var inputDomain = obj.input || [0, 1];
		var outputRange = obj.output || [0, 1];
		var factor = (outputRange[1] - outputRange[0]) / (inputDomain[1] - inputDomain[0]);
		return function(value){
			return outputRange[0] + (value - inputDomain[0]) * factor;
		};
	},
	// arrOfArrs = [[1,2],[3,4],[5,6]] -> [1,2,3,4,5,6]
	merge: function(arrOfArrs){
		var output = [];
		arrOfArrs.forEach(function(arr){
			arr.forEach(function(item){
				output.push(item)
			});
		});
		return output;
	},
	max: function(arr){
		return Math.max.apply(null, arr);
	},
	// arrOfArrs = [[1,2],[3,4],[5,6]] -> [[3],[7],[11]]
	multiSum: function(arrOfArrs){
		var output = [];
		arrOfArrs.forEach(function(arr){
			output.push(arr.reduce(function(p,n){return p + n}));
		})
		return output;
	},
	// [1,2,3,4,5] -> [0, 1, 3, 6, 10]
	accuSum: function(arr){
		var output = [];
		var accumlator;
		arr.forEach(function(item, i){
			if (i == 0) {
				accumlator = 0;
			} else {
				accumlator += arr[i-1];
			}
			output.push(accumlator)
		});
		return output;
	},
	pluck: function(arr, key){
		var output = []
		arr.forEach(function(obj){
			output.push(obj[key]);
		});
		return output;
	},
	drawChart: function(){
		var svgWidth = this.nodes.barChart.clientWidth;
		var svgHeight = this.nodes.barChart.clientHeight;
		var self = this;
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			mydata: self.dataScale(svgHeight),
			width: self.barWidth(svgWidth),
			legend: self.legend,
			isStackBar: self.stackBar(),
		});
	}
});

var barChart = new BarChart({
	el: '#container',
	bdata: bdata,
	isStackBar: true,
	legend: {
		colors:['green', 'blue', 'rgba(255,0,0,0.6)'],
		colorLables: ['Chemestry', 'Physics', 'Maths'],
	},
});

var resize = function(){
	barChart.drawChart();
}
window.onresize = resize;
