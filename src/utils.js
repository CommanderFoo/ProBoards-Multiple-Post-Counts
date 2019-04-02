class Multiple_Post_Counts_Utils {

	static get_post_counts_for_board(map = false){
		let board_id = parseInt(yootil.page.board.id(), 10);
		let counts = (map)? new Map() : [];

		if(board_id){
			let pcs = Multiple_Post_Counts.SETTINGS.post_counts;

			for(let i = 0; i < pcs.length; ++ i){
				if($.inArrayLoose(board_id, pcs[i].boards) > -1){
					(map)? counts.set(pcs[i].unique_id, 0) : counts.push(pcs[i]);
				}
			}
		}

		return counts;
	}

	static get_post_counts(){
		return Multiple_Post_Counts.SETTINGS.post_counts;
	}
}