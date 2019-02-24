var myGamePiece;

function startGame() {
  var elem =  document.getElementById("CanvasHolder");

	var left = elem.getBoundingClientRect().left;
  var top = elem.getBoundingClientRect().top;
  
  myGameArea.start();
  myGamePiece = new component(80, 80, "red", left, top);
}

var myGameArea = {
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
    
    this.interval = setInterval(updateGameArea, 30);
    
    window.addEventListener('mousemove', function (e) {
      if (!mouseIsDown) return ;
      myGameArea.x = e.clientX - left;
      myGameArea.y = e.clientY - top;
    })
    window.addEventListener('mousedown', function () {
      mouseIsDown = true;
    })
    window.addEventListener('mouseup', function () {
      mouseIsDown = false;
    })
    
    window.addEventListener('keydown', function (e) {
      e.preventDefault();
      myGameArea.keys = (myGameArea.keys || []);
      myGameArea.keys[e.keyCode] = (e.type == "keydown");
    })
    
    window.addEventListener('keyup', function (e) {
      this.angle = 0;
      myGameArea.keys[e.keyCode] = (e.type == "keydown");
    })
    
    window.addEventListener('touchmove', function (e) {
      myGameArea.x = e.touches[0].screenX;
      myGameArea.y = e.touches[0].screenY;
    })
    
     window.addEventListener('touchstart', function () {
      mouseIsDown = true;
    })
    window.addEventListener('touchend', function () {
      mouseIsDown = false;
    })
    
    
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
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
}

function updateGameArea() {
  myGameArea.clear();
  if (myGameArea.x && myGameArea.y) {
    myGamePiece.x = myGameArea.x;
    myGamePiece.y = myGameArea.y;
  }
 // if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.moveAngle = -1; }
 // if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.moveAngle = 1; }
  myGamePiece.newPos();
  myGamePiece.update();
}
