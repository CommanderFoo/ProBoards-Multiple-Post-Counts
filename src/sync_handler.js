class Multiple_Post_Counts_Sync_Handler {

	static change(new_data, old_data){
		this._new_data = new_data;
		this._old_data = old_data;

		Multiple_Post_Counts.api.set(yootil.user.id()).data(this._new_data);

		$(this.ready.bind(this));
	}

	static ready(){
		this.update_mini_profile();
	}

	static update_mini_profile(){
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(location_check){
			let user_id = yootil.user.id();
			let $mini_profiles = yootil.get.mini_profiles(user_id);

			if($mini_profiles.length){
				let $elems = $mini_profiles.find(".multiple-post-counts");

				if($elems.length){
					let counts = Multiple_Post_Counts_Utils.get_post_counts();
					let data = Multiple_Post_Counts.api.get(user_id).data();

					if(data != null){
						for(let i = 0; i < counts.length; ++ i){
							let amount = 0;

							if(data[counts[i].unique_id] != null){
								amount = yootil.html_encode(yootil.number_format(parseInt(data[counts[i].unique_id], 10) || 0));
							}

							$elems.find(".multiple-post-counts-count-" + counts[i].unique_id + " span").text(amount);
						}
					}
				}
			}
		}
	}

	static get old_data(){
		return this._old_data;
	}

	static get new_data(){
		return this._new_data;
	}

};