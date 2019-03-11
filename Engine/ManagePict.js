function displayMeta(){
	console.log("Here metadatas");
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text/html", event.target.id);
}

function drop(event) {
  event.preventDefault();
  var data=event.dataTransfer.getData("text/html");
  var elem = document.getElementById(data);
  Area.images.push(new component(elem.src,elem.id));
}
