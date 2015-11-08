var BreakAlarm = (function(){
	function BreakAlarm( params ){
		this.STATUS_COOKIE_ID = "breakalarm_status";
		this.ALERT_MESSAGES = new Array(
			"Let's go for a walk!", "Everybody in the house please stand up!", "Fancy a cuppa?", "Why don't you pet Bob for a bit?", "Time for some stretching!"
		)
		this.interval = 3600 * 1000; // 3600 seconds
		this.init( params );
	}
	
	BreakAlarm.prototype = {
		init: function( params ) {
			this.ID = params.id;
			this.statusID = params.statusId;
			this.timerContainer = params.timerContainer;
			this.status = this.checkStoredStatus(); // 0 - stopped, 1 - running
			var _statusLabels = new Array();
			_statusLabels.push( "Off" );
			_statusLabels.push( "On" );
			this.statusLabels = _statusLabels;
			this.timer = false;
			if(typeof(Timer) != 'undefined'){
				var _params = {};
				this.timer = new Timer(_params);
			}
			this.toggled = false;
			this.ticker;
		},
		toggle: function( e ) {
			if( this.toggled === false ) {
				jQuery( this.timerContainer ).prepend( this.timer.render( false ) );
				this.toggled = true;
			} else if( this.toggled === true ) {
				jQuery( "#" + this.timer.wrapperID ).remove();
				this.toggled = false;
			}
			var status = this.getStatus();
			if( status === 1 ){ // running
				// stop timer
				this.setStatus( 0, true );
				e.className = e.className.replace( " active", "" );
			} else { // stopped
				// start timer
				this.setStatus( 1, true );
				e.className = e.className + " active";
			}
		},
		getStatus: function() {
			return this.status;
		},
		setStatus: function( status, renderStatus, resetAlarm ) {
			var _currentStatus = this.getStatus();
			if( status === 1 && _currentStatus === 0 ) {
				this.status = 1;
				this.timer.start();
				jQuery( '#' + this.timer.wrapperID + ' .' + this.timer.labelClass ).val( "BreakAlarm - alerts in an hour" );
				if( this.startedAt = 0 )
					this.startedAt = new Date().getTime();
				var _self = this;
				this.ticker = setTimeout( function() {
					var _randomInt = Math.floor( ( Math.random() * _self.ALERT_MESSAGES.length ) );
					alert( _self.ALERT_MESSAGES[_randomInt] );
					_self.setStatus( 0, false, true );
				}, _self.interval );
			} else {
				this.status = 0;
				this.timer.pause( undefined, resetAlarm );
				this.startedAt = 0;
				clearTimeout( this.ticker );
				this.timer.setTimes(0);
			}
			
			if( renderStatus === true ) {
				var _statusDisplay = jQuery( this.ID + ' ' + this.statusID );
				if( _statusDisplay != 'undefined' )
					_statusDisplay.html( this.statusLabels[this.status] );
			}
		},
		checkStoredStatus: function() {
			return 0;
		}
	}
		
	return BreakAlarm;
	
})();