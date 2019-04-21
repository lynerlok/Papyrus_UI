/*
 * ManageCanvas.js
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

/* This file contain all functions and Area variable to use Canvas.
 * It's the core file of the project client side.
*/

var Area = {
/*
 * name : Area;
 * type : global variable;
 * Description : This is the variable that contain the canvas;
 */

  canvas : document.createElement("canvas"), // Create the canvas element;

  start : function() {
  /*
   * name: start
   * @param : nothing;
   * @return : nothing;
   * Description : Initialize the canvas in web page.
   */
    var elem =  document.getElementById("CanvasHolder"); // Get the canvas container element;
    var mouseIsDown = false; // Initialize this variable with false, mouse buttons are release;
    var stop = false; // Initialize the stop variable to FALSE, the user want to refresh canvas;

    // Get the canvas holder dimensions.
    var width = elem.getBoundingClientRect().width;
    var height = elem.getBoundingClientRect().height;
    var top = elem.getBoundingClientRect().top;
    var left = elem.getBoundingClientRect().left;
  //  this.expLeft = left;
  //  this.expTop = top;
    this.canvas.mode = 'light';
    this.canvas.backgroundColor = "#f1f1f1";
    this.canvas.width = width; // Set the width of the canvas with the width of canvas container;
    this.canvas.height = height; // Set the height of the canvas with the height of canvas container;
    this.canvas.top = top; // Set the top of the canvas with the top of canvas container;
    this.canvas.left = left; // Set the left of the canvas with the left of canvas container;
    this.canvas.style.cursor = "crosshair"; // Set the cursos style when the mouse is in the canvas;
    this.context = this.canvas.getContext("2d"); // Set the canvas context, this is a 2D canvas;
    this.context.globalCompositeOperation='lighter'; // Set how the shapes in canvas interact with others. Lighter : Displays the source image + the destination image;
                                                      // See : https://www.w3schools.com/tags/canvas_globalcompositeoperation.asp

    this.images = []; // Create the images table which contain all the future image display in canvas;
    this.selection = null; // The user select nothing...
    this.scale = 1;
    elem.appendChild(this.canvas); // Add the canvas in the canvas holder in the web page;

    this.interval = setInterval(updateArea, 30); // Set the refresh interval of the canvas (every 30ms);

// BEGIN EVENT LISTENER
/*
 * name: Event listener : mousemove, mousedown, mouseup, keydown, keyup, wheel, resize;
 * @param : event or nothing;
 * @return : nothing;
 * Description : The event listener section for the canvas
 */

    window.addEventListener('mousemove', function (e) {

      if (!mouseIsDown) return ; // If the mouse buttons are up do nothing;

      // The coordinates of the mouse in the canvas are
        //the actual mouse coordinates rectified by the canvas dimensions;
      Area.x = e.clientX - left;
      Area.y = e.clientY - top;

      // The coordinates of a selection is the coordinates of the mouse in the canvas;
      Area.selection.x = Area.x;
      Area.selection.y = Area.y;

      // Movement constraint the image doesn't move out of the canvas;
      // If an image move out of the canvas the mouse is released (mouseIsDown = false);

      if (Area.x < 0){
        mouseIsDown = false;
        Area.selection.x = 0;
      }
      if (Area.x > Area.canvas.width){
        mouseIsDown  = false;
        Area.selection.x = Area.canvas.width;
      }
      if (Area.y < 0) {
        mouseIsDown = false;
        Area.selection.y = 0;
      }
      if (Area.y > Area.canvas.height) {
        mouseIsDown = false;
        Area.selection.y = Area.canvas.height;
      }
      mouseIsDown = true;
    });

    window.addEventListener('mousedown', function (e) {
      if (e.button == 0){ // Mousedown concern the left click only;

        // Get mouse coordinates;
        var mx = e.clientX;
        var my = e.clientY;

        var i = Area.images.length-1; // Get the number of images in Area.images;

        for (i; i >= 0; i--) {
          if (Area.images[i].contains(mx,my)) { // See component.prototype.contains(mx,my) in the code below;
            mouseIsDown = true;
            Area.selection = Area.images[i]; // Select the good image;
            Area.selection.setOpp = false;
          }
          else {
            Area.images[i].setOpp = true;
          }
        };
      };
    });

    window.addEventListener('mouseup', function (e) {
      mouseIsDown = false; // If a mouse button is released the variable mouseIsDown is set to FALSE;
    });

    window.addEventListener('keydown', function (e) {
      Area.keys = (Area.keys || []); // If Area.keys not exists initialize with void table;

      if (e.keyCode == 27) { // ESC key if something go wrong;
        if (!stop){ // ESC is pressed and stop = FALSE;
          Area.stop(); // Stop refresh canvas
          stop = true; // and set stop to TRUE;
        }
        else {
          Area.interval = setInterval(updateArea, 30); // ESC is pressed and stop = TRUE or other, resume refresh canvas
          stop = false; // and set stop to FALSE;
        }
      };

      if (e.keyCode == 77) {displayMeta()}; // M key to run the function displayMeta() /!\ TEMPORARY KEY /!\
      
      if(Area.selection != null) { // If an image is selected get which key is down;

        Area.keys[e.keyCode] = (e.type == "keydown"); // Tag the key that is down with "keydown";

        if (Area.keys && Area.keys[37]) {Area.selection.angle -= 5 * Math.PI / 180}; // If the key is left arrow, rotate the image to the left;

        if (Area.keys && Area.keys[39]) {Area.selection.angle += 5 * Math.PI / 180}; // If the key is right arrow, rotate the image to the right;
        
        if (Area.keys && Area.keys[46]) {Area.selection.remove()}; // If the key is Suppr, remove the image from canvas see : component.prototype.remove() in the code below;
        
        if (Area.keys && Area.keys[80]) {Area.selection.disass()}; // If the key is D, disassemble compound if image is a compound;
        
        if (Area.keys && Area.keys[40]) {Area.scale -= 0.02}; // If the key is arrow down, zoom Out;
        
        if (Area.keys && Area.keys[38]) {Area.scale += 0.02}; // If the key is arrow up, zoom In;
      }

    });

    window.addEventListener('keyup', function (e) {
      this.angle = 0; // If a key is up Angle is set to 0;
      Area.keys[e.keyCode] = (e.type == "keydown"); // JavaScript necessity when a key is up;
    });

    window.addEventListener("wheel", function(e) {
      if(Area.selection != null && e.clientX >= left) { // If the mouse is out of the sidebar and there is an image selected;
        if (e.deltaY > 0 && Area.scale > 0.2) {Area.scale -= 0.02}; // If scroll down, zoom Out;
        if (e.deltaY < 0 && Area.scale < 1.5) {Area.scale += 0.02}; // If scroll up, zoom In;
      }
    });
    
    window.addEventListener("resize", function() {
      var ctx = Area.context;

      var width = elem.getBoundingClientRect().width;
      var height = elem.getBoundingClientRect().height;

      // Change the canvas dimensions according to new canvas holder dimensions;
      ctx.canvas.width = width;
      ctx.canvas.height = height;

    });

// END EVENT LISTENER
  },
  clear : function() {
  /*
   * name: clear
   * @param : nothing;
   * @return : nothing;
   * Description : Clear the canvas to refresh it in updateArea();
   */
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
  /*
   * name: stop
   * @param : nothing;
   * @return : nothing;
   * Description : Turn off refresh canvas.
   */
    clearInterval(this.interval); // JavaScript method see : https://www.w3schools.com/jsref/met_win_clearinterval.asp
  }
}

function component(src,ref) {
/*
 * name: component
 * @param :
 * 	src : the source of the image;
 * 	ref : the reference of the image;
 * @return : nothing;
 * Description : Create a new image for the Area.
 */

    this.image = new Image(); // JS directive to create a new image object;
    this.image.onload = function() {
	/*
	 * name: onload
	 * @param : nothing;
	 * @return : nothing;
	 * Description : This routine is invoked when the image is loaded.
	 */

	// Resize image if the image is greater than the canvas.
      if (this.naturalWidth > this.naturalHeight) {
        while (this.width > (Area.canvas.width/1.5)) {this.width = this.width*0.9;this.height = this.height*0.9};
      }
      if (this.naturalWidth < this.naturalHeight) {
        while (this.height > (Area.canvas.height/1.5)) {this.width = this.width*0.9;this.height = this.height*0.9};
      }
    }
    this.image.src = src; // Initialize the source with src parameter;
    this.ref = ref; // Initialize the reference with ref parameter;

    this.x = Area.canvas.width/2; // Put the image at the center of the canvas;
    this.y = Area.canvas.height/2; //

    this.angle = 0; // Initialize the angle rotation to 0 degree;
    this.scale = 1; // Initialize the resize factor to 1 (no resize);

    this.setOpp = true; // Initialize the oppacity parameter with TRUE (oppacity 0.5);

    this.update = function() {
	/*
	 * name: update
	 * @param : nothing;
	 * @return : nothing;
	 * Description : Update the image paramaters and draw image;
	 */
        var ctx = Area.context;

        ctx.save(); // Save context to apply modification only on the current image;
        ctx.translate(this.x, this.y); // Draw image at the new coordinates;
        ctx.rotate(this.angle); // Rotate image;
        ctx.scale(Area.scale,Area.scale); // Resize all images if scale != 1;
        if (this.setOpp) {ctx.globalAlpha = 0.5}; // If setOpp is TRUE image has oppacity.
        ctx.drawImage(this.image,this.image.width / -2, this.image.height / -2, this.image.width, this.image.height); // Draw image according to the previous modification;
        ctx.restore(); // Restore context to see modification only on the current image.
    }

}

component.prototype.contains = function(mx, my) {
/*
 * name: component.contains
 * @param : mouse coordinates X (mx) and Y (my);
 * @return : TRUE if the coordinates are in a circle around the center, FALSE otherwise;
 * Description : Check if the mouse pointer is near the center of an image (circle with radius "offset");
 */

// Get the length of the canvas to compute comparison.
  var elem =  document.getElementById("CanvasHolder");

  var top = elem.getBoundingClientRect().top;
  var left = elem.getBoundingClientRect().left;
  var offset = 200 ; // Offset around center to consider mouse in image.

  return  (mx-left) >= (this.x-offset) && (mx-left) <= (this.x+offset) &&
            (my-top) >= (this.y-offset) && (my-top) <= (this.y+offset);
}

component.prototype.remove = function() {
/*
 * name: component.remove
 * @param : nothing;
 * @return : nothing;
 * Description : Remove the image (component) from canvas.
 */
	var index = Area.images.indexOf(this); // Search the object in Area.images;
	if (index > -1) { // If the object is found...
	  Area.images.splice(index, 1); // Remove the object from Area.images;
	}
}

component.prototype.disass = function () {
  console.log("we are in disass");
  var index = Area.images.indexOf(this); // Search the object in Area.images;
	if (index > -1) { // If the object is found...
    var refImg = Area.images[index].ref;
    if (refImg.substr(0,8) === "Compound") {
      var tmpImg = Area.images[index];
      $.get('Datas/'+refImg+'.json', function(data, status){
        $.get('/secure/ref', function(tableJSON, status){
          
          var table = JSON.parse(tableJSON);
          Area.images = [];
          var l=data.length;
          var l2 = table.length;
          
          for (var i=0;i<l;i++) {
            for (var j=0;j<l2;j++){
              if (table[j].Ref === data[i].ref){
                Area.images.push(new component(table[j].RCL,table[j].Ref));
                Area.images[i].x = data[i].x;
                Area.images[i].y = data[i].y;
                Area.images[i].angle = data[i].angle;
                Area.images[i].scale = data[i].scale;
              }
            }
          }
          
        });
      });
      $.post("/secure/DestroyCMP",{compound: refImg},
          function(data, status){
            console.log("Compound destroyed !");
          });
    }
	}
}

component.prototype.metadatas = function () {console.log("Display metadata soon")}

function updateArea() {
/*
 * name: updateArea;
 * @param : nothing;
 * @return : nothing;
 * Description : This function refresh the canvas.
 * 		1. Clear canvas;
 * 		2. Draw all images.
 */
  var l = Area.images.length;
  Area.clear(); // Run function clear() see Area.
  for (var i = l-1; i >= 0; i--) {
    Area.images[i].update(); // Run function update() see Area.
  };
}
