////////////////
// DIRECTIVES //
////////////////

// DATA-SRC as BACKGROUND IMG
app.directive('background', ['$compile', 'Utils', function($compile, Utils) {
    return {
        restrict: 'A',
        link : function(scope, element, attr){
					var smallDevice = Utils.isSmallDevice();
					scope.$watch('avPlaces', function (newval, oldval) {
						if (newval) {
								var desktop = element.attr('data-src');
								var mobile = element.attr('data-src-mobile');
								var img;
								if(smallDevice){
									img = mobile;
								}
								else{
									img = desktop;
								}
								element.css('background', 'url('+img+')');
								element.css('background-size', 'cover');
						}
          });
					scope.$watch('placeObject', function (newval, oldval) {
						if (newval) {
								var desktop = element.attr('data-src');
								var mobile = element.attr('data-src-mobile');
								var img;
								if(smallDevice){
									img = mobile;
								}
								else{
									img = desktop;
								}
								element.css('background', 'url('+img+')');
								element.css('background-size', 'cover');
						}
          });
    		}
		}
}])
