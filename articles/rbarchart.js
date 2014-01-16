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
	old: [{label: 'jan', values: [150,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}, {label: 'may', values: [160,170,180]},
		{label: 'jun', values: [185,200,300]}]
}

// Single Or Multi Column Bar Chart
var BarChart = Ractive.extend({
	template: '#barChartT',
	init: function(options) {
		var self = this;
		this.bdata = options.bdata;
		this.legend = options.legend;
		this.drawChart(this.bdata.latest)
		this.on({
			lastyear: function(event){
				console.log('Last year!')
				self.drawChart(self.bdata.old);
			},
			currentyear: function(event){
				console.log('Current year!')
				self.drawChart(self.bdata.latest);
			},
		})
	},
	barWidth: function(data, svgWidth){
		return svgWidth/(data.length * 2) * 0.9;
	},
	dataScale: function(data, svgHeight){
		var inputMax = this.max(this.merge(this.pluck(data, 'values')));
		var output = [];
		var scale = this.linearScale({input:[0, inputMax], output:[0, svgHeight * 0.7]})
		data.forEach(function(obj){
			obj.height = []
			obj.count = obj.values.length;
			console.log(obj.count)
			obj.values.forEach(function(item, i){
				obj.height.push(scale(item))
			});
			output.push(obj)
		})
		console.log(output)
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
	pluck: function(arr, key){
		var output = []
		arr.forEach(function(obj){
			output.push(obj[key]);
		});
		return output;
	},
	drawChart: function(data){
		var svgWidth = this.nodes.barChart.clientWidth;
		var svgHeight = this.nodes.barChart.clientHeight;
		var self = this;
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			mydata: self.dataScale(data, svgHeight),
			width: self.barWidth(data, svgWidth),
			legend: self.legend,
		});
	}
});

var barChart = new BarChart({
	el: '#container',
	bdata: bdata,
	legend: {
		colors:['green', 'blue', 'yellow'],
		colorLables: ['Chemestry', 'Physics', 'Maths'],
	},
});
var resize = function(){
	barChart.drawChart(barChart.bdata.latest);
}
window.onresize = resize;
