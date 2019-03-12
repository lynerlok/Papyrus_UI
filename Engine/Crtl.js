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
	 
        var targetRef; // Temporary variable to search if the reference of the target image exists in Area.images (see ManageCanvas.js);
		var l = Area.images.length;
		for (var i = l-1; i >= 0; i--) {
            targetRef = Area.images[i].ref;
            targetRef = targetRef.substring(0,targetRef.length - 4); // Remove _thb in reference of the image (normalize);
            if (targetRef === ref){
                Area.images[i].image.src = src; // Change the source of the image if the image exist in Area.images.
            };
        };
    }

}]);

papyrus.controller('RepeatPapyrus', ['$scope','$rootScope', function($scope,$rootScope){
/*
 * name: RepeatPapyrus;
 * type: AngularJS controller;
 * @param : $scope, $rootScope; Visit : https://docs.angularjs.org/guide/scope;
 * @return : nothing;
 */

	$scope.papyrus = PapyrusTable;
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
