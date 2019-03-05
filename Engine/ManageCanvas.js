var PapyrusPict;

function startCanvas() {

  var elem =  document.getElementById("CanvasHolder");

  var left = elem.getBoundingClientRect().left;
  var top = elem.getBoundingClientRect().top;

  Area.start();
  PapyrusPict = new component("1319_r_CL.JPG");
  Area.images.push(PapyrusPict);
}

var Area = {
  canvas : document.createElement("canvas"),
  start : function() {

    var elem =  document.getElementById("CanvasHolder");
    var mouseIsDown = false;
	this.setOpp = false;
	
    var width = elem.getBoundingClientRect().width;
    var height = elem.getBoundingClientRect().height;
    var top = elem.getBoundingClientRect().top;
    var left = elem.getBoundingClientRect().left;

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.cursor = "crosshair";
    this.context = this.canvas.getContext("2d");

    // BEGIN MODIFICATION
    this.images = [];
    this.selection = null;
    // END MODIFICATION

    elem.appendChild(this.canvas);

    this.interval = setInterval(updateArea, 30);

    window.addEventListener('mousemove', function (e) {
      if (!mouseIsDown) return ;
      Area.x = e.clientX - left;
      Area.y = e.clientY - top;
      Area.selection.x = Area.x;
      Area.selection.y = Area.y;
    });

    window.addEventListener('mousedown', function (e) {
      var offset = 100;

      // BEGIN MODIFICATION
      var myState=this;
      var mx = e.clientX - left;
      var my = e.clientY - top;
      var images = Area.images;
      var l = images.length;


      for (var i = l-1; i >= 0; i--) {
        if (images[i].contains(mx+left, my+top)) {
          var mySel = images[i];
          console.log(mySel);
          // Keep track of where in the object we clicked
          // so we can move it smoothly (see mousemove)
          //myState.dragoffx = mx - mySel.x;
          //myState.dragoffy = my - mySel.y;

          mouseIsDown = true;
<<<<<<< HEAD
          Area.setOpp = false;
=======
>>>>>>> db3acc328175ea0e5f2bebabf9ed5cad452bbdc1
          Area.selection = mySel;
          return;
        }
        // END MODIFICATION
        else {
          mouseIsDown = false;
<<<<<<< HEAD
          Area.setOpp = true;
=======
>>>>>>> db3acc328175ea0e5f2bebabf9ed5cad452bbdc1
        }
      };

      if (Area.selection) {Area.selection = null};
    });

    window.addEventListener('mouseup', function (e) {
      mouseIsDown = false;
      Area.setOpp = true;
    });

    window.addEventListener('keydown', function (e) {
      e.preventDefault();
      Area.keys = (Area.keys || []);
      Area.keys[e.keyCode] = (e.type == "keydown");
       
      if (e.keyCode == 27) {
        if (!stop){
          Area.stop();
          stop = true;
        }
        else {
          Area.interval = setInterval(updateArea, 30);
          stop = false;
        }
      };
      
      Area.setOpp = false;
    });

    window.addEventListener('keyup', function (e) {
      this.angle = 0;
      Area.keys[e.keyCode] = (e.type == "keydown");
      Area.setOpp = true;
    });
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  }
}



function component(src) {

    this.image = new Image();

    this.image.onload = function() {

      if (this.naturalWidth > this.naturalHeight) {
        while (this.width > (Area.canvas.width/1.5)) {this.width = this.width*0.9;this.height = this.height*0.9};
      }
      if (this.naturalWidth < this.naturalHeight) {
        while (this.height > (Area.canvas.height/1.5)) {this.width = this.width*0.9;this.height = this.height*0.9};
      }
    }
    this.image.src = src;
	this.image.id = "papyrus";
	
    this.x = Area.canvas.width/2;
    this.y = Area.canvas.height/2;

    this.angle = 0;
    this.scale = 1;

    this.update = function() {
        ctx = Area.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.scale,this.scale);
        if (Area.setOpp) {ctx.globalAlpha = 0.5};
        ctx.drawImage(this.image,this.image.width / -2, this.image.height / -2, this.image.width, this.image.height);
        ctx.restore();
    }
}

component.prototype.contains = function(mx, my) {

  var elem =  document.getElementById("CanvasHolder");

  var top = elem.getBoundingClientRect().top;
  var left = elem.getBoundingClientRect().left;
  var offset = 100 ;

  return  (mx-left) >= (this.x-offset) && (mx-left) <= (this.x+offset) &&
            (my-top) >= (this.y-offset) && (my-top) <= (this.y+offset);
}

function updateArea() {
  Area.clear();
  var scale = 1;

  if (Area.x && Area.y) {
    PapyrusPict.x = Area.x;
    PapyrusPict.y = Area.y;
  }

  if (Area.keys && (Area.keys[37] || Area.keys[81])) {PapyrusPict.angle -= 5 * Math.PI / 180}
  if (Area.keys && (Area.keys[39] || Area.keys[68])) {PapyrusPict.angle += 5 * Math.PI / 180}

  if (Area.keys && Area.keys[73]) {
    if (PapyrusPict.scale < 1.5) {
      PapyrusPict.scale += 0.05;

    };
  };

  if (Area.keys && Area.keys[79]) {
    if (PapyrusPict.scale > 0.2) {
      PapyrusPict.scale -= 0.05;
    };
  };

  if (Area.keys && Area.keys[77]) {displayMeta()};

  if (Area.keys && Area.keys[116]) {location.reload(true)};
  
  PapyrusPict.update();
}
