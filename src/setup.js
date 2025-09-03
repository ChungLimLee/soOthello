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

	modal_window_show(`<center style='padding: 30px;'><b>Creating Endgame Puzzle</b><br><br>This can take 1 to 10+ seconds.</center>`, {close_button: false, must_respond: true});



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



		if (win_result.length === 1)
			self.set_game_mode('play');
		else
			modal_window_show(`<center style='padding: 30px;'><b>Unable to find a puzzle within the expected time.</b><br><br><button onclick='game.new_puzzle();'>Retry</button></center>`, {close_button: false, must_respond: true});

	}, 100);
}

var new_puzzle_modal = new modal_box$({z_index: 1});

Game.prototype.new_puzzle_confirmation = function() {

	new_puzzle_modal.show(`

		<center style='padding: 20px;'>
		Current game will be cleared?
		<br><br>
		<button onclick='game.new_puzzle(); new_puzzle_modal.close();'>Yes</button>
		<button onclick='new_puzzle_modal.close();'>No</button>
		</center>
		
	`, {width: '270px', close_button: false, must_respond: true});
}

Game.prototype.menu = function() {

	modal_window_show(`
	
		<center style='padding: 0px 15px 30px 15px;'>
		Mode:
		<input id='play_mode' type='radio' name='game_mode' onclick='game.set_game_mode("play"); modal_window_close();' checked>Play
		<input id='review_mode' type='radio' name='game_mode' style='margin-left: 20px;' onclick='game.set_game_mode("review"); modal_window_close();'>Study
		<br><br><br>
		<button onclick='game.input(game.output(48)); modal_window_close();'>Try Again</button>
		<br><br><br>

		<button style='margin: 8px 8px 12px 12px;' onclick='game.new_puzzle_confirmation();'>New Puzzle</button>
		<button style='font-weight: bold; border-radius: 10px;' onclick='modal_window_show(game_instructions, {close_run: function() {game.menu();}});'>?</button>
		</center>

		<center>
		<div style='font-size: 15px; background-color: #cccccc; color: #555555; padding: 8px; cursor: pointer;' onclick='external_link_confirmation("https://github.com/ChungLimLee/soOthello")'>
		© 2025 Savvy Open
		</div>
		</center>
	`);
	
	if (game.game_in_session)
		document.getElementById('play_mode').checked = true;
	else
		document.getElementById('review_mode').checked = true;
		
}

Game.prototype.set_game_mode = function(mode) {

	if (mode === 'play') {

		this.game_in_session = true;
		document.body.style.backgroundColor = '';
		document.body.style.opacity = '';
	}
	
	else {
	
		this.game_in_session = false;
		document.body.style.backgroundColor = '#bbbbbb';
		document.body.style.opacity = '0.85';
	}
}





// GAME INSTRUCTIONS

var game_instructions = `

	<center>
	<div style='color: #555555; padding: 8px 15px 30px 15px;'>
	Each puzzle starts after 48 moves have been made.
	<br><br>
	Always begins with one winning move and may also have draw move(s).
	<br><br>
	Use the "Hint" button to reveal the <span style='background-color: #99ff99'>winning</span> and/or <span style='background-color: #ccccff'>draw</span> move(s).
	</div>
	</center>
`;





// DISPLAY GAME STATUS

Game.prototype.status = function() {

	var disk_info1 = document.getElementById('disk_info1');
	var disk_info2 = document.getElementById('disk_info2');
	
	disk_info1.innerHTML = `Move(s) made: ${this.nth_move}`;
	disk_info2.innerHTML = `Black: ${this.disk.black}, White: ${this.disk.white}`;
}





// GAME INPUT & OUTPUT

Game.prototype.move_incoming_translation = {a:0, b:1, c:2, d:3, e:4, f:5, g:6, h:7}
Game.prototype.move_outgoing_translation = {0:'a', 1:'b', 2:'c', 3:'d', 4:'e', 5:'f', 6:'g', 7:'h'}

Game.prototype.input = function(play_line) {	// for user input play line with get method via URL

	play_line = play_line.replaceAll(',', '');

	if (play_line.length % 2 !== 0 || play_line.length < 96 || play_line.length > 120)	// only accept range 48 to 60 moves play line
		return false;

	game.start('black');



	// process the play line
	
	var move, row, column;
	
	for (var n = 0; n < play_line.length; n = n + 2) {
	
		move = play_line.slice(n, n + 2);
		row = String(Number(move[1]) - 1);
		column = String(this.move_incoming_translation[move[0]]);
		
		if (this.valid_move(this.turn, Number(row), Number(column))[0] === true)
			this.move('disk_' + row + '_' + column);
		else
			return false;	// input fail

	}

	return true;	// input successful
}

Game.prototype.output = function(up_to_nth_move) {	// output the current play line

	if (up_to_nth_move === undefined)
		var change = this.change.length;
	else
		var change = up_to_nth_move + 1;



	var play_line = '';
	var disk_change_list, last_entry, row, column;
		
	for (var n = 1; n < change; n++) {
	
		disk_change_list = this.change[n];
		last_entry = disk_change_list[disk_change_list.length - 1];

		row = this.move_outgoing_translation[last_entry[1]];
		column = String(last_entry[0] + 1);
		
		play_line += row + column;
	}
	
	return play_line;
}