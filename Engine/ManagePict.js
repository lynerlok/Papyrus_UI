function displayMeta(){
	console.log("Here metadatas");
}

function addComponent(Area){
  Area.images.push(new component("fake_data/1319_r_CL.JPG",0));
  Area.images.push(new component("fake_data/88_a_r_CL.JPG",200));
  Area.images.push(new component("fake_data/1242_r_CL.JPG",400));
}


function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
}
