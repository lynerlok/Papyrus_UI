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
 
 
function displayMeta(){
	console.log("Here metadatas");
}

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
  Area.images.push(new component(elem.src,elem.id)); // Add the image in the canvas.
}

function exportCompound(){
	$("#sendCP").click(function(){
		$.post("secure/interface.html/compound",JSON.stringify(Area.images));
	});
}
