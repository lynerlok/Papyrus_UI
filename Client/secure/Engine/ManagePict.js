/*
 * ManagePict.js
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

/* This file contain functions to manage the images out of the canvas (drag&copy, display metadatas).
*/




var wPX;
var hPX;


function allowDrop(event) {
  event.preventDefault(); // The preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.
}

function drag(event) {
  event.dataTransfer.setData("text/html", event.target.id); // The dataTransfer.setData() method sets the data type and the value of the dragged data;
  // Here we transfer the id of the element.
}

function drop(event) {
  event.preventDefault();
  var data=event.dataTransfer.getData("text/html"); // This method will return any data that was set to the same type in the setData() method.
  var elem = document.getElementById(data); // Here we get the element with the id element.
  var newId = elem.id.replace("_thb","");
	Area.images.push(new component(elem.src,newId)); // Add the image in the canvas.
	getRealSize(newId); //change dimension with values extracted from the XML files.

}

function getTable(){
 // Retrieve the table containing the references of all the fragments images.

	var url = "https://127.0.0.1:8443/secure/ref";
  var request = new XMLHttpRequest(); // create XHR object
  request.open("GET", url, false); // request preparation
  request.send(null); // send request to server

  var jsonObject = request.responseText;
  var PapTable= JSON.parse(jsonObject);
	return PapTable;
};

function getRealSize(ref){


	var PapTable = getTable();
	l = PapTable.length;
	var XMLRef;

	for (var i = 0; i < l; i++) {
		if (PapTable[i].Ref === ref) {
			XMLRef = PapTable[i].MetaDatas;
		}
	}

//http request used to retrieve the Metadatas XML file and pass it in turnRealSize() function.
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			turnRealSize(this); //see below.
		}

	}

	xmlhttp.open("GET", '/secure/' + XMLRef, true);
	xmlhttp.send();


};

function turnRealSize(xml){
 /* Called in getRealSize() function.
  * Retrieve the real dimensions of a fragment from its attached MetaDatas file.
  * these dimensions will be used to keep the real ratio between the different images pushed in the canvas.
	*/
	var widthXML, heightXML, xmlDoc;

	xmlDoc = xml.responseXML;

	var dimXML = xmlDoc.getElementsByTagName("dimensions");
	var widthXML = xmlDoc.getElementsByTagName("width");
	var heightXML = xmlDoc.getElementsByTagName("height");

	var unit = dimXML.item(0).getAttribute("unit");
	var w = widthXML[0].childNodes[0].nodeValue;
	var h = heightXML[0].childNodes[0].nodeValue;

	wPX = w * 37.79527559055;
	hPX = h * 37.79527559055;

	//assign retrieved dimensions to the last image imported into the canvas
	Area.images[Area.images.length-1].image.width = wPX;
	Area.images[Area.images.length-1].image.height = hPX;


};
