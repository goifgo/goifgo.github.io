"use strict"

var BarChart = Ractive.extend({
	template: '#barchartT',
	init: function(options) {
		var self = this;
		this.bdata = options.bdata;
		/*
		this.set('bdata', this.bdata);
		this.set('svgwidth', this.svgwidth);
		this.set('svgheight', this.svgheight);
		this.set('width', this.barwidth(this.bdata, this.svgwidth));
		console.log(this.svgheight);
		*/
	},
	name: function(){
		console.log(this.bdata);
	},
	barwidth: function(bdata, svgwidth){
		return svgwidth/(bdata.length * 2) * 0.9;
	},
	dataScale: function(data, svgheight){
		var inputMax = this.max(this.pluck(data, 'value'));
		var output = [];
		var scale = this.linearScale({input:[0, inputMax], output:[0, svgheight]})
		data.forEach(function(obj){
			obj.height = scale(obj.value)
			output.push(obj)
		})
		return output;
	},
	linearScale: function(obj){
		var inputDomain = obj.input || [0, 1];
		var outputRange = obj.output || [0, 1];
		var factor = (outputRange[1] - outputRange[0]) / (inputDomain[1] - inputDomain[0]);
		return function(value){
			return value * factor;
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

var barchart = new BarChart({
	el: '#container',
	bdata: [{label: 'jan', value: 100},{label: 'feb', value: 50},{label: 'march', value: 200}, {label: 'april', value: 200}, {label: 'may', value: 300},
		{label: 'jun', value: 200}, {label: 'jul', value:150}, {label:'aug', value: 200}, {label: 'sep', value: 250}, {label: 'oct', value: 180}, {label: 'nov', value:200}, {label: 'dec', value: 350}],
});

var resize = function updateWindow() {
	var svgWidth = barchart.nodes.barchart.clientWidth;
	var svgHeight = barchart.nodes.barchart.clientHeight;
	var hfactor = 0.8;
	//svgHeight = 800;
	console.log(svgHeight);
   barchart.set({
		svgwidth: svgWidth,
		svgheight: svgHeight,
		bdata: barchart.dataScale(barchart.bdata, svgHeight * hfactor),
		width: barchart.barwidth(barchart.bdata, svgWidth),
	});
}
resize()
window.onresize = resize 
