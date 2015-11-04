/*
 * Timekeeper function
 *
 *
 */
var Timekeeper = (function(){
	function Timekeeper(params){
		this.init(params);
	}
	
	Timekeeper.prototype = {
		init: function(params){
			this.wrapper = jQuery(params.wrapper);
			this.loadingWrapper = jQuery(params.loading_wrapper);
			this.timers = [];
			
			//this.baseURL = '/timekeeper/';
			this.baseURL = '/dev_timekeeper/';
			this.loading = false;
		},
		addTimer: function(){
			if(typeof(Timer) != 'undefined'){
				var _params = {};
				var _timer = new Timer(_params);
				if(
					typeof(_timer) != 'undefined' && 
					typeof(_timer.id) != 'undefined' && 
					parseInt(_timer.id) != NaN
				){
					this.timers.push(_timer);
					this.wrapper.append(_timer.render());
					_timer.start();
					this.pauseTimers(_timer.id);
				}
			}
		},
		removeTimer: function(id){
			if(parseInt(id) > 0){
				for(key in this.timers){
					if(this.timers[key].id == id){
						this.timers.splice(key, 1);
						return true;
					}
				}
			}
			return false;
		},
		pauseTimers: function(ignore){
			for(key in this.timers){
				if(this.timers[key].id != ignore){
					this.timers[key].pause({data:{setTotal:true}});
				}
			}
		},
		setLoading: function(){
			if(!this.loading){
				this.loadingWrapper.removeClass('hidden');
				this.loading = true;
			}
		},
		resetLoading: function(){
			this.loadingWrapper.addClass('hidden');
			this.loading = false;
		}
	}
	
	return Timekeeper;
})();