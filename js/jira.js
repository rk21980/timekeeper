var Jira = (function(){
	function Jira(params){
		this.init(params);
	}
	
	Jira.prototype = {
		init: function(params){
			this.wrapper = params.wrapper;
			this.fields = params.fields; // {un:[un],pw:[pw]}
		},
		connect: function(params){
			timekeeper.setLoading();
			var _fields = this.fields;
			
			// TODO
			// add input validation
			
			var _params = 
				"un="+jQuery('input[name='+_fields.un+']').val()+"&"+
				"pw="+jQuery('input[name='+_fields.pw+']').val();
			
			jQuery.ajax({
				method: 'post',
				url: timekeeper.baseURL+'jira_connect.php',
				data: 'params='+window.btoa(unescape(encodeURIComponent(_params))),
				success: function(response){
					console.warn(response);
				},
				error: function(){
					console.error('Could not connect');
				},
				complete: function(){
					timekeeper.resetLoading();
				}
			})
		},
		toggleLogin: function(){
			if(typeof this.wrapper != 'undefined' && jQuery(this.wrapper).length > 0){
				var _daddy = jQuery(this.wrapper);
				if(_daddy.hasClass('hidden')){
					_daddy.removeClass('hidden');
					_daddy.find('input[name='+this.fields.un+']').focus();
				} else {
					_daddy.addClass('hidden');
				}
			}
		}
	}
	return Jira;
})();