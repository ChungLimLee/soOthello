/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// MODAL BOX CSS AND HTML INSERTIONS

document.body.insertAdjacentHTML('beforeend', `

<style>

.modal_window_shade {

  display: none;
  position: fixed;
  z-index: 100000;
  width: 120%; 
  height: 120%;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.6);
}

.modal_window_bottom_left {

   display: none;
   position: fixed;
   margin: 20;
   padding: 2%;
   left: 0;
   bottom: 2%;
   width: auto;
   /*height: 12%;*/
   z-index: 100001;
   background-color: white;
   overflow: auto;
}

.modal_window {

   display: none;
   position: fixed;
   top: 50%;
   left: 50%;
   padding: 0%;
   transform: translate(-50%, -50%);  
   width: 320px;
   z-index: 100001;
   background-color: white;
   border-radius: 5px;
   overflow: auto;
}

.modal_window_big {

   display: none;
   position: fixed;
   top: 50%;
   left: 50%;
   padding: 2%;
   transform: translate(-50%, -50%);  
   width: 80%;
   z-index: 100001;
   background-color: white;
   overflow: auto;
}

.modal_window_close {

   color: #c0c0c0;
   font-size: 34px;
   font-weight: bold;
   padding: 8px;
   cursor: pointer;
}

.modal_close:hover {

   color: black;
   cursor: pointer;
}

.modal_window_close_new {

   color: #c0c0c0;
   font-size: 34px;
   font-weight: bold;
   margin-left: 8px;
   cursor: pointer;
}

.modal_close_new:hover {

   color: black;
   cursor: pointer;
}

</style>

`);





// MODAL BOX JAVASCRIPT (STANDARD, INDEPENDENT STATES ARE POSSIBLE)

function modal_box$(option) {
	
	modal_box$.id$ += 1;
	this.id = modal_box$.id$;
	

	document.body.insertAdjacentHTML('beforeend', `

		<div id="modal_box_shade_${this.id}" class="modal_window_shade">
		</div>

		<div id="modal_box_window_${this.id}" class="modal_window">
			<span id="modal_box_close_button_${this.id}" class="modal_window_close_new">&times;</span>
			<span id="modal_box_content_${this.id}"></span>
		</div>	
	`);


	this.shade = document.getElementById(`modal_box_shade_${this.id}`);
	this.shade.addEventListener('click', (function() { if (this.must_respond === false) this.close(); }).bind(this) );
	
	if (option !== undefined)
		this.shade.style.zIndex = 100_000 + option.z_index;	// when z_index the same as other modal_box then the order of the last inserted will seen higher


	this.window = document.getElementById(`modal_box_window_${this.id}`);
	
	if (option !== undefined)
		this.window.style.zIndex = 100_001 + option.z_index;


	this.close_button = document.getElementById(`modal_box_close_button_${this.id}`);
	this.close_button.addEventListener('click', (function() { this.close(); }).bind(this) );

	this.content = document.getElementById(`modal_box_content_${this.id}`);
	this.must_respond = false;
}

modal_box$.id$ = 0;	// *** keep track the number of modal_box created and use it for new id generation
modal_box$.showing$ = false;	// *** global flag indiciate any modal_box$ is currently showing by using this.show();

modal_box$.prototype.show = function(html_content, option) {

	modal_box$.showing$ = true;	// for global (compatibility)
	this.showing$ = true;	// for self
	
	
	this.window.style.display = "block";


	if (option !== undefined && option.shade === false) // shade for dimming the background surrounding this modal window (default true)
		; // do nothing (no shade)
	else
		this.shade.style.display = "block";


	if (option !== undefined && option.width !== undefined)	// modal window width
		this.window.style.width = option.width;
	else
		this.window.style.width = '';	// default


	if (option !== undefined && option.height !== undefined)	// modal window height
		this.window.style.height = option.height;
	else
		this.window.style.height = '';	// default
		

	if (option !== undefined && option.color !== undefined)	// color
		this.window.style.color = option.color;
	else
		this.window.style.color = '';


	if (option !== undefined && option.background_color !== undefined)	// background color
		this.window.style.backgroundColor = option.background_color;
	else
		this.window.style.backgroundColor = '';


	if (option !== undefined && option.must_respond === true)	// must respond (default false)
		this.must_respond = true;
	else
		this.must_respond = false;


	if (option === undefined || option.close_button === undefined || option.close_button === true) {	// close button (default true)
	
		this.close_button.style.display = 'inline-block';
		this.content.innerHTML = html_content;
	}
	else {

		this.close_button.style.display = 'none';
		this.content.innerHTML = html_content;
	}


	if (option !== undefined && typeof option.close_run === 'function')
		this.close_run = option.close_run;	// *** record the close_run (so it can be used when user click close)

}

modal_box$.prototype.close = function(option) {

	modal_box$.showing$ = false;	// for global (for compatability)
	this.showing$ = false;	// for self
	

	this.shade.style.display = 'none';
	this.window.style.display = 'none';
	this.close_button.style.display = 'none';

	
	// run anything assigned to close during this.show() (*** especially when there are some custom HTML form states to save with this.xxx)

	if (option !== undefined && option.skip_close_run === true) {
	
		this.close_run = undefined;
	}
	
	if (typeof this.close_run === 'function') {
	
		this.close_run();
		this.close_run = undefined;		// clear the close_run
	}
	
}





// MODAL BOX JAVASCRIPT (LEGACY FOR COMPATIBILITY ONLY, NO INDEPENDENT STATES)

document.body.insertAdjacentHTML('beforeend', `

	<div id="modal_window_shade" class="modal_window_shade">
	</div>

	<div id="modal_window" class="modal_window">
	<span class="modal_window_close" onclick="modal_window_close()">&times;</span><br>
	</div>

`);


var modal_window_shade = document.getElementById("modal_window_shade");
var modal_window = document.getElementById("modal_window");
var modal_window_close_button = "<span class='modal_window_close' onclick='modal_window_close()'>&times;</span><button style='display: none; position: absolute; cursor: pointer; border: none; top: 10; right: 2;'>PRO</button><br>";
var modal_window_must_respond = false;



function modal_window_close() {

	modal_window_shade.style.display = "none";
	modal_window.style.display = "none";


	if (typeof modal_window_close_run === 'function') {	// has a defined close_run
	
		modal_window_close_run();
		modal_window_close_run = undefined;
	}
}

function modal_window_show(html_content, option) {

	// *** must clear any previous unused close run defined (such as in the case modal window did not close, but just replaced by another modal_window_show calls
	// otherwise any subsequent modal_window_show will inherit the close_run, unless it is override by another option.close_run specified as parameter

	modal_window_close_run = undefined;


	modal_window.style.display = "block";


	if (option !== undefined && option.shade === false) // shade for dimming the background surrounding this modal window (default true)
		; // do nothing (no shade)
	else
		modal_window_shade.style.display = "block";


	if (option !== undefined && option.width !== undefined)	// modal window width
		modal_window.style.width = option.width;
	else
		modal_window.style.width = '';	// default


	if (option !== undefined && option.height !== undefined)	// modal window height
		modal_window.style.height = option.height;
	else
		modal_window.style.height = '';	// default


	if (option !== undefined && option.color !== undefined)	// color
		modal_window.style.color = option.color;
	else
		modal_window.style.color = '';


	if (option !== undefined && option.background_color !== undefined)	// background color
		modal_window.style.backgroundColor = option.background_color;
	else
		modal_window.style.backgroundColor = '';


	if (option !== undefined && option.must_respond === true)	// must respond (default false)
		modal_window_must_respond = true;
	else
		modal_window_must_respond = false;


	if (option !== undefined && typeof option.close_run === 'function')	// user defined to run anything after close
		modal_window_close_run = option.close_run;


	if (option === undefined || option.close_button === undefined || option.close_button === true)	// exit button (default true)
		modal_window.innerHTML = modal_window_close_button + html_content;
	else
		modal_window.innerHTML = html_content;

}

window.onclick = function(event) {

	if (event.target === modal_window_shade && modal_window_must_respond === false) {

		modal_window_close();			
	}
}