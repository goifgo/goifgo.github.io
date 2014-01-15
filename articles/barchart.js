"use strict"
var bdata = {
	latest: [{label: 'jan', value: 145},{label: 'feb', value: 153},{label: 'mar', value: 180}, {label: 'apr', value: 160}, {label: 'may', value: 170},
		{label: 'jun', value: 200}, {label: 'jul', value: 210}, {label:'aug', value: 220}, {label: 'sep', value: 210}, {label: 'oct', value: 240}, {label: 'nov', value:200}, {label: 'dec', value: 250}],
	old: [{label: 'jan', value: 130},{label: 'feb', value: 153},{label: 'mar', value: 180}, {label: 'apr', value: 160}, {label: 'may', value: 170},
		{label: 'jun', value: 200}, {label: 'jul', value: 210}, {label:'aug', value: 220}, {label: 'sep', value: 210}, {label: 'oct', value: 240}, {label: 'nov', value:200}, {label: 'dec', value: 150}],
}

var BarChart = Ractive.extend({
	template: '#barChartT',
	init: function(options) {
		var self = this;
		this.bdata = options.bdata;
		/*
		this.set('bdata', this.bdata);
		this.set('svgWidth', this.svgWidth);
		this.set('svgHeight', this.svgHeight);
		this.set('width', this.barWidth(this.bdata, this.svgWidth));
		console.log(this.svgHeight);
		*/
		this.on({
			name: function(event){
				console.log('hi dear!')
				var svgWidth = barChart.nodes.barChart.clientWidth;
				var svgHeight = barChart.nodes.barChart.clientHeight;
				self.set({
					bdata:self.dataScale(bdata.old, svgHeight),
					width:self.barWidth(bdata.old, svgWidth),
				})
			}
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
	}
});

var barChart = new BarChart({
	el: '#container',
	bdata: bdata.latest
});

var resize = function updateWindow() {
	var svgWidth = barChart.nodes.barChart.clientWidth;
	var svgHeight = barChart.nodes.barChart.clientHeight;
	//svgHeight = 800;
	console.log(svgHeight);
   barChart.set({
		svgWidth: svgWidth,
		svgHeight: svgHeight,
		bdata: barChart.dataScale(bdata.latest, svgHeight),
		width: barChart.barWidth(bdata.latest, svgWidth),
	});
}
resize()
window.onresize = resize 
