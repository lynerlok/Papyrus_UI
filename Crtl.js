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

papyrus.directive('dragPicture', ['$document', function($document) {
  return {
    link: function(scope, element, attr) {
    
      var elem =  document.getElementById("Canvas");
      var dragElem = document.getElementById("Drag");
      
      var top = elem.getBoundingClientRect().top;
      var bottom = elem.getBoundingClientRect().bottom;
      var left = elem.getBoundingClientRect().left;
      var right = elem.getBoundingClientRect().right;
      var widthDragElem = dragElem.naturalWidth;
      var heightDragElem = dragElem.naturalHeight;
    
      var startX = dragElem.getBoundingClientRect().left, startY = dragElem.getBoundingClientRect().top, x = startX, y = startY;
      
      element.css({
        position:  'fixed',
        cursor: 'pointer'
      });
      
      console.log(widthDragElem);
      console.log(heightDragElem);
      
      element.on('mousedown', function(coord) {
        // Prevent default dragging of selected content
        coord.preventDefault();
        startX = coord.clientX - x;
        startY = coord.clientY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(coord) {
        
        x = coord.clientX - startX;
        y = coord.clientY - startY;

        if ((x>(left-1)) && (x<(right-(widthDragElem+1)))){
          element.css({
            left:  x + 'px'
          });
        }
        
        if ((y>(top-1)) && (y<(bottom-(heightDragElem+4)))){
          element.css({
            top: y + 'px'
          });
        }
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    }
  };
}]);
