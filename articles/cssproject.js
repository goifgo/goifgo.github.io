
var Menu = Ractive.extend({
	template: '#menuT',
});

var Revenue = Ractive.extend({
	template: '#revenueT',
});

function createMenu(){
	var menu = new Menu({
		el: '#container'
	});
	
	menu.on({
		activate: function(){
			console.log('on-tap=activate')
		}
	});
}

function createRevenue(){
	var revenue = new Revenue({
		el: '#container'
	});
	
	revenue.on({
		kactivate: function(){
			console.log('on-tap=activate revenue')
		}
	});
}

var AppRouter = Backbone.Router.extend({
	routes: {
		'': 'index',
		'revenue': 'revenue'
	},
	start: function() {
		Backbone.history.start();
	},
	index: function() {
		console.log('index');
		createMenu();
	},
	revenue: function() {
		console.log('revenue')
		createRevenue();
	}
})

var app = new AppRouter()
app.start();
