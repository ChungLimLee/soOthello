/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// GAME MOVE

var [_up, _down, _left, _right] = [-1, 1, -1, 1];

// directions here are reversed by design, [result, 1 = down_right, 2 = down, 3 = down_left, 4 = right, 5 = Unused, 6 = left, 7 = up_right, 8 = up, 9 = up_left] 
var [result, down_right, down, down_left, right, , left, up_right, up, up_left] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

Game.prototype.move = function(disk_id) {	// for interaction game play with display

	var row = Number(disk_id.split('_')[1]);
	var column = Number(disk_id.split('_')[2]);
	var result = 0;

	var valid_move_list = this.valid_move(this.turn, row, column);

	if (valid_move_list[result]) {

		this.change = this.change.slice(0, this.nth_move + 1);	// remove extra redos after commit move
		this.nth_move += 1;

		if (valid_move_list[down]) this.flip_disk(this.turn, row, column, _down, 0);
		if (valid_move_list[up]) this.flip_disk(this.turn, row, column, _up, 0);
		if (valid_move_list[left]) this.flip_disk(this.turn, row, column, 0, _left);
		if (valid_move_list[right]) this.flip_disk(this.turn, row, column, 0, _right);
		if (valid_move_list[down_left]) this.flip_disk(this.turn, row, column, _down, _left);
		if (valid_move_list[down_right]) this.flip_disk(this.turn, row, column, _down, _right);
		if (valid_move_list[up_left]) this.flip_disk(this.turn, row, column, _up, _left);
		if (valid_move_list[up_right]) this.flip_disk(this.turn, row, column, _up, _right);

		this.set_disk(row, column, this.turn);	// Must change this last for this.flip_disk to work properly

		this.turn = this.next_turn();
		this.highlight_valid_move(this.turn);
		this.highlight_last_move();
		this.status();		
	}
}

Game.prototype._move = function(row, column, valid_move_list) {		// Partial duplication of prototype.move, due to opt for optimization over code duplication, for internal use only with run_all_moves()

	this.change = this.change.slice(0, this.nth_move + 1);
	this.nth_move += 1;

	if (valid_move_list[down]) this._flip_disk(this.turn, row, column, _down, 0);
	if (valid_move_list[up]) this._flip_disk(this.turn, row, column, _up, 0);
	if (valid_move_list[left]) this._flip_disk(this.turn, row, column, 0, _left);
	if (valid_move_list[right]) this._flip_disk(this.turn, row, column, 0, _right);
	if (valid_move_list[down_left]) this._flip_disk(this.turn, row, column, _down, _left);
	if (valid_move_list[down_right]) this._flip_disk(this.turn, row, column, _down, _right);
	if (valid_move_list[up_left]) this._flip_disk(this.turn, row, column, _up, _left);
	if (valid_move_list[up_right]) this._flip_disk(this.turn, row, column, _up, _right);

	this._set_disk(row, column, this.turn);	// Must change this last for this.flip_disk to work properly
}

Game.prototype.flip_disk = function(disk_turn, row, column, row_direction, column_direction) {	// Use only after validation, commit the change by flipping all the disk(s) associate with the current move

	while (true) {

		row += row_direction;
		column += column_direction;

		if (this.data[row * this.size + column] === disk_turn)
			break;

		this.set_disk(row, column, disk_turn);
	}
}

Game.prototype._flip_disk = function(disk_turn, row, column, row_direction, column_direction) {	// Use only after validation, commit the change by flipping all the disk(s) associate with the current move

	while (true) {

		row += row_direction;
		column += column_direction;

		if (this.data[row * this.size + column] === disk_turn)
			break;

		this._set_disk(row, column, disk_turn);
	}
}

Game.prototype.add_empty = function(index) {

	this.empty.push(index);
}

Game.prototype.take_empty = function(index) {

	var new_empty_list = [];
	
	for (var n = 0; n < this.empty.length; n++) {
	
		if (this.empty[n] !== index)
			new_empty_list.push(this.empty[n]);
	}

	this.empty = new_empty_list;
}

Game.prototype.set_disk = function(row, column, new_colour, mode) {

	var index = row * this.size + column;
	var current_colour = this.data[index];

	this.data[index] = new_colour;	

	if (new_colour === 'empty')
		this.add_empty(index);
	else
		this.take_empty(index);

	this.disk[current_colour] -= 1;
	this.disk[new_colour] += 1;

	this.board.set_disk(row, column, new_colour);
	
	if (mode === undefined)
		this.track(row, column, current_colour, new_colour, 'move');
}

Game.prototype._set_disk = function(row, column, new_colour) {

	var index = row * this.size + column;
	var current_colour = this.data[index];

	this.data[index] = new_colour;

	this.take_empty(index);	// this is only use by _move and will only take empty space, so no need to add_empty
	
	this.disk[current_colour] -= 1;
	this.disk[new_colour] += 1;

	this.track(row, column, current_colour, new_colour, 'move');
}

Game.prototype._set_disk_for_undo = function(row, column, new_colour) {

	var index = row * this.size + column;
	var current_colour = this.data[index];

	this.data[index] = new_colour;

	if (new_colour === 'empty')		// use by _undo only and will only add empty, never take empty
		this.add_empty(index);

	this.disk[current_colour] -= 1;
	this.disk[new_colour] += 1;
}





// HIGHLIGHT LAST MOVE

Game.prototype.highlight_last_move = function() {

	if (this.last_move !== undefined)
		this.board.set_disk_container(this.last_move[0], this.last_move[1], null);

	if (this.nth_move > 0) {
	
		var last_change = game.change[this.nth_move];
		this.last_move = last_change[last_change.length - 1];
		
		this.board.set_disk_container(this.last_move[0], this.last_move[1], '#ffff00');
	}
}





// PLAYER'S TURN CONTROL IN GAME AND ITS RELATED

Game.prototype.next_turn = function() {

	var result;

	if (this.move_list(this.opponent(this.turn)).length > 0)
		result = this.opponent(this.turn);

	else if (this.move_list(this.turn).length === 0) {

		result = 'no more turn';
		this.set_game_mode('review');
		
		
		
		if (this.disk.black === this.disk.white)
			var modal_result = 'Draw Game';
			
		else if (this.disk.black > this.disk.white)
			var modal_result = 'Black Wins';
			
		else
			var modal_result = 'White Wins';


			
		modal_window_show(`

			<center style='padding: 0px 15px 30px 15px;'>
			<span style='font-size: 26px;'>${modal_result}</span>
			<br>
			<span>black: ${game.disk.black}, white: ${game.disk.white}</span>
			<br><br><br>
			<button onclick='modal_window_close(); game.input(game.output(48)); game.set_game_mode("play");'>Try Again</button>
			<button onclick='modal_window_close(); game.set_game_mode("review");'>Review Puzzle</button>
			</center>
			<br>

			<center>
			<div style='background-color: #e0e0e0; padding: 20px 15px 20px 15px;'>
			<button onclick='game.new_puzzle_confirmation();' style='color: #282828'>New<br>Puzzle</button>
			<button onclick='game.share_menu();' style='color: #282828'>Share this puzzle<br>with friends</button>
			</div>
			</center>

		`, {must_respond: true});
		
		console.log('game over');
	}
	
	else {
		result = this.turn;
		
		modal_window_show(`
		
			<center style='padding: 0px 15px 30px 15px;'>${this.opponent(this.turn)} pass</center>
		`,{
			width: '250px',
			
			close_run: function() {

				if (game.game_in_session && game.turn === 'white')	// AI only plays during game in session when black pass
					game.ai_play();
					
			}
		});
		
		console.log(this.opponent(this.turn), 'pass');
	}

	return result;
}

Game.prototype.opponent = function(disk_colour) {

	if (disk_colour === 'black')
		return 'white';

	else if (disk_colour === 'white')
		return 'black';

	return undefined;
}





// VALID MOVE(S) MASTER

Game.prototype.move_list = function(colour) {
	
	if (this.disk[colour] > this.empty.length)
		return this.move_list_for_empty(colour);
	else
		return this.move_list_for_colour(colour);
}

Game.prototype.valid_move = function(disk_colour, row, column) {

	return this.valid_move_for_empty(disk_colour, row, column);
}





// VALID MOVE(S) FOR COLOUR

Game.prototype.move_list_for_colour = function(colour) {	// list of all possible moves based on the current disk's turn

	var [up, down, left, right] = [-1, 1, -1, 1];
	var list;
	var move_list = [];
	var temp_record = [];
	var list_row, list_column, list_direction;



	for (var row = 0; row < this.size; row++) {
	
		for (var column = 0; column < this.size; column++) {

			if (this.data[row * this.size + column] === colour) {
			
				list = this.valid_move_for_colour(colour, row, column);
				
				if (list.length !== 0) {
				
					for (var n = 0; n < list.length; n++) {

						list_row = list[n][0];
						list_column = list[n][1];
						list_row_direction = list[n][2] + 1;	// Adjust -1 to 1 --> 0 to 2 for easier array storage purposes
						list_column_direction = list[n][3] + 1;
					
						//console.log(list, list_row, list_column, list_row_direction, list_column_direction, list_row_direction * 3 + list_column_direction + 1);

						if (temp_record[list_row] === undefined)
							temp_record[list_row] = [];
							
						if (temp_record[list_row][list_column] === undefined) {
						
							temp_record[list_row][list_column] = [true];
							move_list.push([list_row, list_column, temp_record[list_row][list_column]]);
						}
						
						// directions here are reversed by design, [result, 1 = down_right, 2 = down, 3 = down_left, 4 = right, 5 = Unused, 6 = left, 7 = up_right, 8 = up, 9 = up_left] 
						temp_record[list_row][list_column][list_row_direction * 3 + list_column_direction + 1] = true;
					}
				}
			}
		}
	}

	return move_list;
}

Game.prototype.valid_direction_for_colour = function(disk_turn, disk_row, disk_column, row_direction, column_direction) {

	var row = disk_row + row_direction;
	var column = disk_column + column_direction;

	if (row >= 0 && row < this.size && column >= 0 && column < this.size) {	// within board's range

		if (this.data[row * this.size + column] !== this.opponent(disk_turn) )
			return false;
	}
	else	// outside board range
		return false;

	while(true) {

		row += row_direction;
		column += column_direction;

		// Must use extra bracket to work properly??
		if ( (row >= 0 && row < this.size && column >= 0 && column < this.size) === false)	// outside board range
			return false;

		if (this.data[row * this.size + column] === disk_turn)
			return false;

		if (this.data[row * this.size + column] === 'empty')
			return [row, column, row_direction, column_direction];
	}

	return false;
}

Game.prototype.valid_move_for_colour = function(disk_colour, row, column) {

	var [up, down, left, right] = [-1, 1, -1, 1];
	var _down, _up, _left, _right, _down_left, _down_right, _up_left, _up_right;
	var result = [];

	_down =		this.valid_direction_for_colour(disk_colour, row, column, down, 0);
	_up = 		this.valid_direction_for_colour(disk_colour, row, column, up, 0);
	_left =		this.valid_direction_for_colour(disk_colour, row, column, 0, left);
	_right = 	this.valid_direction_for_colour(disk_colour, row, column, 0, right);
	_down_left = 	this.valid_direction_for_colour(disk_colour, row, column, down, left);
	_down_right = 	this.valid_direction_for_colour(disk_colour, row, column, down, right);
	_up_left = 	this.valid_direction_for_colour(disk_colour, row, column, up, left);
	_up_right = 	this.valid_direction_for_colour(disk_colour, row, column, up, right);	

	if (_down !== false) result.push(_down);
	if (_up !== false) result.push(_up);
	if (_left !== false) result.push(_left);
	if (_right !== false) result.push(_right);
	if (_down_left !== false) result.push(_down_left);
	if (_down_right !== false) result.push(_down_right);
	if (_up_left !== false) result.push(_up_left);
	if (_up_right !== false) result.push(_up_right);
	
	return result;
}





// VALID MOVE(S) FOR EMPTY

Game.prototype.move_list_for_empty = function(colour) {	// list of all possible moves based on the current disk's turn

	var [up, down, left, right] = [-1, 1, -1, 1];
	var result = [];
	var list;
	var row, column;

	for (var n = 0; n < this.empty.length; n++) {

		row = ~~(this.empty[n] / this.size);		// will be slightly faster with direct reference instead of assignment
		column = this.empty[n] % this.size;

		list = this.valid_move_for_empty(colour, row, column);

		if (list[0])
			result.push([row, column, list]);
	}
	
	return result;
}

Game.prototype.valid_direction_for_empty = function(disk_turn, disk_row, disk_column, row_direction, column_direction) {

	// this is here, because human interface requires this to check, not computer play
	
	if (this.data[disk_row * this.size + disk_column] !== 'empty') // must use disk_row and disk_column, not after applying direction
		return false;

	var row = disk_row + row_direction;
	var column = disk_column + column_direction;

	if (row >= 0 && row < this.size && column >= 0 && column < this.size) {

		if (this.data[row * this.size + column] !== this.opponent(disk_turn) )
			return false;
	}
	else
		return false;

	while(true) {

		row += row_direction;
		column += column_direction;

		// Must use extra bracket to work properly??
		if ( (row >= 0 && row < this.size && column >= 0 && column < this.size) === false)
			return false;

		if (this.data[row * this.size + column] === disk_turn)
			return true;

		if (this.data[row * this.size + column] === 'empty')
			return false;
	}

	return false;
}

Game.prototype.valid_move_for_empty = function(disk_colour, row, column) {

	var [up, down, left, right] = [-1, 1, -1, 1];
	var _down, _up, _left, _right, _down_left, _down_right, _up_left, _up_right;
	var result;

	_down =		this.valid_direction_for_empty(disk_colour, row, column, down, 0);
	_up = 		this.valid_direction_for_empty(disk_colour, row, column, up, 0);
	_left =		this.valid_direction_for_empty(disk_colour, row, column, 0, left);
	_right = 	this.valid_direction_for_empty(disk_colour, row, column, 0, right);
	_down_left = 	this.valid_direction_for_empty(disk_colour, row, column, down, left);
	_down_right = 	this.valid_direction_for_empty(disk_colour, row, column, down, right);
	_up_left = 	this.valid_direction_for_empty(disk_colour, row, column, up, left);
	_up_right = 	this.valid_direction_for_empty(disk_colour, row, column, up, right);	

	// directions here are designed to be compatible with valid_move_for_colour [0 = result, 1 = down_right, 2 = down, 3 = down_left, 4 = right, 5 = Unused, 6 = left, 7 = up_right, 8 = up, 9 = up_left]
	//result = [_down, _up, _left, _right, _down_left, _down_right, _up_left, _up_right];
	result = [_down_right, _down, _down_left, _right, undefined, _left, _up_right, _up, _up_left];

	for (var has_direction of result) {

		if (has_direction)
			return [true, ...result];
			//return [true].concat(result);	// 15% slower than destructure method
	}

	return [false];
}





// HIGHTLIGHT NEXT VALID MOVE(S)

Game.prototype.highlight_valid_move = function(disk_turn) {	// highlight all possible moves based on the current disk's turn

	var new_move_list = this.move_list(disk_turn);

	for (var [row, column] of this.previous_move_list) {

		this.board.set_disk_container(row, column, null);
	}

	for (var [row, column] of new_move_list) {

		if (disk_turn === 'black')
			this.board.set_disk_container(row, column, '#555555', 'highlight valid move');
		else
			this.board.set_disk_container(row, column, '#cccccc', 'highlight valid move');
	}

	this.previous_move_list = [...new_move_list];
}





// UNDO OR REDO MOVES

window.addEventListener("keyup", function(event) {

	if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {

		if (event.key === 'ArrowLeft') {

			game.undo();
			event.preventDefault();
		}

		if (event.key === 'ArrowRight') {

			game.redo();
			event.preventDefault();
		}
	}
});

Game.prototype.track = function(row, column, before_colour, new_colour, mode) {

	if (mode === 'move') {

		if (this.change[this.nth_move] === undefined)
			this.change[this.nth_move] = [];

		this.change[this.nth_move].push([row, column, before_colour, new_colour]);
	}
}

Game.prototype.redo = function() {

	var row, column, before_colour, after_colour;

	if (this.nth_move < this.change.length - 1) {

		this.nth_move += 1;

		for (var [row, column, before_colour, after_colour] of this.change[this.nth_move]) {

			this.set_disk(row, column, after_colour, 'redo');
		}

		this.turn = this.next_turn();	// redo, must use next_turn to determine who's turn due to possibility of a pass
		this.highlight_valid_move(this.turn);
		this.highlight_last_move();
		this.status();
	}
}

Game.prototype.undo = function() {

	var row, column, before_colour, after_colour;

	if (this.nth_move > 48) {

		for (var [row, column, before_colour, after_colour] of this.change[this.nth_move]) {

			this.set_disk(row, column, before_colour, 'undo');
		}

		this.turn = after_colour;	// determining the turn of undo, can use any disk(s) that last changed colour
		this.nth_move -= 1;

		this.highlight_last_move();
		this.highlight_valid_move(this.turn);
		this.status();
	}
}

Game.prototype._undo = function() {

	var row, column, before_colour, after_colour;

	if (this.nth_move > 0) {

		for (var [row, column, before_colour, after_colour] of this.change[this.nth_move]) {
			
			this._set_disk_for_undo(row, column, before_colour);
		}

		this.turn = after_colour;	// determining the turn of undo, can use any disk(s) that last changed colour
		this.nth_move -= 1;
	}
}
