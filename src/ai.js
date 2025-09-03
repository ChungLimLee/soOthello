/*
	Copyright (c) 2025 Chung Lim Lee and Savvy Open
	All rights reserved.
*/





// AI

Game.prototype.next_turn_and_next_move_list = function() {	// find out both next_turn and next_move_list together for optimization

	var opponent, next_turn, next_move_list;

	opponent = this.opponent(this.turn);
	next_move_list = this.move_list(opponent);

	if (next_move_list.length === 0) {	// when no moves for the opponent of the current player

		next_move_list = this.move_list(this.turn);

		if (next_move_list.length === 0)	// when no moves also for the current player then game ends
			return ['no more turn', [] ];

		next_turn = this.turn;
	}
	else
		next_turn = opponent;

	return [next_turn, next_move_list];
}

Game.prototype.random_move = function(number_of_times) {	// crashes when try to make move for number_of_times, but no more moves in mid-game (game that ends quickly)

	var random_select;
	var move_list = this.move_list(this.turn);
	var max_move_list_size = 0;

	if (number_of_times > this.size ** 2 - this.nth_move)	// only do as many as how many moves are available
		number_of_times = (this.size ** 2 - 4) - this.nth_move;

	for (var n = 0; n < number_of_times; n++) {

		if (move_list.length === 0)
			break;

		random_select = Math.floor(Math.random() * move_list.length);
		[row, column, list] = move_list[random_select];

		if (move_list.length > max_move_list_size)
			max_move_list_size = move_list.length;
	
		this._move(row, column, list);
		[this.turn, move_list] = this.next_turn_and_next_move_list();
	}


	this.view_refresh();
	this.status();
	
	return move_list;	// for chaining purposes and efficiency
}

Game.prototype._random_move = function(number_of_times) {	// For internal use and performance, not in use at the moment

	var random_select;
	var move_list = this.move_list(this.turn);

	if (number_of_times > this.size ** 2 - this.nth_move)	// only do as many as how many moves are available
		number_of_times = (this.size ** 2 - 4) - this.nth_move;

	for (var n = 0; n < number_of_times; n++) {

		if (move_list.length === 0)
			break;
			
		random_select = Math.floor(Math.random() * move_list.length);
		[row, column, list] = move_list[random_select];

		this._move(row, column, list);
		[this.turn, move_list] = this.next_turn_and_next_move_list();
	}
}





// Force Win

Game.prototype.force_win_moves = function() {	// No need to specific colour, because a player's turn is to be determined

	var initial_change_stack = Array.from(this.change);
	
	var row, column, list;
	var current_turn = this.turn;
	var move_list = this.move_list(current_turn);
	var result = [];

	for (var [row, column, list] of move_list) {

		this._move(row, column, list);
		[this.turn, move_list] = this.next_turn_and_next_move_list();
		
		if (this.force_win(current_turn) ) {	// current_turn here is necessary to track the correct colour for sure win
		
			result.push([row, column]);
		}

		this._undo();
	}

	this.change = initial_change_stack;	// *** restore the "original change stack" back to prior using this function	
	return result;
}

Game.prototype.force_win = function(colour) {	// *** focus on finding win moves and ignore all draws (faster by 30% to 100%+, odd cases slightly slower)

	var initial_change_stack = Array.from(this.change);
	
	var keep_checking = true;
	var opponent = this.opponent(colour);

	var final_answer = this._force_win(colour, opponent, this.move_list(this.turn), keep_checking);
	this.change = initial_change_stack;	// *** restore the "original change stack" back to prior using this function	

	return final_answer;
}

Game.prototype._force_win = function(colour, opponent, _move_list, keep_checking) {

	var move_list = _move_list;
	var next_move_list;
	var win_count = 0;	// the winning count per nth-move level

	if (move_list.length === 0) {	// if no move for current player then it is end of game
	
		if (this.disk[colour] > this.disk[opponent]) {
						
			return true;
		}
		
		return false;
	}



	var row, column, list;
	var hash;
	
	for (var entry of move_list) {		// run through all available move(s) at this turn

		row = entry[0];
		column = entry[1];
		list = entry[2];
		
		this._move(row, column, list);
		[this.turn, next_move_list] = this.next_turn_and_next_move_list();

		var answer = this._force_win(colour, opponent, next_move_list, keep_checking);
		this._undo();
		

		
		if (keep_checking === false)	// Exit at the earliest when no need to check anymore
			return false;
			
		if (answer === true) {
		
			if (this.turn === colour)	// For colour turn, only need one solution is true
				return true;
				
			win_count += 1;
		}

		else if (this.turn === opponent) {	// For opponent turn, exit immediately when any one solution is false

			keep_checking = false;
			return false;
		}
	}
	
	if (win_count === move_list.length)	// For opponent turn, when all solutions are true
		return true;
			
	keep_checking = false;	// For colour turn, which can't even find one solution is true
	return false;
}





// SURE WIN

Game.prototype.sure_win = function(colour) {	// When result is true, the game count is the number of ways for the entire path
												// When result is false, the game count is just the number of ways to found out that 'one false' and stop counting

	var initial_change_stack = Array.from(this.change);

	var game_checked = [0];		// Minimum game checked to found out sure win or not
	var time_start = Date.now();

	if (this.turn === 'no more turn') {
		
		if (colour === 'black')
			return [this.disk.black > this.disk.white, 0, 0];
		
		if (colour === 'white')
			return [this.disk.white > this.disk.black, 0, 0];		
	}

	var result = [true];
	this._sure_win(game_checked, this.move_list(this.turn), colour, result);

	this.change = initial_change_stack;	// *** restore the "original change stack" back to prior using this function	
	return [result[0], game_checked[0], (Date.now() - time_start) / 1000];
}

Game.prototype._sure_win = function(game_checked, _move_list, colour, result) {

	var move_list = _move_list;
	var next_move_list;
	var opponent;
	var temp_result;

	if (result[0] === false)	// Exit all childs immediately when any one result is false
		return;
		
	if (move_list.length === 0) {	// if no move for current player then return?

		game_checked[0] += 1;

		if (this.disk[colour] > this.disk[this.opponent(colour)] )	// Just need to check if all bottoms of the tree are true for sure win			
			return true;

		return false;
	}

	for (var [row, column, list] of move_list) {		// run through all available move(s) at this turn

		this._move(row, column, list);
		[this.turn, next_move_list] = this.next_turn_and_next_move_list();

		temp_result = this._sure_win(game_checked, next_move_list, colour, result);	// before coming back to this loop, recursively run any subsequent moves at next turn

		if (temp_result !== undefined)	// no moves does not mean result is false?
			result[0] = temp_result;

		this._undo();
	}
}





// SOLVE GAME

Game.prototype.solve_all = function() {

	var initial_change_stack = Array.from(this.change);
	
	var current_turn = this.turn;
	var opponent = this.opponent(current_turn);
	var move_list = this.move_list(current_turn);
	
	var result = [];

	for (var [row, column, list] of move_list) {

		this._move(row, column, list);
		[this.turn, move_list] = this.next_turn_and_next_move_list();
		
		// current_turn here is necessary to track the correct colour for sure win
		
		result.push([row, column, this._solve(current_turn, opponent, move_list)]);
		this._undo();
	}

	this.change = initial_change_stack;	// *** restore the "original change stack" back to prior using this function
	return result;
}

Game.prototype.solve = function() {	// *** this only show the result of either win/draw/loss (based on the current board state and the current player's turn)

	var initial_change_stack = Array.from(this.change);
	
	this.solve_from_nth_move = this.nth_move;
	var opponent = this.opponent(this.turn);

	var final_answer = this._solve(this.turn, opponent, this.move_list(this.turn));
	this.change = initial_change_stack;	// *** restore the "original change stack" back to prior using this function

	return final_answer;
}

Game.prototype._solve = function(colour, opponent, _move_list) {

	var move_list = _move_list;
	var next_move_list;

	if (move_list.length === 0) {	// if no move for current player then it is end of game
		
		if (this.disk[colour] > this.disk[opponent])	// win
			return 1;
		
		else if (this.disk[colour] === this.disk[opponent])	// draw
			return 0;
			
		else	// loss
			return -1;
		
	}



	var win_found = false;
	var draw_found = false;
	var row, column, list;
	var turn_and_moves_query, next_move_list;

	for (var entry of move_list) {		// run through all available move(s) at this turn

		row = entry[0];
		column = entry[1];
		list = entry[2];
		
		this._move(row, column, list);
		turn_and_moves_query = this.next_turn_and_next_move_list();
		
		this.turn = turn_and_moves_query[0];
		next_move_list = turn_and_moves_query[1];

		var answer = this._solve(colour, opponent, next_move_list);
		this._undo();	



		if (answer === 1) {	// win
		
			if (this.turn === colour) {
			
				if (this.nth_move !== this.solve_from_nth_move)
					return 1;
				else
					win_found = true;

			}
		}
		
		else if (answer === 0)	// draw
			draw_found = true;
		
		else if (this.turn === opponent)	// loss
			return -1;
			
	}
	


	if (win_found)
		return 1;
	else if (draw_found)
		return 0;
	
	if (this.turn === colour)
		return -1;
	else	// opponent's turn
		return 1;

}





// AI RANK/GRADE

Game.prototype.ai_container_rank = function() {

	if (this.turn === 100)	// do nothing for end of game that solves the crash issues?
		return;



	var rank = [	// At the mid stage of the game, seems better when ranking the containers with 10 at the below (against consensus)

		[100, 3, 50, 5, 5, 50, 3, 100],
		  [3, 0, 10, 10, 10, 10, 0, 3],
		[50, 10, 25, 50, 50, 25, 10, 50],
		[5, 10, 15, 25, 25, 15, 10, 5],
		[5, 10, 15, 25, 25, 15, 10, 5],
		[50, 10, 25, 50, 50, 25, 10, 50],
		  [3, 0, 10, 10, 10, 10, 0, 3],
		[100, 3, 50, 5, 5, 50, 3, 100]	
	];


	
	var original_turn = this.turn;
	var move_list = this.move_list(original_turn);

	var select_row = [move_list[0][0] ];	// temporarily select the first available candidate move
	var select_column = [move_list[0][1] ];
	var select_list = [move_list[0][2] ];
	var propose_row, propose_column, random_select;
	var row, column, list;



	for (var n = 1; n < move_list.length; n++) {	// find the largest rank among all available moves
	
		propose_row = move_list[n][0];
		propose_column = move_list[n][1];
		propose_list = move_list[n][2];
		
		if (rank[select_row[0] ][select_column[0] ] < rank[propose_row][propose_column]) {
			
			select_row[0] = propose_row;
			select_column[0] = propose_column;
			select_list[0] = propose_list;
		}
	}



	for (var n = 1; n < move_list.length; n++) {	// find any other with the same rank as the largest rank then add to the candidate list
	
		propose_row = move_list[n][0];
		propose_column = move_list[n][1];
		propose_list = move_list[n][2];
		
		if (rank[select_row[0] ][select_column[0] ] === rank[propose_row][propose_column]) {
			
			select_row.push(propose_row);
			select_column.push(propose_column);
			select_list.push(propose_list);
		}		
	}



	while(select_row.length > 0) {

		random_select = Math.floor(Math.random() * select_row.length);
		[row, column, list] = [select_row[random_select], select_column[random_select], select_list[random_select] ];

		this._move(row, column, list);
		[this.turn, move_list] = this.next_turn_and_next_move_list();



		if (select_row.length > 1)
			this._undo();
		
		if (select_row.length > 0) {
		
			var new_select_row = [];
			var new_select_column = [];
			var new_select_list = [];
			
			for (var n = 0; n < select_row.length; n++) {
			
				if (n !== random_select) {
				
					new_select_row.push(select_row[n]);
					new_select_column.push(select_column[n]);
					new_select_list.push(select_list[n]);
				}
			}
			select_row = Object.assign([], new_select_row);
			select_column = Object.assign([], new_select_column);
			select_list = Object.assign([], new_select_list);		
		}
	}



	this._undo();	// *** temporarily fix, undo the candidate move made in the back scene and move it with this.move at below, because it highlight the last move made properly

	var disk_id = 'disk_' + row + '_' + column;
	this.move(disk_id);
	
	
	
	return [row, column, move_list];	// for chaining purposes and efficiency
};





// HIGHLIGHT WIN MOVE(S)

Game.prototype.highlight_good_moves = function() {

	if (this.nth_move < 48 || this.nth_move === 60)
		return false;

	modal_window_show(`<center style='padding: 30px;'>AI Analyzing...</center>`, {close_button: false, must_respond: true});



	var self = this;
	
	setTimeout(function() {
		
		// *** this rely on move, undo and redo to clear the block(s) that this highlights
		
		var result = self.solve_all();
		var loss_count = 0;
		
		for (var move of result) {
		
			if (move[2] === 1)	// win
				self.board.set_disk_container(move[0], move[1], '#99ff99', 'highlight good move');	// win
			else if (move[2] === 0)	// draw
				self.board.set_disk_container(move[0], move[1], '#9999ff', 'highlight good move');
			else	// loss
				loss_count += 1;

		}	



		// display result
		
		if (loss_count === 0) {
		
			if (self.sure_win(game.turn)[0] === true)				
				modal_window_show(`<center style='padding: 0px 15px 30px 0px;'>Guaranteed Win for ${self.turn[0].toUpperCase()}${self.turn.slice(1)}</center>`, {background_color: '#99ff99'});
			else if (result.length > 1)
				modal_window_show(`<center style='padding: 0px 15px 30px 0px;'>All Good Moves for ${self.turn[0].toUpperCase()}${self.turn.slice(1)}</center>`);
			else
				modal_window_close();
				
		}

		else if (loss_count === result.length) {

			var opponent = self.opponent(game.turn);
			
			if (self.sure_win(opponent)[0] === true)
				modal_window_show(`<center style='padding: 0px 15px 30px 0px;'>Guaranteed Loss for ${self.turn[0].toUpperCase()}${self.turn.slice(1)}</center>`, {background_color: '#ff8888'});
			else
				modal_window_show(`<center style='padding: 0px 15px 30px 0px;'>No Win or Draw Moves</center>`);
				
		}
		
		else
			modal_window_close();

	}, 100);
}





// PLAY

var ai_modal = new modal_box$({index: 1});

Game.prototype.ai_play = function() {

	// check if AI's turn
	
	if (this.turn === 'white') {

		ai_modal.show(`
		
			<center style='padding: 20px;'>
				AI Thinking ...
			</center>
			
		`, {width: '200px', close_button: false, must_respond: true});
	


		var r = this.solve_all();
		var self = this;

		setTimeout(function() {
				
				// look for win first
				
				for (var win of r) {
				
					if (win[2] === 1) {
					
						self.move('disk_' + win[0] + '_' + win[1]);
						ai_modal.close();
						return;
					}
				}
				


				// look for draw second
				
				for (var draw of r) {
				
					if (draw[2] === 0) {
					
						self.move('disk_' + draw[0] + '_' + draw[1]);
						ai_modal.close();
						return;
					}
				}
				
				

				self.ai_container_rank();
				ai_modal.close();
				
		}, 1000);
	}
}