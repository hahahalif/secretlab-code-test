var ls = window.localStorage,
    photo = document.getElementById('uploadImage'),
    canvas = document.getElementById('canvas'),
    tagList = document.getElementById('tag-space'),
    context = canvas.getContext('2d'),
    fileReader = new FileReader(),
    img = new Image(),
    lastImgData = ls.getItem('image'),
    lastImgTags = JSON.parse(ls.getItem('tags')),
    x, y, neww = 0, newh = 0,
    taggerStarted = false,
    taggerLoaded = false,
    taggerID = 0,
    tags = [],
    annotation = false,
    annotationRemove = false,
    prevRectIndex = -1;

if (lastImgData) {
    img.src = lastImgData;   
}

if (lastImgTags) {
    boxes = lastImgTags; 
    displaytagListItem();
    taggerLoaded = true;
}

fileReader.onload = function (e) {
    console.log(typeof e.target.result, e.target.result instanceof Blob);
    img.src = e.target.result;
	wipeTagListItems();
};

img.onload = function() {
    var rw = img.width / canvas.width; // width and height are maximum thumbnail's bounds
    var rh = img.height / canvas.height;
    
    if (rw > rh) {
        newh = Math.round(img.height / rw);
        neww = canvas.width;
    } else {
        neww = Math.round(img.width / rh);
        newh = canvas.height;
    }
    
    x = (canvas.width - neww) / 2,
    y = (canvas.height - newh) / 2,

    drawImage();
	
};

photo.addEventListener('change', function() {
    var file = this.files[0];  
    return file && fileReader.readAsDataURL(file); 
});

function drawImage() {
    if (img.width) context.drawImage(img, x, y, neww, newh);
    ls.setItem('image', img.src);
}

function Box() {
	this.x = 0;
	this.y = 0;
	this.w = 1; // default width and height?
	this.h = 1;
	this.fill = '#444444';
	this.tag = 'default tag';
}

Box.prototype = {
	draw: function(context, isFilled) {
		//context.fillStyle = this.fill;
		context.strokeStyle = "#000000";
        context.lineWidth = 1;
        
		// We can skip the drawing of elements that have moved off the screen:
		if (isFilled) {
			//context.fillRect(this.x, this.y, this.w, this.h);
            context.strokeRect(this.x,this.y,this.w,this.h);
		} else {
			context.strokeRect(this.x,this.y,this.w,this.h);
		}
	} // end draw
}

//Initialize a new Box and add it
function addRect(x, y, w, h, fill, tag) {
	var rect = new Box;
	rect.x = x;
	rect.y = y;
	rect.w = w
	rect.h = h;
	rect.fill = fill;
	rect.tag = tag;
	rect.status = 'active';
    // boxes is an array that holds all our current tags
	boxes.push(rect);
    // store boxes array into local storage
    ls.setItem("tags", JSON.stringify(boxes));
    
    tagListItem = document.createElement('li');
    tagListItem.id = taggerID;
	tagListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    tagListItem.innerHTML = tag;
    tagListItem.innerHTML += '<a href="#" class="btn btn-outline-danger btn-sm" onclick="removeAnnotation(' + taggerID + ')">Delete</a>'

    tagList.appendChild(tagListItem);
    taggerID++;
    
}

// Sets mx,my to the mouse position relative to the canvas
function getMouse(e) {
	var element = canvas;
	offsetX = 0;
	offsetY = 0;

	if (element.offsetParent){
		do{
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		}
		while ((element = element.offsetParent));
	}

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY
}

// User started tagging
handleMouseDown = function(e){
	getMouse(e);

	taggerStarted = true;
	rectX = mx;
	rectY = my;
};

// Either user is moving mouse or drawing a box for tagging
handleMouseMove = function(e){

	if (!taggerStarted){
		return;
	}

	getMouse(e);

	var x = Math.min(mx, rectX),
		y = Math.min(my, rectY),
		w = Math.abs(mx - rectX),
		h = Math.abs(my - rectY);

	mainDraw(x, y, w, h);  // This function draws the box at intermediate steps
    //taggerLoaded = false;
}

// Tagging is completed
handleMouseUp = function(e){
	getMouse(e);
	if (taggerStarted){
		var tag = prompt("Enter any tag");
		if (tag != null && tag != "") {

			var rectH = my - rectY;
			var rectW = mx - rectX;

			if ( rectH < 0) {
				rectY = my;
				rectH = -rectH;
			}
			if (rectW < 0) {
				rectX = mx;
				rectW = -rectW;
			}

			if (rectW == 0 || rectH == 0) {
				alert("Error creating tag! Please specify non-zero height and width");
			} else {
				addRect (rectX, rectY, rectW, rectH, 0, tag);
			}

			// Clear the canvas and draw image on canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawImage();
		}

		taggerStarted = false;
		handleMouseMove(e);

	}
}

function mainDraw(x, y, w, h) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	//context.drawImage(image, imageX, imageY);
    drawImage();

	if (!w || !h){
		return;
	}
	context.strokeRect(x, y, w, h);
}

annotatedMouseMove = function(e){
	getMouse(e);

	var l = boxes.length;
	var i = 0;
	for (i = 0; i < l; i++) {
		if (mx > boxes[i].x && mx < boxes[i].x+boxes[i].w && my > boxes[i].y && my < boxes[i].y+boxes[i].h) {
			if (i != prevRectIndex && boxes[i].status == 'active') {
				prevRectIndex = i;
				context.clearRect(0, 0, canvas.width, canvas.height);
				drawImage();
                mainDraw(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
                
				// Show annotation on mouse over
				annotation = document.createElement('div');
				annotation.style.position = 'absolute';
				annotation.style.top = (offsetY + boxes[i].y) + 'px';
				annotation.style.left = offsetX + boxes[i].x + 'px';
				console.log('offsetX: ' + offsetX);
				console.log('offsetY: ' + offsetY);
				annotation.style.width = boxes[i].w + 'px';
				// annotation.style.lineHeight = boxes[i].h + 'px';
				annotation.className += ' tagger-annotation';

				annotation.innerHTML = boxes[i].tag;

				annotationRemove = document.createElement('button');
				annotationRemove.style.position = 'absolute';
				annotationRemove.style.top = offsetY + boxes[i].y + 'px';
				annotationRemove.style.left = offsetX + boxes[i].x + boxes[i].w - 37 + 'px';
				annotationRemove.className += ' annotation';
				annotationRemove.className += ' tagger-annotation-action-remove';
				annotationRemove.onclick = function() {
					//removeAnnotation(i);
                    removeAnnotation(i);
				};

				document.getElementById('image-space').appendChild(annotation);
				document.getElementById('image-space').appendChild(annotationRemove);
			}
			break;
		}
	}

	if (i == l && prevRectIndex != -1) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawImage();
		//drawAllBoxes(false);
		prevRectIndex = -1;
		if(annotation) {
			document.getElementById('image-space').removeChild(annotation);
			annotation = false;
		}
		if(annotationRemove) {
			document.getElementById('image-space').removeChild(annotationRemove);
			annotationRemove = false;
		}
	}
}

function displaytagListItem() {
    ls.setItem("tags", JSON.stringify(boxes));
    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].status == 'active') {
            tagListItem = document.createElement('li');
            tagListItem.id = i;
			tagListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            tagListItem.innerHTML = boxes[i].tag;
            tagListItem.innerHTML += '<a href="#" class="btn btn-outline-danger btn-sm" onclick="removeAnnotation(' + i + ')">Delete</a>';
            tagList.appendChild(tagListItem);
        }
        
    }
}

function wipeTagListItems(trigger) {
    boxes = [];
    ls.setItem("tags", JSON.stringify(boxes));
	if (trigger == 'button') {
		alert('All tags have been removed!');
	}
    tagList.innerHTML = '';
}

function deleteImage() {
    ls.removeItem("image");
	context.clearRect(0, 0, canvas.width, canvas.height);
	wipeTagListItems();
}

function nextImage() {
    galleryPage++;
    //drawImageFromGallery(galleryPage);
}

function prevImage() {
    galleryPage--;
    //drawImageFromGallery(galleryPage);
}

var removeAnnotation = function(i) {
	//boxes.splice(i,1);
    boxes.splice(i, 1, ['status','inactive']);
	//canvas.mousemove();
    tagList.removeChild(document.getElementById(i));
    alert('Tag has been removed!');
    ls.setItem("tags", JSON.stringify(boxes));
}

drawImage();

// listen for mouse events
$("#canvas").mousedown(function (e) {
    handleMouseDown(e);
});
$("#canvas").mousemove(function (e) {
    handleMouseMove(e);
    annotatedMouseMove(e);
});
$("#canvas").mouseup(function (e) {
    handleMouseUp(e);
});
$("#canvas").mouseout(function (e) {
    //handleMouseOut(e);
});