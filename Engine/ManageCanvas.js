var PapyrusPict;

function startCanvas() {

  var elem =  document.getElementById("CanvasHolder");

  var left = elem.getBoundingClientRect().left;
  var top = elem.getBoundingClientRect().top;
  
  Area.start();
  //addComponent(Area);
}

var Area = {
  canvas : document.createElement("canvas"),
  start : function() {

    var elem =  document.getElementById("CanvasHolder");
    var mouseIsDown = false;
    
    var width = elem.getBoundingClientRect().width;
    var height = elem.getBoundingClientRect().height;
    var top = elem.getBoundingClientRect().top;
    var left = elem.getBoundingClientRect().left;
    this.expLeft = left;
    this.expTop = top;

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.cursor = "crosshair";
    this.context = this.canvas.getContext("2d");
    this.context.globalCompositeOperation='lighter';
    
    this.images = [];
    this.selection = null;

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
      if (e.button == 0){
        
        var mx = e.clientX;
        var my = e.clientY;

        var images = Area.images;
        var l = images.length;
        
        for (var i = l-1; i >= 0; i--) {
          if (images[i].contains(mx,my)) {
            var mySel = images[i];
            mouseIsDown = true;
            Area.selection = mySel;
            Area.selection.setOpp = false;
          }
          else {
            Area.images[i].setOpp = true;
          }
        };
      };
    });

    window.addEventListener('mouseup', function (e) {
      mouseIsDown = false;
    });

    window.addEventListener('keydown', function (e) {
      e.preventDefault();
      Area.keys = (Area.keys || []);
      
      if (e.keyCode == 27) {
        if (!stop){
          Area.stop();
          stop = true;
        }
        else {
          Area.interval = setInterval(updateArea, 10);
          stop = false;
        }
      };
      
      if (e.keyCode == 77) {displayMeta()};
      
      if (e.keyCode == 116) {location.reload(true)};
      
      if(Area.selection != null) {
        
        Area.keys[e.keyCode] = (e.type == "keydown");
        
        if (Area.keys && (Area.keys[37] || Area.keys[81])) {Area.selection.angle -= 5 * Math.PI / 180};
        
        if (Area.keys && (Area.keys[39] || Area.keys[68])) {Area.selection.angle += 5 * Math.PI / 180};
        
        if (Area.keys && Area.keys[73] && Area.selection.scale < 1.5) {Area.selection.scale += 0.02};
      
        if (Area.keys && Area.keys[79] && Area.selection.scale > 0.2) {Area.selection.scale -= 0.02};
        
        if (Area.keys && Area.keys[82]) {Area.selection.remove()};
        
      }
      
    });

    window.addEventListener('keyup', function (e) {
      this.angle = 0;
      Area.keys[e.keyCode] = (e.type == "keydown");
    });
    
    window.addEventListener("wheel", function(e) {
      if(Area.selection != null) {
        if (e.deltaY > 0 && Area.selection.scale > 0.2) {Area.selection.scale -= 0.05};
        if (e.deltaY < 0 && Area.selection.scale < 1.5) {Area.selection.scale += 0.05};
      }
    });
    
    window.addEventListener("resize", function() {
      var elem =  document.getElementById("CanvasHolder");
      var ctx = Area.context;
      var images = Area.images;
      var l = images.length;
      
      var width = elem.getBoundingClientRect().width;
      var height = elem.getBoundingClientRect().height;
      
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      
    });
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  }
}

function component(src,ref) {

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
    this.ref = ref;
    
    this.x = Area.canvas.width/2;
    this.y = Area.canvas.height/2;

    this.angle = 0;
    this.scale = 1;
    
    this.setOpp = true;
    
    this.update = function() {
        var ctx = Area.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.scale,this.scale);
        if (this.setOpp) {ctx.globalAlpha = 0.5};
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

component.prototype.remove = function() {
	var index = Area.images.indexOf(this);
	if (index > -1) {
	  Area.images.splice(index, 1);
	}
}

function updateArea() {
  var l = Area.images.length;
  Area.clear();
  for (var i = l-1; i >= 0; i--) {
    Area.images[i].update();
  };
}
