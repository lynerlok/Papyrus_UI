papyrus.controller('PictCrtl', ['$scope','$rootScope',
  function($scope,$rootScope) {
    $rootScope.showPict = false;
    
    $rootScope.showFunc = function() {
    $rootScope.showPict = !$rootScope.showPict;
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
