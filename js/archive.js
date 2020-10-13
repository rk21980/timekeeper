var Archive = ( function() {
	function Archive( params ){
		if( params == 'undefined' )
			var params = {};
		this.init( params );
	}
	
	Archive.prototype = {
		init: function( params ){
			if( typeof( Storage ) !== "undefined" && typeof timekeeper != "undefined") {
				if( params === "undefined" )
					params = {};
				this.key = params.key || "timekeeper_archive";
				this.encrypt = false;
				this.archiveDate = new Date();
				var _startDate = this.archiveDate.getDate();
				// _startDate = this.archiveDate.getDate() - 2; // historical record creation for testing purposes
				this.archiveDate.setDate( _startDate );
				this.archiveDate.setHours( 0, 0, 0, 0 )
				this.archiveDate = this.archiveDate.getTime();
				
				this.timersContainer = params.timersContainer;
				this.archiveContentContainer = params.archiveContentContainer || "#archive .card-content";
				if(typeof(Timer) != 'undefined'){
					var _params = {};
					this.timer = new Timer(_params);
				}
				
				this.localArchive = null;
				this.daysToStore = 7;
				//this.chipClass = "chip";
				this.chipClass = "card";
				this.housekeeping();
				
				// restore today's timers
				var _storageItems = this.load();
				var _todaysItems = _storageItems[ this.archiveDate.toString() ];
				if( typeof _todaysItems == "object" ) {
					if( typeof timekeeper != "undefined" )
						this.renderArchive( this.archiveDate, timekeeper.wrapper );
				}
				
				this.renderArchive();
				
				this.autosaveDelay = 2000;
				this.tick(); // start autosave

			}
			// TODO add support for further storage types
		},
		getContent: function() {
			return jQuery( this.timersContainer );
		},
		load: function( forceLoad ) {

			var _archive = [], _storageItems = {};
			if( typeof forceLoad === "undefined" )
				var forceLoad = false;
				
			if( this.localArchive === null || forceLoad === true ) {
				var _archive = localStorage.getItem( this.key );
				if( _archive != null ) {
					_storageItems = this.postStoreProcess( _archive );
					this.localArchive = _storageItems;
				} else {
					this.localArchive = {};
				}
			}

			return this.localArchive;
		},
		createTimer: function() {
			
		},
		save: function() {

			//var archive = this.load();
			var _archiveKey = this.key;
			
			// loop through all html items
			var _htmlContent = this.getContent();
			var _timers = new Array();
			_htmlContent.children('.card').each( function() { // this => .card
				var _timer = {}
				_timer.label = jQuery( this ).find( '.label' ).val();
				_timer.timer = jQuery( this ).find( '.hours' ).html()
					+ jQuery( this ).find( '.minutes' ).html()
					+ jQuery( this ).find( '.seconds' ).html();
				
				_timers.push( _timer );
			});
			
			var _storageItems = this.load();
			_storageItems[ this.archiveDate.toString() ] = _timers;
			_storageItems = this.prepToStore( _storageItems );
			localStorage.setItem( _archiveKey, _storageItems );
		},
		prepToStore: function( input ) { // input - array
			return JSON.stringify( input ); // string
		},
		postStoreProcess: function( input ) { // input - encrypted string

			var _output = {};
			try {
				_output = JSON.parse( input );
			} catch( e ) {
				console.log( "Input error during postPstoreProcess(): " + input );
			}

			return _output; // JSON object
		},
		tick: function() {
			this.save();
			this.ticker = setTimeout( this.tick.bind( this ), this.autosaveDelay );
		},
		housekeeping: function() {

			// remove storage keys older than certain date
			var _archiveKey = this.key;
			var _storageItems = this.load();
			for( _key in _storageItems ) {
				if( _key < ( this.archiveDate - ( this.daysToStore * 86400000 ) ) || _storageItems[_key].length < 1 || isNaN( _key ) ) {
					delete _storageItems[_key];
				}
			}
			this.localArchive = _storageItems;
			_storageItems = this.prepToStore( _storageItems );
			if( isNaN != _archiveKey ) {
				localStorage.setItem( _archiveKey, _storageItems );
			}

		},
		sortByKey: function( sortable ) {
			var sorted = [];
			if( typeof sortable == "object" && Object.size( sortable ) > 0 ) {
				var keys = Object.keys( sortable ),
			    	i, len = keys.length;

					keys.sort();

					for ( i = len; i >= 0; i-- ) {
					    k = keys[i];
					    if( sortable.hasOwnProperty( k ) )
						    sorted[k] = sortable[k];
					}
			}
			return sorted;
		},
		renderArchive: function( archiveDate, archiveContentContainer ) {
			var _container = jQuery( this.archiveContentContainer );
			var _historical = true;
			if( typeof archiveContentContainer != "undefined" && jQuery( archiveContentContainer ).length > 0 ) {
				_container = jQuery( archiveContentContainer );
				_historical = false;
			}
			if( _container.length > 0 ) {
				var _storageItems = this.sortByKey( this.load() );
				var _todaysTimer = false;
				var _archivedTimer = false;
				for( _key in _storageItems ) {
					
					if( typeof archiveDate == "undefined" && _key != this.archiveDate ) {
						_archivedTimer = true;
					}
					if ( typeof archiveDate != "undefined" && _key == archiveDate ) {
						_todaysTimer = true;
					}

					if( ( typeof archiveDate == "undefined" && _key != this.archiveDate ) || ( typeof archiveDate != "undefined" && _key == archiveDate ) ) {
					//if( _archivedTimer === true || _todaysTimer === true) {
						if( _archivedTimer === true ) {
							var _archivedItem = jQuery( "<p></p>" );
							var _timerDate = new Date( parseInt( _key ) );
							_archivedItem
								.addClass( "card-subheader" )
								.html(  _timerDate.toDateString() );
							
							_container
								.append( _archivedItem );
							
							//_container.append("<p>"+ new Date( parseInt( _key ) ).toLocaleDateString() + "</p>");
						}
						var _timers = _storageItems[_key];
						var _even = false;
						for( var _timerKey in _timers ) {
							// add timer
							var _timer = this.addTimer();
							if( _timer != null ) {
								// set label and timer
								var _timeOnTimer = _timers[_timerKey].timer;
								var _ms = ( parseInt( _timeOnTimer.substr(0, 2) ) * 3600 + parseInt( _timeOnTimer.substr(2, 2) ) * 60 + parseInt( _timeOnTimer.substr(4, 2) ) ) * 1000;
								_timer.setTimes( _ms );
								_timer.total = ( _ms ); // this is to prevent the restored timers to start from 0
								
								var _label = { target: { value: _timers[_timerKey].label } }
								_timer.setLabel( _label );
								
								// render timer
								var _timerHTML;
								var _chipClass = this.chipClass;
								
								if( _archivedTimer ) {
									_timer.wrapperClass = _chipClass;
									if( !_even )
										_timer.wrapperClass += " odd";
									_timerHTML = _timer.render( false );
									var _archiveControls = jQuery( "<div />" );
									var _removeButton = jQuery( "<button class='remove'>remove</button>" );
									_removeButton.bind('click', {timerWrapperID: _timer.wrapperID}, this.removeArchivedTimer.bind(this));
									//_removeButton.bind( this, "click", {timerWrapperID: _timer.wrapperID}, this.removeArchivedTimer());
									_archiveControls
										.addClass( "controls" )
										.append( _removeButton );
									
									_timerHTML.append( _archiveControls );
									
									_even = !_even;
								} else {
									_timerHTML = _timer.render();
								}
								
								_container
									.append( _timerHTML );
								
								
								_timer.deactivate();
								// add to timekeeper's timers
								if( _todaysTimer ) {
									timekeeper.timers.push( _timer );
								}
							}
							if( Object.keys( _timers )[Object.keys( _timers ).length - 1] == _timerKey && _archivedTimer ) { // this was the last timer

							}
						}
					}
				}
				if( _historical ) {
					if( _container.outerHeight() < _container.parent().outerHeight() ) {
						_container
							.addClass( "scrollable" )
							.parent().append( jQuery( "<span class=\"scroll-for-more\" />" ) );
					}
				}
			}
		},
		addTimer: function( timeOnTimer ) { // timeOnTimer - "dddddd"
			var _timer = null;
			if(typeof(Timer) != 'undefined'){
				var _params = {};
				_timer = new Timer( _params );
			}
			return _timer;
		},
		removeArchivedTimer: function( params ) {
			var _params = params.data || {};
			var _timerID = _params.timerWrapperID || "";
			if( typeof _timerID != "undefined" && _timerID.length > 0 ) {
				var _timerDate = _timerID.replace( "timer_", "" );
				var _archiveKey = this.key;
				// remove from storage
				_storageItems = this.load();
				var _keys = [];
				var _timerHTML = jQuery( "#" + _params.timerWrapperID );
				var _timerLabel = _timerHTML.find( ".label-container .label" ).val();
				var _timerTime = _timerHTML.find( ".times .hours" ).html() + _timerHTML.find( ".times .minutes" ).html() + _timerHTML.find( ".times .seconds" ).html();
				for( _key in _storageItems ) {
					var _day = _storageItems[_key];
					var _i = 0;
					for( _archivedTimerKey in _day ) {
						var _archivedTimer = _day[_archivedTimerKey];
						if( _archivedTimer.label == _timerLabel && _archivedTimer.timer == _timerTime ) {
							// remove timer
							_day.splice( _i, 1 );
							_timerHTML.css("transition","none").slideUp( 600, function() {
								this.remove();
							});
							break;
						}
						_i++;
					}
					if( _day.length > 0 )
						_storageItems[_key] = _day;
					else {
						// remove whole day
						_timerHTML.prev( '.card-subheader' ).css("transition","none").slideUp( 600, function() {
							this.remove();
						});
						delete _storageItems[_key];
					}
				}
				localStorage.setItem( _archiveKey, _storageItems );
				
				
			}
		}
	}
	
	return Archive;
})();