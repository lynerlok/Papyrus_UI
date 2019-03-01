var PapyrusPict;

function startCanvas() {
  
  var elem =  document.getElementById("CanvasHolder");

  var left = elem.getBoundingClientRect().left;
  var top = elem.getBoundingClientRect().top;
  
  Area.start();
  PapyrusPict = new component("1319_r_CL.JPG");
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
        Area.x = PapyrusPict.image.width/2;
      }
      if (Area.y <= 0){
        mouseIsDown = false;
        Area.y = PapyrusPict.image.height/2;
      }
      if (Area.y >= height){
        mouseIsDown = false;
        Area.y = height - PapyrusPict.image.height/2;
}
    });
    
    window.addEventListener('mousedown', function (e) {
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
        ctx.drawImage(this.image,this.image.width / -2, this.image.height / -2, this.image.width, this.image.height);
        ctx.restore();
    }
}

function updateArea() {
  Area.clear();
  var scale = 1;
  var ctx = Area.context;
  
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
  
  if (Area.keys && Area.keys[77]) {displayMeta();}; 
  
  if (Area.keys && Area.keys[116]) {location.reload(true);};
  PapyrusPict.update();
}
