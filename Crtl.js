papyrus.controller('CanvasCrtl', ['$scope','$rootScope',
  function($scope,$rootScope) {
  $scope.Coord = function(coord) {
    $scope.x = coord.clientX;
    $scope.y = coord.clientY;
  }
}]);

papyrus.controller('PictCrtl', ['$scope','$rootScope',
  function($scope,$rootScope) {
    $rootScope.showPict = false;
    
    $rootScope.showFunc = function() {
    $rootScope.showPict = !$rootScope.showPict;
	}
}]);

papyrus.controller('RepeatPapyrus', ['$scope','$rootScope', function($scope,$rootScope){
	$scope.papyrus = [
		{
            "Ref" : "0",
            "RCL" : "rcl",
            "VCL" : "vcl",
            "RIR" : "rir",
            "VIR" : "vir"
        },{
            "Ref" : "1",
            "RCL" : "",
            "VCL" : "",
            "RIR" : "",
            "VIR" : ""
        },{
            "Ref" : "2",
            "RCL" : "",
            "VCL" : "",
            "RIR" : "",
            "VIR" : ""
        },{
            "Ref" : "3",
            "RCL" : "",
            "VCL" : "",
            "RIR" : "",
            "VIR" : ""
        }
	];
	$rootScope.AccFunc = function(id) {
		var x = document.getElementById(id);
		if (x.className.indexOf("w3-show") == -1) {
		    x.className += " w3-show";
		} else {
		    x.className = x.className.replace(" w3-show", "");
		}
	};
}]);


papyrus.directive('PictDir',function(){
    return {
        restrict:'A',
        scope:{
            number:'@'
        },
        link:function(scope,element,value){
            element.html('je suis la directive numero ' + scope.number);
        }
    };
});

function mainController($scope, $compile){
    var number=0;
    $scope.addItem = function(){
        var compiled = $compile("<div demo-dir number='" + number + "'>coucou</div>")($scope);
        angular.element(document.getElementById('placeholder')).append(compiled);
        number+=1;
    }
};
