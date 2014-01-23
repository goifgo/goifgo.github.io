// Kcharts
"use strict"
// Single Or Multi Column Bar Chart
var Kcharts = {
	// {input: [], output: []} --> function
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
	// (50,7,5) --> [35,   40,   45,   50,   55,   60,   65]
	// (50,8,5) --> [32.5, 37.5, 42.5, 47.5, 52.5, 57.5, 62.5, 67.5]
	alignMiddle: function(middlePoint, itemCount, change){
		 var center = itemCount/2 + 0.5;
		 var output = [];
		 for (var i=0; i < itemCount; i++) {
			output.push(middlePoint - ((center - i - 1) * change))
		 }
		 return output;
	},
	dataScale: function(data, svgHeight, isStackBar){
		var inputMax;
		if (!isStackBar) {
			inputMax = Kcharts.max(Kcharts.merge(Kcharts.pluck(data, 'values')));
		} else {
			inputMax = Kcharts.max(Kcharts.multiSum(Kcharts.pluck(data, 'values')));
		}
		var scale = Kcharts.linearScale({input:[0, inputMax], output:[0, svgHeight * 0.7]})
		var output = [];
		data.forEach(function(obj){
			obj.height = []
			obj.count = obj.values.length;
			obj.values.forEach(function(item, i){
				obj.height.push(scale(item))
			});
			obj.totalHeight = obj.height.reduce(function(p,n){return p+n}); // for stackbar
			obj.totalValue = obj.values.reduce(function(p,n){return p+n}); // for stackbar
			obj.accuHeights = Kcharts.accuSum(obj.height) // for stackbar
			output.push(obj)
		});
		return output;
	},
	sortAsc: function(a,b){
		return a - b;
	},
	sortDsc: function(a,b){
		return b - a;
	},
	// cdata = [20, 30, 40] 
	arcs: function(cdata){
		var startAngle = 0; // If you use Math.PI here instead of zero, you can get half Circle.
		var endAngle = 2 * Math.PI // in radians i.e 2 * 3.14159 i.e 2 * 22/7
		var radiansPerUnit = (endAngle - startAngle)/cdata.reduce(function(p,n){return p + n})
		var arcRad = [];
		cdata.forEach(function(d,i){
			var o = {
				startAngle: startAngle,
				endAngle: startAngle += d * radiansPerUnit,
				data: d
			}
			arcRad.push(o)
		});
		return Kcharts.arcXY(arcRad);
	},
	arcXY: function(arcs){
		arcs.forEach(function(obj){
			obj.c0 = Math.cos(obj.startAngle); // cos is for x. Multiplying with r to convert from unit circle
			obj.s0 = Math.sin(obj.startAngle); // sin is for y
			obj.c1 = Math.cos(obj.endAngle);
			obj.s1 = Math.sin(obj.endAngle);
			obj.largeArcFlag = (obj.endAngle - obj.startAngle) > Math.PI ? 1 : 0; 
			var labelRadians = (obj.endAngle + obj.startAngle)/2;
			obj.labelArcX = Math.cos(labelRadians);
			obj.labelArcY = Math.sin(labelRadians);
		})
		return arcs;
	},
	sectors: function(innerRadius, outerRadius, unitCircleArcs, arcColors, chartType){
		var r0 = innerRadius;
		var r1 = outerRadius;
		var arcs = unitCircleArcs;
		var sectors = []
		arcs.forEach(function(d, i){
			var path, valueLabel;
			if (chartType == 'donut') {
				path = "M" + d.c0 * r1 + " " + d.s0 * r1 // arc starting point
				+ " A" + r1 + " " + r1 + " 0 " + d.largeArcFlag + " 1 " + d.c1 * r1 + " " + d.s1 * r1 // draw arc to the arc ending ponit in clockwise
				+ " L" + d.c1 * r0 + " " + d.s1 * r0 // draw line to inner circle coordinate.
				+ " A" + r0 + " " + r0 + " 0 " + d.largeArcFlag + " 0 " + d.c0 * r0 + " " + d.s0 * r0 // draw arc to the arc ending ponit in Anti-clockwise
				+ " Z"; // move to strarting point
				valueLabel = {x: d.labelArcX * (r1 - (r1-r0)/2), y: d.labelArcY * (r1- (r1-r0)/2)}; 
			} else if (chartType == 'pie') {
				path = "M" + d.c0 * r1 + " " + d.s0 * r1 // arc starting point
				+ " A" + r1 + " " + r1 + " 0 " + d.largeArcFlag + " 1 " + d.c1 * r1 + " " + d.s1 * r1 // draw arc to the arc ending ponit in clockWise
				+ " L 0 0"
				+ " Z"; // move to strarting point
				valueLabel = {x: d.labelArcX * r1 / 2, y: d.labelArcY * r1 / 2}; 
			}
			sectors[i] = {
				color: arcColors[i], 
				value: d.data,
				valueLabel: valueLabel,
				path: path,
			}
		});
		return sectors;
	},
	map: function(arr, value){
		return arr.map(function(item){ return item * value})
	},
}

Kcharts.Chart = Ractive.extend({
	init: function(options) {
		this.options = options;
		this.slides = [1,0,0,0,0];
		this.ichoose = [0,0,1];
		this.isStackBar = options.data.barChart.isStackBar || false;
		this.drawChart();
	},
	drawChart: function(){
		var options = this.options;
		var chartType = options.data.chartType
		if (chartType == 'pieDonut'){
			this.pieDonut()
		} else if(chartType == 'barChart') {
			this.barChart()
		} else if (chartType == 'dashBoard') {
			this.dashBoard()
		}
	},
	dashBoard: function(){
		var options = this.options
		var self = this;
		this.chartId = options.chartId;	
		this.lfactor = options.data.dashBoard.legend.lfactor;
		this.pfactor = options.data.dashBoard.legend.pfactor;
		var svgWidth = this.nodes[this.chartId].clientWidth;
		var svgHeight = this.nodes[this.chartId].clientHeight;	
		var orientation = svgWidth > svgHeight ? 'landscape' : 'portrait';
		if (orientation == 'landscape') {
			var boxWidth = svgWidth/4;
			var boxWidths = Kcharts.map(self.lfactor, boxWidth);
			var xFactor = [0,2,3,0,1,3,0,2];
			var tx = Kcharts.map(xFactor, boxWidth)
			var boxHeight = svgHeight/3
			var yFactor = [0,0,0,1,1,1,2,2,2];
			var ty = Kcharts.map(yFactor, boxHeight)
		} else if (orientation == 'portrait'){
			var boxWidth = svgWidth/3;
			var boxWidths = Kcharts.map(self.pfactor, boxWidth);
			var xFactor = [0,2,0,1.5,0,2,0,1.5];
			var tx = Kcharts.map(xFactor, boxWidth)
			var boxHeight = svgHeight/4
			var yFactor = [0,0,1,1,2,2,3,3];
			var ty = Kcharts.map(yFactor, boxHeight)
		}
		var fontSize = (boxWidth * 0.11) < 20 ? 20 : boxWidth * 0.11;
		this.set({
			isDashBoard: true,
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			boxWidths: boxWidths,
			boxHeight: boxHeight,
			tx: tx,
			ty: ty,
			fs: fontSize,
		});
		var listener = this.on({
			boxSelect: function(e){
				self.set({
					isDashBoard: false,
					chartType: 'barChart',
				})
				self.isStackBar = true;
				listener.cancel();
				self.barChart()
			}
		})
	},
	barChart: function(){
		var options = this.options;
		var chartType = options.data.chartType;
		this.cdata = options.data.barChart.cdata;
		this.legend = options.data.barChart.legend;
		this.chartId = options.chartId;
		var self = this;
		var svgWidth = this.nodes[this.chartId].clientWidth;
		var svgHeight = this.nodes[this.chartId].clientHeight;
		var fRadius = svgWidth * 0.005;
		var tRadius = svgWidth * 0.004;
		var mydata = Kcharts.dataScale(this.cdata, svgHeight, this.isStackBar)
		var tcx = svgWidth * 0.5;
		this.set({
			isBarChart: true,
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			mydata: mydata,
			width: self.barWidth(svgWidth),
			isStackBar: self.isStackBar,
			ichoose: self.ichoose,
			chooseLabels: ['single', 'multi', 'stack'],
			slides: self.slides,
			fRadius: fRadius,
			fcx: Kcharts.alignMiddle(0, self.slides.length, fRadius * 4),
			tRadius: tRadius,
			tcx: Kcharts.alignMiddle(tcx, self.ichoose.length, tRadius * 25),
			tcy: svgHeight * 0.115,
			ty: svgHeight * 0.12,
			tx: Kcharts.alignMiddle(tcx * 1.02, self.ichoose.length, tRadius * 25)
		});
		var listener = this.on({
			single: function(e){
				self.ichoose = [1,0,0]
				self.isStackBar = false;
				self.options.data.barChart.cdata = [{label: 'jan', values: [25]}, {label:'feb', values: [35]}, {label: 'mar', values: [50]}]
				listener.cancel();
				self.barChart();
			},
			multi: function(event){
				self.ichoose = [0,1,0]
				self.isStackBar = false
				self.options.data.barChart.cdata = [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]
				listener.cancel();
				self.barChart();
			},
			stack: function(event){
				self.ichoose = [0,0,1]
				self.isStackBar = true
				self.options.data.barChart.cdata = [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]
				listener.cancel();
				self.barChart();
			},
			pieDonut: function(event) {
				self.set({
					isBarChart: false,
					chartType: 'pieDonut',
				});
				self.slides = [0,1,0,0,0];
				listener.cancel();
				self.pieDonut()
			},
			dashBoard: function(event) {
				self.set({
					isBarChart: false,
					chartType: 'dashBoard',
				});
				listener.cancel();
				self.dashBoard()
			}
		})
	},
	barWidth: function(svgWidth){
		return svgWidth/(this.cdata.length * 2) * .95;
	},
	pieDonut: function(){
		var options = this.options;
		var chartType = options.data.pieDonut.chartType;
		this.cdata = options.data.pieDonut.cdata.values;
		this.legend = options.data.pieDonut.legend;
		this.chartId = options.chartId;
		var self = this;
		var svgWidth = self.nodes[self.chartId].clientWidth;
		var svgHeight = self.nodes[self.chartId].clientHeight;	
		var outerRadius = svgWidth > svgHeight ? svgHeight * 0.4 : svgWidth * 0.45;
		var innerRadius = outerRadius * 0.45;
		var unitCircleArcs = Kcharts.arcs(self.cdata);
		var arcColors = self.legend.colors
		var sectors = Kcharts.sectors(innerRadius, outerRadius, unitCircleArcs, arcColors, chartType)
		var fRadius = svgWidth * 0.005;
		self.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			isPieDonut: true,
			sectors: sectors,
			total: self.cdata.reduce(function(p,n){return p+n;}),
			slides: self.slides,
			fRadius: fRadius,
			fcx: Kcharts.alignMiddle(0, self.slides.length, fRadius * 4),
		});
		var listener = self.on({
			barChart: function(e){
				self.set({
					isPieDonut: false,
					chartType: 'barChart'
				});
				self.slides = [0,1,0,0,0];
				listener.cancel();
				self.barChart();	
			},
			dashBoard: function(e){
				self.set('isPieDonut', false)
				listener.cancel();
				self.dashBoard();
			}
		})
	},
});

var cfgObj = {
	el: '#container',
	template: '#kchartT',
	chartId: 'kchart', // Required while setting svgWidth and svgHeight via nodes 
	data: {
		chartType: 'dashBoard', // intial chart Type
		pieDonut: {
			chartType: 'donut',
			chartTitle: 'Revenue YTD',
			legend: {
				colors:['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.6)', 'rgba(0,255,155,0.5)'],
				colorLables: ['Chemistry', 'Physics', 'Maths', 'Commerce'],
			},
			cdata: {label: 'jan', values: [124,145,135,160]},
		},
		barChart: {
			chartType: 'vbar',
			chartTitle: 'Revenue MoM',
			isStackBar: true,
			legend: {
				colors:['green', 'blue', 'rgba(255,0,0,0.6)'],
				colorLables: ['Chemestry', 'Physics', 'Maths'],
			},
			cdata: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}],
		},
		dashBoard: {
			legend: {
				colors:['#3399CC', '#33CCCC', '#996699', '#e2674a', '#C24747', '#FFCC66', '#99CC99', '#669999'],
				colorLables: ['Revenue', 'Receivables', 'Treasury', 'Fixed Assets', 'Expenses', 'NetWorth', 'Employees', 'Adwords'],
				colorEvents: ['revenue', 'receivables', 'treasury', 'fixedAssets', 'expenses', 'netWorth', 'employees', 'adwords'],
				lfactor: [2, 1, 1, 1, 2, 1, 2, 2],
				pfactor: [2, 1, 1.5, 1.5, 2, 1, 1.5, 1.5],
			},
		}
	}
}
var mychart = new Kcharts.Chart(cfgObj);
var resize = function(){
	mychart.drawChart();
}
window.onresize = resize;

/*
For SVG, on window.resize, no need to redraw the chart we can use bellow properties. 
	viewBox='0 0 ' + w + ' ' + h
	preserveAspectRatio="xMidYMid"
But in the code above, i have redraw the chart on resize! for two reasons
	1. as it is not that much costly with ractive.
	2. On resize, when height > width , i want to draw chart differently instead of maintaining the same aspect ratio.
*/
