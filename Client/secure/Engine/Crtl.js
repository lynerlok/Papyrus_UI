/*
 * Crtl.js
 *
 * Elisabeth Gueux, Salome Mialon, Quentin Piet, Axel Polin
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * Please visit : https://github.com/axel-polin/Papyrus_UI
 *
 */

/* This file contain angularJs controllers. It is a specification of AngularJS.
 * More informations at : https://docs.angularjs.org/guide/controller;
 */

papyrus.controller('PictCrtl', ['$scope','$rootScope', function($scope,$rootScope) {
/*
 * name: PictCrtl;
 * type: AngularJS controller;
 * @param : $scope, $rootScope; Visit : https://docs.angularjs.org/guide/scope;
 * @return : nothing;
 */

    $rootScope.changeAttr = function(src,ref){

	/*
	 * name: changeAttr;
	 * @param : src, the target source to change the image recto<->verso Color<->Infrared ;
	 * ref, the reference of the image see PapyrusTable.js
	 * @return : nothing;
	 */
      
		var l = Area.images.length;
		for (var i = l-1; i >= 0; i--) {
            if (Area.images[i].ref === ref){
                Area.images[i].image.src = src; // Change the source of the image if the image exist in Area.images.
            };
        };
    }
    
}]);

papyrus.controller('RepeatPapyrus', ['$scope','$rootScope','$http', function($scope,$rootScope,$http){
/*
 * name: RepeatPapyrus;
 * type: AngularJS controller;
 * @param : $scope, $rootScope; Visit : https://docs.angularjs.org/guide/scope;
 * @return : nothing;
 */  
  $http({
    method : "GET",
    url : "/secure/ref"
    }).then(function(response) {
       $scope.papyrus = response.data;
    }, function(response) {
      alert(response.statusText);
  });
  
	$rootScope.AccFunc = function(id) {
	/*
	 * name: AccFunc;
	 * @param : id, the id of the element to repeat;
	 * @return : nothing;
	 */

		var x = document.getElementById(id);
		if (x.className.indexOf("w3-show") == -1) {
		    x.className += " w3-show";	// If the class w3-show doesn't exist, add the class to show the accordion menu of the image;
		} else {
		    x.className = x.className.replace(" w3-show", ""); // If the class exist remove the w3-show class to hide the accordion;
		}
	};
}]);

papyrus.controller('ChangeTab',['$scope','$rootScope', function($scope,$rootScope){

	$rootScope.tabSwitch = function($event,tabName){
	  var i, x, tablinks;
	  x = document.getElementsByClassName("tab");

	  for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none";
	  }

	  tablinks = document.getElementsByClassName("tablink");

	  for (i = 0; i < x.length; i++) {
	    tablinks[i].className = tablinks[i].className.replace(" w3-black", "");
	  }

	  document.getElementById(tabName).style.display = "block";
	  $event.currentTarget.className += " w3-black";
	}
}]);

papyrus.controller('UploadImage', ['$scope','$rootScope','$http', function($scope,$rootScope,$http){
	
  $scope.viewImg=false;
  
  $scope.genThbCanvas = function(){
	if ($scope.viewImg==false){
    var l = Area.images.length;
    Area.clear(); // Run function clear() see Area.
    for (var i = l-1; i >= 0; i--) {
      Area.images[i].setOpp = false;
      Area.images[i].update(); // Run function update() see Area.
    };  
    var thumbnailCanvas = document.getElementById('thumbnailCanvas');
    $scope.dataURL = Area.canvas.toDataURL('image/png');
    thumbnailCanvas.src = $scope.dataURL;
    $scope.viewImg = true;
	}
	else {$scope.viewImg = false;}
  };
  
	$scope.Upload = function() {
    var img = $scope.dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    var dataToSend = JSON.stringify([{ "imgCompound" : img}].concat([{ "areaImages" : Area.images}]));

    $http({
      method : "POST",
      url : "/secure/compUpload",
      data : dataToSend,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8'
    }).then(function(response) {
      console.log("Image uploaded");
    }, function(response) {
      console.log("Error while uploading file !!");
    });
	};
}]);
