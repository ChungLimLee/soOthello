/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// ********** GAME **********

//game({size: 4, view: 'board_view'});

function Game(size, board_element_id) {

	this.board = board_element_id;		// for the game board's view

	this.size = size;			// the size of the game board

	this.data;				// for game board's data in simple 1d-array form of ['black/white/empty', '...', '...']
	this.disk;				// tracks the black, white and empty numbers
	this.empty;				// tracks the actual empty positions
	this.optimizied_disk_check_size;		// An optimized size to check for disk between empty, black and white

	this.black;				// not in use yet, testing	
	this.white;				// not in use yet, testing

	this.turn;				// for player's turn

	this.previous_move_list = [];		// for highlight moves



	// for undos or redos

	this.nth_move;
	this.change;
}





// GAME SETUP

Game.prototype.create_data = function(size) {

	var data = [];

	for (var n = 0; n < this.size ** 2; n++) {

		data.push('empty');		
		this.add_empty(n);
	}

	return data;
}

Game.prototype.view_refresh = function() {
	
	for (var row = 0; row < this.size; row++) {

		for (var column = 0; column < this.size; column++) {		

			this.board.set_disk(row, column, this.data[row * this.size + column]);
		}
	}

	this.highlight_valid_move(this.turn);
	this.highlight_last_move();
}

Game.prototype.start = function(colour, mode) {

	this.turn = colour;

	this.disk = {'black': 0, 'white': 0, 'empty': this.size ** 2};
	this.empty = [];

	this.black = [];
	this.white = [];
	this.optimizied_disk_check_size = Math.floor((this.size ** 2 - 4) / 3);

	this.data = this.create_data();
	
	this.nth_move = 0;
	this.change = [];

	if (mode === undefined) {

		this.board.view.innerHTML = this.board.create_view();
		this.board.set_event(this);
	}

	var row = Math.floor(this.size / 2) - 1;
	var column = row;

	if (mode === undefined) {

		this.set_disk(row, column, 'white', undefined, true);
		this.set_disk(row, column + 1, 'black', undefined, true);
		this.set_disk(row + 1, column, 'black', undefined, true);
		this.set_disk(row + 1, column + 1, 'white', undefined, true);

		this.highlight_valid_move(this.turn);
	}

	else {
		this._set_disk(row, column, 'white', undefined, true);
		this._set_disk(row, column + 1, 'black', undefined, true);
		this._set_disk(row + 1, column, 'black', undefined, true);
		this._set_disk(row + 1, column + 1, 'white', undefined, true);
	}
}

Game.prototype.new_puzzle = function() {

	modal_window_show(`<center style='padding: 30px;'><b>Creating End Game Puzzle</b><br><br>This can take 1 to 10+ seconds.</center>`, {close_button: false, must_respond: true});



	var self = this;
	
	setTimeout(function() {

		var win_result;

		for (var n = 0; n < 100; n++) {

			self.start('black');
			self.random_move(48);
			
			if (self.nth_move < 48)
				continue;
		
			win_result = self.force_win_moves(self.turn);
			
			if (win_result.length === 1) {	// only choose a puzzle that has only one win solution
			
				modal_window_close();
				break;
			}
		}	

		if (win_result.length !== 1)
			modal_window_show(`<center style='padding: 30px;'><b>Unable to find a puzzle within the expected time.</b><br><br><button onclick='game.new_puzzle();'>Retry</button></center>`, {close_button: false, must_respond: true});

	}, 100);
}





// DISPLAY GAME STATUS

Game.prototype.status = function() {

	var disk_info1 = document.getElementById('disk_info1');
	var disk_info2 = document.getElementById('disk_info2');
	
	disk_info1.innerHTML = `Move(s) Made: ${this.nth_move}`;
	disk_info2.innerHTML = `Black: ${this.disk.black}, White: ${this.disk.white}`;
}
