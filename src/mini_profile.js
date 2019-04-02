class Multiple_Post_Counts_Mini_Profile {

	static init(){
		this.using_custom = false;
		this.add_to_mini_profiles();
		yootil.event.after_search(this.add_to_mini_profiles, this);
	}

	static add_to_mini_profiles(){
		let $mini_profiles = yootil.get.mini_profiles();

		if(!$mini_profiles.length || $mini_profiles.find(".multiple-post-counts").length){
			return;
		}

		$mini_profiles.each((index, item) => {
			let $mini_profile = $(item);
			let $elem = $mini_profile.find(".multiple-post-counts");
			let $user_link = $mini_profile.find("a.user-link[href*='user/']");
			let $info = $mini_profile.find(".info");

			if(!$elem.length && !$info.length){
				console.warn("Multiple Post Counts: No info element found.");
				return;
			}

			if($user_link.length){
				let user_id_match = $user_link.attr("href").match(/\/user\/(\d+)\/?/i);

				if(!user_id_match || !parseInt(user_id_match[1], 10)){
					console.warn("Multiple Post Counts: No info element found.");
					return;
				}

				Multiple_Post_Counts.api.refresh_all_data();

				let user_id = parseInt(user_id_match[1], 10);
				let using_info = false;

				if($elem.length){
					this.using_custom = true;
				} else {
					using_info = true;
					$elem = $("<div class='multiple-post-counts'></div>");
				}

				let counts = Multiple_Post_Counts_Utils.get_post_counts();
				let html = "";
				let data = Multiple_Post_Counts.api.get(user_id).data();

				if(data != null){
					for(let i = 0; i < counts.length; ++ i){
						let amount = 0;

						if(data[counts[i].unique_id] != null){
							amount = yootil.html_encode(yootil.number_format(parseInt(data[counts[i].unique_id], 10) || 0));
						}

						html += "<span class='multiple-post-counts-count-" + counts[i].unique_id + "'>" + counts[i].name + ": <span>" + amount + "</span></span><br />";
					}
				}

				$elem.html(html);

				if(using_info){
					$info.prepend($elem);
				}

				$elem.show();
			} else {
				console.warn("Multiple Post Counts: Could not find user link.");
			}

		});
	}

};