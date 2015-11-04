var Timer = (function(){
	function Timer(params){
		this.init(params);
	}
	
	Timer.prototype = {
		init: function(params){
			this.id = new Date().getTime();
			
			this.time = {
				hours: 0,
				minutes: 0,
				seconds: 0
			}
			this.lastStartedAt = 0;
			this.currentRun = 0;
			this.total = 0;
			
			this.running = false;
			
			this.wrapperID = 'timer_'+this.id;
			this.wrapperClass = 'timer';
			this.timerClass = 'times';
			this.hoursClass = 'hours';
			this.minutesClass = 'minutes';
			this.secondsClass = 'seconds';
			
			this.startClass = 'start';
			this.pauseClass = 'pause';
			this.removeClass = 'remove';
			
			this.labelClass = 'label';
		},
		isActive: function(){
			return this.running;
		},
		activate: function(){
			this.running = true;
			if(!jQuery('#'+this.wrapperID).hasClass('active'))
				jQuery('#'+this.wrapperID).addClass('active');
			jQuery('#'+this.wrapperID+' .'+this.startClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.pauseClass).show();
			jQuery('#'+this.wrapperID+' .'+this.removeClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.labelClass).focus();
		},
		deactivate: function(){
			this.running = false;
			if(jQuery('#'+this.wrapperID).hasClass('active'))
				jQuery('#'+this.wrapperID).removeClass('active');
			jQuery('#'+this.wrapperID+' .'+this.startClass).show();
			jQuery('#'+this.wrapperID+' .'+this.pauseClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.removeClass).show();
		},
		render: function(){
			// renders the whole timer
			var _wrapper = jQuery('<div />');
			_wrapper.attr('id',this.wrapperID);
			_wrapper.addClass(this.wrapperClass);
			
			// times
			var _timerWrapper = jQuery('<div />');
			_timerWrapper.addClass(this.timerClass);
			var _hoursWrapper = jQuery('<span>');
			_hoursWrapper.addClass(this.hoursClass);
			_hoursWrapper.html(this.getTime('hours', true));
			var _minutesWrapper = jQuery('<span>');
			_minutesWrapper.addClass(this.minutesClass);
			_minutesWrapper.html(this.getTime('minutes', true));
			var _secondsWrapper = jQuery('<span>');
			_secondsWrapper.addClass(this.secondsClass);
			_secondsWrapper.html(this.getTime('seconds', true));
			
			// build times
			_timerWrapper
				.append(_hoursWrapper)
				.append(_minutesWrapper)
				.append(_secondsWrapper);
				
			// controls
			var _controlsWrapper = jQuery('<div />');
			_controlsWrapper.addClass('controls');
			var _startButton = jQuery('<button />');
			_startButton.addClass(this.startClass);
			_startButton.html('start');
			_startButton.bind('click',this.start.bind(this));
			var _pauseButton = jQuery('<button />');
			_pauseButton.addClass(this.pauseClass);
			_pauseButton.html('pause');
			_pauseButton.bind('click', {setTotal: true}, this.pause.bind(this));
			var _removeButton = jQuery('<button />');
			_removeButton.addClass(this.removeClass);
			_removeButton.html('remove');
			_removeButton.bind('click',this.remove.bind(this));
			
			// build controls
			_controlsWrapper
				.append(_startButton)
				.append(_pauseButton)
				.append(_removeButton);
			
			// label
			var _labelWrapper = jQuery('<div />');
			_labelWrapper.addClass('label-container');
			var _label = jQuery('<input type="text" />');
			_label.addClass(this.labelClass);
			_label.bind('keyup',this.changeLabel.bind(this));
			
			// build label
			_labelWrapper.append(_label);
			
			// build timer
			_wrapper
				.append(_labelWrapper)
				.append(_timerWrapper)
				.append(_controlsWrapper);
			
			return _wrapper;
		},
		changeLabel: function(e){
			this.label = e.target.value;
		},
		update: function(section){
			// updates given sections of timer output
			switch(section){
				case 'times':
					jQuery('#'+this.wrapperID+' .'+this.hoursClass).html(this.getTime('hours', true));
					jQuery('#'+this.wrapperID+' .'+this.minutesClass).html(this.getTime('minutes', true));
					jQuery('#'+this.wrapperID+' .'+this.secondsClass).html(this.getTime('seconds', true));
					break;
				default: ;
			}
		},
		increment: function(){
			if(this.isActive() === true){
				this.currentRun = new Date().getTime() - this.lastStartedAt;
				var _msDiff = this.currentRun + this.total;
				this.setTimes(_msDiff);
				this.update('times');
				
				this.setCurrentTimer(setTimeout(this.increment.bind(this), 1000));
			}
		},
		setTimes: function(ms){
			this.time.hours = Math.floor(ms / 36e5);
			this.time.minutes = Math.floor((ms % 36e5) / 6e4);
			this.time.seconds = Math.floor((ms % 6e4) / 1000);
		},
		setCurrentTimer: function(timeout){
			this.currentTimer = timeout;
		},
		start: function(){
			if(this.isActive() === false){
				this.setLastStartedAt();
				this.activate();
				this.increment();
				timekeeper.pauseTimers(this.id);
			}
		},
		pause: function(e){
			if(this.isActive()){
				this.deactivate();
				if(typeof(e) != 'undefined' && e.data.setTotal === true)
					this.total += this.currentRun;
				clearTimeout(this.currentTimer);
				this.setLastPausedAt();
			}
		},
		getTime: function(part, formatted){
			var _time = 0;
			if(typeof(this.time[part]) != 'undefined'){
				var _time = this.time[part];
				if(formatted){
					if(_time < 10){
						_time = "0"+_time;
					}
				}
			}
			return _time;
		},
		setLastStartedAt: function(){
			this.lastStartedAt = new Date().getTime();
		},
		setLastPausedAt: function(){
			this.lastPausedAt = new Date().getTime();
		},
		remove: function(){
			if(confirm('Are you sure about this?')){
				// remove from timekeeper then remove from screen
				if(timekeeper.removeTimer(this.id)){
					jQuery('#'+this.wrapperID).remove();
				}
			}
		}
	}
	
	return Timer;
})();