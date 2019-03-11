papyrus.controller('PictCrtl', ['$scope','$rootScope', function($scope,$rootScope) {
    
    $rootScope.changeAttr = function(src,ref){
        var targetRef;
		var l = Area.images.length;
		for (var i = l-1; i >= 0; i--) {
            targetRef = Area.images[i].ref;
            targetRef = targetRef.substring(0,targetRef.length - 4);
            if (targetRef === ref){
                Area.images[i].image.src = src;
            };
        };
    }

}]);

papyrus.controller('RepeatPapyrus', ['$scope','$rootScope', function($scope,$rootScope){
	$scope.papyrus = PapyrusTable;
	$rootScope.AccFunc = function(id) {
		var x = document.getElementById(id);
		if (x.className.indexOf("w3-show") == -1) {
		    x.className += " w3-show";
		} else {
		    x.className = x.className.replace(" w3-show", "");
		}
	};
}]);
