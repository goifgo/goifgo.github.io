"use strict"
var bdata = {
	latest: [{label: 'jan', value: 145},{label: 'feb', value: 153},{label: 'mar', value: 180}, {label: 'apr', value: 160}, {label: 'may', value: 170},
		{label: 'jun', value: 200}, {label: 'jul', value: 210}, {label:'aug', value: 220}, {label: 'sep', value: 210}, {label: 'oct', value: 240}, {label: 'nov', value:200}, {label: 'dec', value: 250}],
	old: [{label: 'jan', value: 130},{label: 'feb', value: 153},{label: 'mar', value: 180}, {label: 'apr', value: 160}, {label: 'may', value: 170},
		{label: 'jun', value: 200}, {label: 'jul', value: 210}, {label:'aug', value: 220}, {label: 'sep', value: 210}, {label: 'oct', value: 240}, {label: 'nov', value:200}, {label: 'dec', value: 150}],
}

// Column Bar Chart
var BarChart = Ractive.extend({
	template: '#barChartT',
	init: function(options) {
		var self = this;
		this.drawChart(bdata.latest)
		this.on({
			lastyear: function(event){
				console.log('Last year!')
				self.drawChart(bdata.old);
			},
			currentyear: function(event){
				console.log('Current year!')
				self.drawChart(bdata.latest);
			},
		})
	},
	name: function(){
		console.log(this.bdata);
	},
	barWidth: function(bdata, svgWidth){
		return svgWidth/(bdata.length * 2) * 0.9;
	},
	dataScale: function(data, svgHeight){
		var inputMax = this.max(this.pluck(data, 'value'));
		var output = [];
		var scale = this.linearScale({input:[0, inputMax], output:[0, svgHeight * 0.7]})
		data.forEach(function(obj){
			obj.height = scale(obj.value);
			output.push(obj)
		})
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
			bdata: self.dataScale(data, svgHeight),
			width: self.barWidth(data, svgWidth),
		});
	}
});

var barChart = new BarChart({
	el: '#container',
	bdata: bdata.latest
});
var resize = function(){
	barChart.drawChart(bdata.latest);
}
window.onresize = resize;
