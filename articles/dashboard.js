"use strict"

var DashBoard = Ractive.extend({
	init: function(options){
		this.divId = options.divId;	
		this.lfactor = options.data.legend.lfactor;
		this.pfactor = options.data.legend.pfactor;
		this.drawChart();
	},
	drawChart: function(){
		var self = this;
		var svgWidth = this.nodes[this.divId].clientWidth;
		var svgHeight = this.nodes[this.divId].clientHeight;	
		var orientation = svgWidth > svgHeight ? 'landscape' : 'portrait';
		if (orientation == 'landscape') {
			var boxWidth = svgWidth/4;
			var boxWidths = self.map(self.lfactor, boxWidth);
			var xFactor = [0,2,3,0,1,3,0,2];
			var tx = self.map(xFactor, boxWidth)
			var boxHeight = svgHeight/3
			var yFactor = [0,0,0,1,1,1,2,2,2];
			var ty = self.map(yFactor, boxHeight)
		} else if (orientation == 'portrait'){
			var boxWidth = svgWidth/3;
			var boxWidths = self.map(self.pfactor, boxWidth);
			var xFactor = [0,2,0,1.5,0,2,0,1.5];
			var tx = self.map(xFactor, boxWidth)
			var boxHeight = svgHeight/4
			var yFactor = [0,0,1,1,2,2,3,3];
			var ty = self.map(yFactor, boxHeight)
		}
		var fontSize = (boxWidth * 0.11) < 20 ? 20 : boxWidth * 0.11;
		this.set({
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			boxWidths: boxWidths,
			boxHeight: boxHeight,
			tx: tx,
			ty: ty,
			fs: fontSize,
		});
	},
	map: function(arr, value){
		return arr.map(function(item){ return item * value})
	}
});

var cfgObj = {
	el: '#container',
	template: '#dashBoardT',
	divId: 'dashBoard', // Required while setting svgWidth and svgHeight via nodes 
	data: {
		chartType: 'donut', // other option 'pie'
		legend: {
			colors:['#3399CC', '#33CCCC', '#996699', '#e2674a', '#C24747', '#FFCC66', '#99CC99', '#669999'],
			colorLables: ['Revenue', 'Receivables', 'Treasury', 'Fixed Assets', 'Expenses', 'NetWorth', 'Employees', 'Adwords'],
			lfactor: [2, 1, 1, 1, 2, 1, 2, 2],
			pfactor: [2, 1, 1.5, 1.5, 2, 1, 1.5, 1.5],
		},
	},
};


var dashBoard = new DashBoard(cfgObj);
var resize = function(){
	dashBoard.drawChart();
};
window.onresize = resize;
