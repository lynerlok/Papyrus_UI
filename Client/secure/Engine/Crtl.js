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
      var exists = false;

      var newref = ref.replace("_thb","");
      var l = Area.images.length;
      for(var i = l-1; i >= 0; i--){
          if(Area.images[i].ref === ref){
            exists = true;
            Area.images[i].image.src = src; // Change the source of the image if the image exist in Area.images.
          }

      }

      if (exists == false) {
        Area.images.push(new component(src,newref)); // add the image in the canvas if doesn't exist in Area.images.
      }
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
/*
 * name: ChangeTab;
 * type: AngularJS controller to switch tab in interface;
 * @param : $scope, $rootScope; Visit : https://docs.angularjs.org/guide/scope;
 * @return : nothing;
 */

	$rootScope.tabSwitch = function($event,tabName){
  /*
   * name: tabSwitch;
	 * @param : $event, tabName the name of tab to switch;
	 * @return : nothing;
	 */
	  var i, x, tablinks; // Utility variable
	  x = document.getElementsByClassName("tab"); // Get all the tabs in the bar;

	  for (i = 0; i < x.length; i++) {
	    x[i].style.display = "none"; // Defaults hide tabs.
	  }

	  tablinks = document.getElementsByClassName("tablink"); // Get all the links to the tabs;

	  for (i = 0; i < x.length; i++) {
	    tablinks[i].className = tablinks[i].className.replace(" w3-black", ""); // Remove the color class from all ;
	  }

	  document.getElementById(tabName).style.display = "block"; // Display only the good tab;
	  $event.currentTarget.className += " w3-black"; // On click change color.
	}
}]);

papyrus.controller('UploadImage', ['$scope','$rootScope','$http', function($scope,$rootScope,$http){
/*
 * name: UploadImage;
 * type: AngularJS controller to switch tab in interface;
 * @param : $scope, $rootScope, $http; Visit : https://docs.angularjs.org/guide/scope
 *                                         and https://docs.angularjs.org/api/ng/service/$http;
 * @return : nothing;
 */

  $scope.viewImg=false; // Switch to view or actualize view.

  $scope.genThbCanvas = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */

    if ($scope.viewImg==false){ // If the view is hide;
      var l = Area.images.length;
      Area.clear(); // Run function clear() see Area:
      for (var i = l-1; i >= 0; i--) {
        Area.images[i].setOpp = false; // Remove oppacity on all images in canvas in the view only;
        Area.images[i].update(); // Run function update() see Area.
      };
      var thumbnailCanvas = document.getElementById('thumbnailCanvas'); // PlaceHolder of the image;
      $scope.dataURL = Area.canvas.toDataURL('image/png'); // Store images in url in Base64 encoding;
      thumbnailCanvas.src = $scope.dataURL; // Put the URL in the src placeholder;
      $scope.viewImg = true; // Indicates that the view is active;
    }
    else {$scope.viewImg = false;} // If the view is showed switch to hide;

  };

	$scope.UploadCanvas = function() {
  /*
  * name: UploadCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function send the canvas image to the server.
  */

    var img = $scope.dataURL.replace(/^data:image\/(png|jpg);base64,/, ""); // Extract only Base64 text of the url image without metadatas;
    var dataToSend = JSON.stringify([{ "imgCompound" : img}].concat([{ "areaImages" : Area.images}]));
    // ^- Create a JSON string with concatenation of img txt and the Area.images array (see Area);

    $http({ // Post all datas to server;
      method : "POST", // Method accepted by the server is POST;
      url : "/secure/compUpload", // The URL where the server accept this type of POST;
      data : dataToSend, // Put the data to send here;
      dataType: 'json', // The type of data is JSON;
      contentType: 'application/json; charset=utf-8' // Content-Type for the server and the communication;
    }).then(function(response) {
      alert("Image uploaded"); // If the image sucessfuly uploaded alert user;
    }, function(response) {
      alert("Error while uploading file !!"); // If the upload fail alert user;
    });
	};
}]);

papyrus.controller('ToolsCommand', ['$scope','$rootScope','$http', function($scope,$rootScope,$http){

  $scope.Treshold = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    var dataToSend = JSON.stringify({ "img" : Area.selection.ref});
    console.log(Area.selection.ref);
    // ^- Create a JSON string with concatenation of img txt and the Area.images array (see Area);

    $http({ // Post all datas to server;
      method : "POST", // Method accepted by the server is POST;
      url : "/secure/treshold", // The URL where the server accept this type of POST;
      data : dataToSend, // Put the data to send here;
      dataType: 'json', // The type of data is JSON;
      contentType: 'application/json; charset=utf-8' // Content-Type for the server and the communication;
    }).then(function(response) {
      alert("Image sucessfuly tresholded ! (refresh to view modification)"); // If the image sucessfuly uploaded alert user;
    }, function(response) {
      alert("Error while uploading file !!"); // If the upload fail alert user;
    });

  };

  $scope.RemoveImage = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.selection != null) {Area.selection.remove()}
  };

  $scope.ZoomOut = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.scale > 0.2) {Area.scale -= 0.02};
  };

  $scope.ZoomIn = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.scale < 1.5) {Area.scale += 0.02};
  };

  $scope.RotateLeft = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.selection != null) {
      Area.selection.angle -= 5 * Math.PI / 180;
    }
  };

  $scope.RotateRight = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.selection != null) {
      Area.selection.angle += 5 * Math.PI / 180;
    }
  };

  $scope.RealSize = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
  var ctx = Area.context;
  var cnv = document.getElementById('canvas');

  var width = cnv.getBoundingClientRect().width;
  var height = cnv.getBoundingClientRect().height;

  // Change the canvas dimensions according to new canvas holder dimensions;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  };

  $scope.MetaData = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.selection != null) {Area.selection.metadatas()}
  };

  $scope.ChangeVisual = function(visual){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    var l = Area.images.length;
    var RCLsuffix = "r_CL.JPG";
    var RIRsuffix = "r_IR.JPG";
    var VCLsuffix = "v_CL.JPG";
    var VIRsuffix = "v_IR.JPG";

    for (var i = 0; i < l; i++) {
      if (visual === "RCL") {Area.images[i].image.src = Area.images[0].image.src.replace(/.{8}$/,RCLsuffix);}
      if (visual === "RIR") {Area.images[i].image.src = Area.images[0].image.src.replace(/.{8}$/,RIRsuffix);}
      if (visual === "VCL") {Area.images[i].image.src = Area.images[0].image.src.replace(/.{8}$/,VCLsuffix);}
      if (visual === "VIR") {Area.images[i].image.src = Area.images[0].image.src.replace(/.{8}$/,VIRsuffix );}
    }
  };

  $scope.DisassCompound = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    if (Area.selection != null) {Area.selection.disass()}
  };

  $scope.ChangeLight = function(){
 /*
  * name: genThbCanvas;
  * @param : nothing;
  * @return : nothing:
  * This function generate the canvas image in a local URL.
  */
    var cnv = document.getElementById('canvas');
    var white = '#f1f1f1';
    var dark = '#172631'

    if (Area.canvas.mode === 'light'){
      canvas.style.backgroundColor = dark;
      Area.canvas.mode = 'night';
    }
    else{
      canvas.style.backgroundColor = white;
      Area.canvas.mode = 'light';
    }

  };
  $scope.BestMatches = function(){
    /*
     * name: genThbCanvas;
     * @param : nothing;
     * @return : nothing:
     * This function generate the canvas image in a local URL.
     */
    if (Area.selection == null) {

      alert('please, select an image');
      return;
    }
    document.getElementById('matches').style.display='block';
    console.log("coucou");
    // get data from csv file content
    var url = "https://127.0.0.1:8443/secure/Datas/scoreMatrix.csv";

    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send(null);

    var csvData = new Array();
    var jsonObject = request.responseText.split(/\r?\n|\r/);
    for (var i = 0; i < jsonObject.length; i++) {
      csvData.push(jsonObject[i].split(','));
    }
    //search correspoonding match scores

    var l = csvData.length;
    var ref = Area.selection.ref;
    var index;

    for (var i = 0; i < l; i++) {
      //console.log(csvData[0][i]);
      if(csvData[0][i] == `\"${ref}\"`){

        index = i;
        var matchRef;
        var matchScore;
	var obj = {};

        for (var j = 1; j < csvData.length-1; j++) {
          if(j!== index){
            matchScore = csvData[index][j];
            matchRef = csvData[0][j];
            matchRef = matchRef.substr(1,matchRef.length-2);

	    obj[matchRef] = Number(matchScore);
        }
      }
    }
  }
  var sortable = [];
  for (var ref in obj) {
     sortable.push([ref, obj[ref]]);
  }

  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });
console.log(sortable);

  var div;
  var img;
  var matchSrc;
  var url = "https://127.0.0.1:8443/secure/ref";

  var request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.send(null);

  var csvData = new Array();
  var jsonObject = request.responseText;
  var PapTable= JSON.parse(jsonObject);
  var index = 0;
  for (var i = 0; i < sortable.length; i++) {
    for(var j = 0; j < PapTable.length; j++) {
      if (PapTable[j]['Ref'] == sortable[i][0] && sortable[i][1]  >= 0.60) {
          index+=1;
          matchSrc = PapTable[j]['RCL'];

          div = document.createElement('div');
          document.getElementById("scores").appendChild(div);
          div.id = `${index}`;
          div.className = "match"
          div.style

          p = document.createElement('p');
          document.getElementById(`${index}`).appendChild(p);
          p.id = `refscore${index}`;
          document.getElementById(`refscore${index}`).innerHTML = `${sortable[i][0]} score: ${sortable[i][1]}`;

          img = document.createElement('img');
          document.getElementById(`${index}`).appendChild(img);

          img.className = 'PapyMatch';
          img.src = matchSrc;
          img.id = sortable[i][0];

          img.addEventListener('click',function(e){
            $scope.modalAdd(this.src,this.id);
          });


      }

    }
//     var test = document.getElementsByClassName('PapyMatch');
//     var l = test.length;
//     console.log(test.length);
}


};

$scope.modalAdd = function(src,ref){

  var exists = false;

  var l = Area.images.length;
  for(var i = l-1; i >= 0; i--){
      if(Area.images[i].ref === ref){
        exists = true;
        alert("image already in use !"); // Change the source of the image if the image exist in Area.images.
      }
      if (exists == false){
        $rootScope.changeAttr(src,ref);
      }
  }
};


  $scope.quitModal = function(){
    var modal = document.getElementById('matches');
     var c = document.getElementById("scores").childElementCount;
     //console.log(c);
    for (var i = 1; i <= c ; i++) {
      document.getElementById(i).remove();
    }
    modal.style.display='none';

  }
}]);
