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
	kmerge: function(arrOfArrs){
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
			inputMax = Kcharts.max(Kcharts.kmerge(Kcharts.pluck(data, 'values')));
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
		this.isStackBar = options.data.slideData.isStackBar || false;
		this.drawChart();
	},
	drawChart: function(){
		var self = this;
		var options = this.options;
		var chartId = options.chartId
		if (chartId == 'pieDonut'){
			this.pieDonut()
		} else if(chartId == 'barChart') {
			this.barChart()
		} else if (chartId == 'dashBoard') {
			this.dashBoard()
		}
	},
	setup: function(chartId){
		var self = this;
		self.set({
			isDashBoard: false,
			isBarChart: false,
			isPieDonut: false,
		});
		this.options.chartId = chartId;
	},
	dashBoard: function(){
		this.setup('dashBoard')
		var options = this.options
		var divId = options.divId;	
		var lfactor = options.data.slideData.legend.lfactor;
		var pfactor = options.data.slideData.legend.pfactor;
		var svgWidth = options.svgWidth || this.nodes[divId].clientWidth;
		var svgHeight = options.svgHeight || this.nodes[divId].clientHeight;	
		var orientation = svgWidth > svgHeight ? 'landscape' : 'portrait';
		if (orientation == 'landscape') {
			var boxWidth = svgWidth/4;
			var boxWidths = Kcharts.map(lfactor, boxWidth);
			var xFactor = [0,2,3,0,1,3,0,2];
			var tx = Kcharts.map(xFactor, boxWidth)
			var boxHeight = svgHeight/3
			var yFactor = [0,0,0,1,1,1,2,2,2];
			var ty = Kcharts.map(yFactor, boxHeight)
		} else if (orientation == 'portrait'){
			var boxWidth = svgWidth/3;
			var boxWidths = Kcharts.map(pfactor, boxWidth);
			var xFactor = [0,2,0,1.5,0,2,0,1.5];
			var tx = Kcharts.map(xFactor, boxWidth)
			var boxHeight = svgHeight/4
			var yFactor = [0,0,1,1,2,2,3,3];
			var ty = Kcharts.map(yFactor, boxHeight)
		}
		var fontSize = (boxWidth * 0.11) < 20 ? 20 : boxWidth * 0.11;
		var cdata = options.data.slideData.cdata
		var self = this;
		this.set({
			isDashBoard: true,
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			boxWidths: boxWidths,
			boxHeight: boxHeight,
			tx: tx,
			ty: ty,
			fs: fontSize,
			cdata: cdata,
			legend: options.data.slideData.legend,
		});
		var listener = this.on({
			boxSelect: function(e){
				//e.original.preventDefault()
				//self.isStackBar = true;
				console.log(e.node.id)
				var box = e.node.id;
				if (box == 'revenue') {
					self.options.data.slideData = revenueData[0]
					//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
					var chartType = self.options.data.slideData.chartType;
					listener.cancel()
					self[chartType]();
				}
				//listener.cancel();
				//history.pushState({chartId: 'barChart'}, 'barchart', 'barchartk.html');
			}
		})
	},
	slidesM: function(slideCount, activeSlide){
		var slides = [];
		for (var i=0; i < slideCount; i++){
			if (i === activeSlide) {
				slides.push(1)
			} else {
				slides.push(0)
			}
		}
		return slides;
	},
	barChart: function(){
		this.setup('barChart')
		var options = this.options;
		var self = this;
		var slideCount = options.data.slideCount;
		var activeSlide = options.data.slideData.slide;
		var chartTitle = options.data.slideData.chartTitle;
		var slides = self.slidesM(slideCount, activeSlide);
		console.log(slides)
		this.ichoose = ['single', 'multi', 'stack']
		var cdata = options.data.slideData.cdata;
		var divId = options.divId;
		var svgWidth = options.svgWidth || this.nodes[divId].clientWidth;
		var svgHeight = options.svgHeight || this.nodes[divId].clientHeight;
		var barWidth = svgWidth/(cdata.length * 2) * .95;
		var fRadius = svgWidth * 0.005;
		var tRadius = svgWidth * 0.004;
		var chartSubType = options.data.slideData.chartSubType;
		this.isStackBar = (chartSubType == 'stackBar') ? true : false;
		var mydata = Kcharts.dataScale(cdata, svgHeight, this.isStackBar)
		var tcx = svgWidth * 0.5;
		var legend = {
			colors:['green', 'blue', 'rgba(255,0,0,0.6)'],
			colorLables: ['Chemestry', 'Physics', 'Maths'],
		};
		var self = this;
		this.set({
			chartTitle: chartTitle,
			isBarChart: true,
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			mydata: mydata,
			width: barWidth,
			legend: legend,
			isStackBar: self.isStackBar,
			ichoose: self.ichoose,
			chooseLabels: ['single', 'multi', 'stack'],
			slideId: options.data.slideData.slide,
			slides: slides,
			fRadius: fRadius,
			fcx: Kcharts.alignMiddle(0, slides.length, fRadius * 4),
			tRadius: tRadius,
			tcx: Kcharts.alignMiddle(tcx, self.ichoose.length, tRadius * 25),
			tcy: svgHeight * 0.115,
			ty: svgHeight * 0.12,
			tx: Kcharts.alignMiddle(tcx * 1.02, self.ichoose.length, tRadius * 25)
		});
		var listener = this.on({
			single: function(e){
				self.ichoose = [1,0,0]
				listener.cancel();
				console.log('single')
				self.barChart();
			},
			multi: function(event){
				self.ichoose = [0,1,0]
				listener.cancel();
				console.log('multi')
				self.barChart();
			},
			stack: function(event){
				self.ichoose = [0,0,1]
				listener.cancel();
				console.log('stack')
				self.barChart();
			},
			home: function(event) {
				self.options.data.slideData = dashBoardData;
				listener.cancel()
				//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
				self.dashBoard()
			},
			slra: function(e){
				var currentSlide = e.node.id	* 1;
				var nextSlide = currentSlide + 1;
				if (self.options.data.slideCount !== nextSlide) {
					self.options.data.slideData = revenueData[nextSlide]
					//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
					var chartType = self.options.data.slideData.chartType;
					listener.cancel()
					self[chartType]();
				}
			},
			srla: function(e){
				var currentSlide = e.node.id	* 1;
				var preSlide = currentSlide - 1
				if (currentSlide !== 0) {
					self.options.data.slideData = revenueData[preSlide]
					//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
					var chartType = self.options.data.slideData.chartType;
					listener.cancel()
					self[chartType]();
				}
			}
		});
	},
	pieDonut: function(){
		this.setup('pieDonut')
		var options = this.options;
		var self = this;
		var slideCount = options.data.slideCount;
		var activeSlide = options.data.slideData.slide;
		var chartTitle = options.data.slideData.chartTitle;
		var slides = self.slidesM(slideCount, activeSlide);
		console.log(activeSlide)
		var chartSubType = options.data.slideData.chartSubType;
		var cdata = options.data.slideData.cdata[0].values;
		var legend = {
		   colors: ['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.6)', 'rgba(0,255,155,0.5)'],
			colorLables: ['Chemistry', 'Physics', 'Maths', 'Commerce'],
		};
		var divId = options.divId;
		var svgWidth = this.nodes[divId].clientWidth;
		var svgHeight = this.nodes[divId].clientHeight;	
		var outerRadius = svgWidth > svgHeight ? svgHeight * 0.4 : svgWidth * 0.45;
		var innerRadius = outerRadius * 0.45;
		var unitCircleArcs = Kcharts.arcs(cdata);
		var arcColors = legend.colors
		var sectors = Kcharts.sectors(innerRadius, outerRadius, unitCircleArcs, arcColors, chartSubType)
		var fRadius = svgWidth * 0.005;
		self.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			isPieDonut: true,
			chartTitle: chartTitle,
			sectors: sectors,
			total: cdata.reduce(function(p,n){return p+n;}),
			slideId: options.data.slideData.slide,
			slides: slides,
			fRadius: fRadius,
			fcx: Kcharts.alignMiddle(0, self.slides.length, fRadius * 4),
		});
		var listener = self.on({
			home: function(event) {
				self.options.data.slideData = dashBoardData;
				listener.cancel()
				//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
				self.dashBoard()
			},
			slra: function(e){
				var currentSlide = e.node.id	* 1;
				var nextSlide = currentSlide + 1;
				if (self.options.data.slideCount !== nextSlide) {
					self.options.data.slideData = revenueData[nextSlide]
					//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
					var chartType = self.options.data.slideData.chartType;
					listener.cancel()
					self[chartType]();
				}
			},
			srla: function(e){
				var currentSlide = e.node.id	* 1;
				var preSlide = currentSlide - 1
				if (currentSlide !== 0) {
					self.options.data.slideData = revenueData[preSlide]
					//history.pushState({chartId: 'dashBoard'}, 'dashboard', 'dashBoardk.html');
					var chartType = self.options.data.slideData.chartType;
					listener.cancel()
					self[chartType]();
				}
			}
		})
	},
});

var dashBoardData = {
	chartType: 'dashBoard',
	legend: {
		colors:['#3399CC', '#33CCCC', '#996699', '#e2674a', '#C24747', '#FFCC66', '#99CC99', '#669999'],
		lfactor: [2, 1, 1, 1, 2, 1, 2, 2],
		pfactor: [2, 1, 1.5, 1.5, 2, 1, 1.5, 1.5],
	},
	cdata: [
		{id: 'revenue', label: 'Revenue', value: 100}, {id: 'ar', label: 'Receivables', value: 25}, {id: 'treasury', label: 'Treasury', value: 150}, {id: 'fa', label: 'Fixed Assets', value: 100},
		{id: 'expenses', label: 'Expenses', value: 50}, {id: 'netWorth', label: 'NetWorth', value: 200}, {id: 'employees', label: 'Employees', value: 200}, {id: 'adwords', label: 'Adwords', value: 10}
	]
}
var revenueData = [
   {slide: 0, chartType: 'barChart', chartSubType: 'stackBar', chartTitle: 'Revenue YoY',
      cdata: [{label: 'jan', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]},
   {slide: 1, chartType: 'pieDonut', chartSubType: 'donut', chartTitle: 'Revenue QoQ',
      cdata: [{label: 'kanna', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]},
   {slide: 2, chartType: 'barChart', chartSubType: 'vbar', chartTitle: 'Revenue MoM',
      cdata: [{label: 'china', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]},
   {slide: 3, chartType: 'barChart', chartSubType: 'stackBar', chartTitle: 'Revenue WoW',
      cdata: [{label: 'anna', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]},
   {slide: 4, chartType: 'barChart', chartSubType: 'vbar', chartTitle: 'Revenue DoD',
      cdata: [{label: 'anna', values: [125,145,135]},{label: 'feb', values: [143,153,160]},{label: 'mar', values: [170,180,185]}, {label: 'apr', values: [150,160,180]}]},
];

var cfgObj = {
	el: '#container',
	template: '#kchartT',
	divId: 'kchart', // Required while setting svgWidth and svgHeight via nodes 
	chartId: 'dashBoard', // intial chart Type
	data: {
		slideCount: 5,
		slideData: dashBoardData,
	}
}
var mychart = new Kcharts.Chart(cfgObj);
var resize = function(){
	mychart.off(); // Removes all event listeners
	mychart.drawChart();
}
window.onresize = resize;
/*
window.addEventListener('popstate', function(e){
	if (e.state) {
		mychart[e.state.chartId]()
	} else{
		mychart['dashBoard']()
	}
});
*/
/*
For landig page no need of pushState. Already it has a state.
*/

