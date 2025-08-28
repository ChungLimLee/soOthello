/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// BOARD VIEW

function Board(size, view) {

	this.size = size;
	this.view = document.getElementById(view);
}

Board.prototype.create_view = function() {

	var html = '';
	var disk_id;

	for (var row = 0; row < this.size; row++) {

		for (var column = 0; column < this.size; column++) {		

			disk_id = 'disk_' + String(row) + '_' + String(column);
			html += `<div id="${disk_id}" class="disk_container"></div>`;
		}
	}

	this.view.style.gridTemplateRows = 'auto '.repeat(this.size);
	this.view.style.gridTemplateColumns = 'auto '.repeat(this.size);

	return html;
}

Board.prototype.set_event = function(game) {

	for (var row = 0; row < this.size; row++) {

		for (var column = 0; column < this.size; column++) {		

			let disk_id = 'disk_' + String(row) + '_' + String(column);	// must use let to capture all instances of disk_id, not just the last

			document.getElementById(disk_id).onclick = function() {

				game.move(disk_id);
			}
		}
	}
}

Board.prototype.set_disk = function(row, column, colour, mode) {

	var disk_id = 'disk_' + String(row) + '_' + String(column);

	document.getElementById(disk_id).innerHTML = `<div class="${colour}_disk"></div>`;
}

Board.prototype.set_disk_container = function(row, column, colour, mode) {

	var disk_id = 'disk_' + String(row) + '_' + String(column);

	var disk = document.getElementById(disk_id);
	
	disk.style.backgroundColor = colour;
	
	if (mode === undefined)
		disk.className = 'disk_container';
	else if (mode === 'highlight valid move')
		disk.className = 'highlight_valid_move';
	else
		disk.className = 'highlight_good_move';
		
}