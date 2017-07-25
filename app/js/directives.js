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
								element.css('background', 'webkit-gradient(linear,left top,left bottom,from(rgba(13,5,61,0)),color-stop(rgba(13,5,61,.7)),to(#0d053d)),url('+img+');');
								element.css('background', 'linear-gradient(rgba(13,5,61,0),rgba(13,5,61,.7),#0d053d),url('+img+');');
								//element.css('background-size', 'cover');
						}
          });
					scope.$watch('userTips', function (newval, oldval) {
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

//FILE VALIDATION
app.directive('validFile',function(){
  return {
    require:'ngModel',
    link:function(scope,el,attrs,ngModel){
      //change event is fired when file is selected
      el.bind('change',function(){
        scope.$apply(function(){
          ngModel.$setViewValue(el.val());
          ngModel.$render();
        });
      });
    }
  }
});
