// SHARE PUZZLE

var direct_link_copied_modal = new modal_box$({z_index: 1});

Game.prototype.share_menu = function() {	// share the end game puzzle at the default 48th position
	
	var play_line = this.output(48);
	var direct_link = 'https://savvyopen.com/othello?play=' + play_line;
	direct_link = encodeURIComponent(direct_link);
	
	modal_window_show(`
	
		<center>
		<b>Share This Puzzle ...</b>
		<br><br><br>
		<button><a href="https://www.facebook.com/sharer/sharer.php?u=${direct_link}" target="_blank" rel="noopener noreferrer">Facebook</a></button>
		<button><a href="https://twitter.com/intent/tweet?text=Check%20out%20this%20mind-bending%20Othello%20endgame%20puzzle&url=${direct_link}" target="_blank" rel="noopener noreferrer">X <span style='font-size: 15px;'>(Twitter)</span></a></button>
		<br><br><br>
		<button><a href="https://www.linkedin.com/feed/?shareActive=true&shareUrl=${direct_link}" target="_blank" rel="noopener noreferrer">LinkedIn</a></button>
		<button><a href="https://wa.me/?text=Check%20out%20this%20mind-bending%20Othello%20endgame%20puzzle%3A%20${direct_link}" target="_blank" rel="noopener noreferrer">WhatsApp</a></button>
		<br><br><br>

		<div id='direct_link_copy' style='background-color: #d0d0d0; padding: 8px; cursor: pointer;'>
		Copy Direct Link (DIY)
		</div>
		</center>
		
	`, {must_respond: true});
	
	
	
	var direct_link_copy = document.getElementById('direct_link_copy');
	direct_link_copy.onclick = function() {
		
		navigator.clipboard.writeText('https://savvyopen.com/othello?play=' + play_line);
		direct_link_copied_modal.show("<center>Link Copied To Clipboard<br><br><br></center>",{width: "250px"});
	}
}