var PapyrusPict;

function startCanvas() {
  var elem =  document.getElementById("CanvasHolder");

	var left = elem.getBoundingClientRect().left;
  var top = elem.getBoundingClientRect().top;
  
  Area.start();
  PapyrusPict = new component(80, 80, "red", left, top, "rect");
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
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.cursor = "crosshair"; 
    this.context = this.canvas.getContext("2d");
      
    elem.appendChild(this.canvas);
    
    this.interval = setInterval(updateArea, 30);
    
    window.addEventListener('mousemove', function (e) {
      if (!mouseIsDown) return ;
      Area.x = e.clientX - left;
      Area.y = e.clientY - top;
      
      if (Area.x <= 0){
        mouseIsDown = false;
        Area.x = PapyrusPict.width/2;
      }
      if (Area.y <= 0){
        mouseIsDown = false;
        Area.y = PapyrusPict.height/2;
      }
      if (Area.y >= height){
        mouseIsDown = false;
        Area.y = height - PapyrusPict.height/2;
}
    });
    
    window.addEventListener('mousedown', function (e) {
      if (e.button == 1) {displayMeta()} // NOTE : 0 left button | 1 middle button | 2 right button
      mouseIsDown = true;
    });
    
    window.addEventListener('mouseup', function () {
      mouseIsDown = false;
    });
    
    window.addEventListener('keydown', function (e) {
      e.preventDefault();
      Area.keys = (Area.keys || []);
      Area.keys[e.keyCode] = (e.type == "keydown");
    });
    
    window.addEventListener('keyup', function (e) {
      this.angle = 0;
      Area.keys[e.keyCode] = (e.type == "keydown");
    });
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop : function() {
    clearInterval(this.interval);
  }
}


function component(width, height, color, x, y, type) {

    this.type = type;
    this.width = width;
    this.height = height;
    this.angle = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = Area.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
}

function updateArea() {
  Area.clear();
  if (Area.canvas.width) {
    if (Area.x && Area.y) {
      PapyrusPict.x = Area.x;
      PapyrusPict.y = Area.y;
    }
  }
  
  if (Area.keys && Area.keys[37]) {PapyrusPict.angle -= 1 * Math.PI / 180}
  if (Area.keys && Area.keys[39]) {PapyrusPict.angle += 1 * Math.PI / 180}
    
  if (Area.keys && Area.keys[116]) {location.reload(true)}
  PapyrusPict.update();
}
