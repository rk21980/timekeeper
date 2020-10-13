var Timer = (function(){
	function Timer(params){
		this.init(params);
	}
	
	Timer.prototype = {
		init: function(params){
			if( typeof( this.id ) == "undefined" )
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
			this.wrapperClass = 'card';
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
			jQuery( this.wrapperID ).cursorover = false;
			if(!jQuery('#'+this.wrapperID).hasClass('active'))
				jQuery('#'+this.wrapperID).addClass('active');
			jQuery('#'+this.wrapperID+' .'+this.startClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.pauseClass).show();
			jQuery('#'+this.wrapperID+' .'+this.removeClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.labelClass).focus();
			this.updateIcon("running");
		},
		deactivate: function(){
			this.running = false;
			if(jQuery('#'+this.wrapperID).hasClass('active'))
				jQuery('#'+this.wrapperID).removeClass('active');
			jQuery('#'+this.wrapperID+' .'+this.startClass).show();
			jQuery('#'+this.wrapperID+' .'+this.pauseClass).hide();
			jQuery('#'+this.wrapperID+' .'+this.removeClass).show();
			this.updateIcon();
		},
		render: function( allowEditing, renderControls ){
			if( typeof allowEditing == "undefined" || allowEditing !== false )
				allowEditing = true;
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
			if( typeof renderControls == "undefined" || renderControls !== false )
				renderControls = true;
			if( renderControls && allowEditing ) {
				var _controlsWrapper = jQuery('<div />');
				_controlsWrapper.addClass('controls');
				var _startButton = jQuery('<button />');
				_startButton
					.addClass(this.startClass + ' svg')
					.html('start')
					.bind('click',this.start.bind(this));
				var _pauseButton = jQuery('<button />');
				_pauseButton
					.addClass(this.pauseClass + ' svg')
					.html('pause')
					.bind('click', {setTotal: true}, this.pause.bind(this));
				var _removeButton = jQuery('<button />');
				_removeButton
					.addClass(this.removeClass + ' svg')
					.html('remove')
					.bind('click',this.remove.bind(this));
				
				// build controls
				_controlsWrapper
					.append(_startButton)
					.append(_pauseButton)
					.append(_removeButton);
			}
			
			// label
			var _labelWrapper = jQuery('<div />');
			_labelWrapper.addClass('label-container');
			var _label = jQuery('<input type="text" />');
			/*if( typeof this.label != "undefined" && this.label.length > 0 ) {
				_placeholder = this.label;
				if( !allowEditing ) {
					_label.attr( "disabled", "disabled" );
				}
			}*/
			_label
				.addClass( this.labelClass )
				.bind( 'keyup', this.changeLabel.bind( this ) );
			if( typeof this.label != "undefined" && this.label.length > 0 ) {
				_label.val( this.label );
				if( !allowEditing ) {
					_label.attr( "disabled", "disabled" );
				}
			} else {
				_label.attr( 'placeholder', 'TASK DESCRIPTION or JIRA TICKET NUMBER' );
			}
			
			// build label
			_labelWrapper.append(_label);
			
			// build timer
			var _self = this;
			_wrapper
				.append(_labelWrapper)
				.append(_timerWrapper)
				.append(_controlsWrapper)
				.on( { 
					mouseover: function() {
						if( _self.running !== true ) {
							// TODO set 1 sec delay
							_wrapper.addClass( 'active' );
						}
					},
					mouseout: function() {
						if( _self.running !== true ) {
							_wrapper.removeClass( 'active' );
						}
					}
				} );
			
			return _wrapper;
		},
		changeLabel: function(e){
			this.label = e.target.value;
		},
		update: function(section){
			// updates given sections of timer output
			switch(section){
				case 'times':
					jQuery( '#' + this.wrapperID + ' .' + this.hoursClass ).html( this.getTime( 'hours', true ) );
					jQuery( '#' + this.wrapperID + ' .' + this.minutesClass ).html( this.getTime( 'minutes', true ) );
					jQuery( '#' + this.wrapperID + ' .' + this.secondsClass ).html( this.getTime( 'seconds', true ) );
				break;
				case 'label':
					jQuery( '#' + this.wrapperID + ' .' + this.hoursClass ).val( this.label );
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
		setLabel: function( label ) {
			this.changeLabel( label );
			this.update( "label" );
		},
		setCurrentTimer: function(timeout){
			this.currentTimer = timeout;
		},
		start: function(){
			if(this.isActive() === false){
				timekeeper.pauseTimers(this.id);
				this.setLastStartedAt();
				this.activate();
				this.increment();
			}
		},
		pause: function( e, resetClock ){
			if(this.isActive()){
				this.deactivate();
				if(typeof(e) != 'undefined' && e.data.setTotal === true)
					this.total += this.currentRun;
				clearTimeout(this.currentTimer);
				this.setLastPausedAt();
				if( typeof( resetClock ) != "undefined" && resetClock === true ) {
					this.init( {} );
				}
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
			if(confirm('Are you sure you want to remove this timer?')){
				// remove from timekeeper then remove from screen
				if(timekeeper.removeTimer(this.id)){
					jQuery('#'+this.wrapperID).remove();
				}
			}
		},
		updateIcon: function( currentStatus ){
			var canvas = document.createElement('canvas'),
				ctx,
				img = document.createElement('img'),
				link = document.getElementById('favicon').cloneNode(true),
				iconSrc = "images/favicon-clock-o.ico";
			if( typeof currentStatus == "undefined" )
				currentStatus = "idle";

			if (canvas.getContext) {
				canvas.height = canvas.width = 16; // set the size
				ctx = canvas.getContext('2d');
				img.onload = function () { // once the image has loaded
					ctx.drawImage(this, 0, 0);

					switch( currentStatus ) {
						case "running":
							/*ctx.beginPath();
							ctx.arc(13, 13, 3, 0, 2 * Math.PI, false);
							ctx.fillStyle = 'rgb(119, 242, 90)';
							ctx.fill();*/
							break;
						case "idle":
						default: // red circle
							ctx.beginPath();
							ctx.arc(13, 13, 3, 0, 2 * Math.PI, false);
							ctx.fillStyle = 'rgb(242, 63, 88)';
							ctx.fill();
					}

					link.href = canvas.toDataURL('image/png');
					document.head.removeChild(document.getElementById('favicon'));
					document.head.appendChild(link);
				};

				img.src = iconSrc;
			}
		}
	}
	
	return Timer;
})();
