function modalJS(Id) {
	var element = document.getElementById(Id);
	document.getElementById("modalimg").src = element.src;
	document.getElementById("modaldiv").style.display = "block";
	var captionText = document.getElementById("caption");
	captionText.innerHTML = document.getElementById(Id+"Caption").innerHTML;
}
