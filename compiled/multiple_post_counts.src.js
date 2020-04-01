class Multiple_Post_Counts {

	static init(){
		if(typeof yootil == "undefined"){
			console.error("Multiple Post Counts: Yootil not installed");
			return;
		}

		this.ID = "pd_mulitple_post_counts";
		this.KEY = "pd_post_counts";

		this.SETTINGS = null;
		this.PLUGIN = null;

		this.KEY_DATA = new Map();

		this.setup();
		this.setup_data();

		this.api.init();

		$(this.ready.bind(this));
	}

	static ready(){
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(location_check){
			Multiple_Post_Counts_Mini_Profile.init();
		}

		if((yootil.location.posting() || yootil.location.thread()) && yootil.user.logged_in()){
			Multiple_Post_Counts_Post.init();
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.ID);

		if(plugin && plugin.settings){
			this.PLUGIN = plugin;
			this.SETTINGS = plugin.settings;
		}
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.KEY];

		for(let key in user_data){
			let id = parseInt(key, 10) || 0;

			if(id && !this.KEY_DATA.has(id)){
				let value = (!user_data[key])? {} : user_data[key];

				this.KEY_DATA.set(id, new Multiple_Post_Counts_User_Data(id, value));
			}
		}
	}

}

class Multiple_Post_Counts_User_Data {

	constructor(user_id = 0, data = {}){
		this._id = user_id;
		this._DATA = data;
	}

	save(callback = null){
		yootil.key.set(Multiple_Post_Counts.KEY, this._DATA, this._id, callback);
	}

	clear(key = ""){
		this._DATA = {};
	}

	get_data(){
		return this._DATA;
	}

	set_data(data = {}){
		this._DATA = data;
	}

}

class Multiple_Post_Counts_Post {

	static init(){
		this._count_added = 0;
		this._submitted = false;
		this._hook = (yootil.location.posting_thread())? "thread_new" : ((yootil.location.thread())? "post_quick_reply" : "post_new");
		this._counts = Multiple_Post_Counts_Utils.get_post_counts_for_board(true);

		let $the_form = yootil.form.any_posting();

		if($the_form.length){
			$the_form.on("submit", () => {
				this._submitted = true;
				this.set_on();
			});
		}
	}

	static set_on(){
		if(!yootil.location.editing()){
			let user_id = yootil.user.id();

			if(this._submitted){
				if(this._count_added){
					Multiple_Post_Counts.api.decrease(user_id).count(1, this._counts);
				}

				this._count_added = 1;

				Multiple_Post_Counts.api.cleanup(user_id);
				Multiple_Post_Counts.api.increase(user_id).count(1, this._counts);
				yootil.key.set_on(Multiple_Post_Counts.KEY, Multiple_Post_Counts.api.get(user_id).data(), user_id, this._hook);
				Multiple_Post_Counts.api.sync(yootil.user.id());
			}
		}
	}

}

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

Multiple_Post_Counts.api = class {

	static init(){
		let data = (yootil.user.logged_in())? this.get(yootil.user.id()).data() : {};

		this._sync = new Multiple_Post_Counts_Sync(data, Multiple_Post_Counts_Sync_Handler);
	}

	static data(user_id = 0){
		let id = parseInt(user_id, 10);

		if(id > 0){
			if(!Multiple_Post_Counts.KEY_DATA.has(id)){
				Multiple_Post_Counts.KEY_DATA.set(id, new Multiple_Post_Counts_User_Data(id, {}));
			}

			return Multiple_Post_Counts.KEY_DATA.get(id);
		}

		return null;
	}

	static clear(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			data(){
				user_data.set_data({});
			}

		};
	}

	static get(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			data(){
				return user_data.get_data();
			}

		};
	}

	static set(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			data(data){
				user_data._DATA = data;
			}

		};
	}

	static cleanup(user_id = 0){
		let user_data = this.get(user_id).data();

		if(!user_data){
			return;
		}

		let valid = Multiple_Post_Counts_Utils.get_post_counts();
		let keys = {};

		for(let i = 0; i < valid.length; ++ i){
			keys[valid[i].unique_id] = valid[i].unique_id;
		}

		for(let key in user_data){
			if(keys[key] == null){
				delete user_data[key];
			}
		}

		this.set(user_id).data(user_data);
	}

	static increase(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			count(amount = 0, counts){
				if(counts == null || counts.size == 0){
					return;
				}

				let data = user_data.get_data() || {};

				for(let entry of counts.entries()){
					let current = 0;

					if(data[entry[0]] != null){
						current = parseInt(data[entry[0]], 10) || 0;
					} else {
						data[entry[0]] = 0;
					}

					data[entry[0]] = parseInt(current, 10) + amount;
				}

				return user_data.set_data(data);
			}

		};
	}

	static decrease(user_id = 0){
		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		return {

			count(amount = 0, counts){
				if(counts == null || counts.size == 0){
					return;
				}

				let data = user_data.get_data() || {};

				for(let entry of counts.entries()){
					let current = 0;

					if(data[entry[0]] != null){
						current = parseInt(data[entry[0]], 10) || 0;
					} else {
						data[entry[0]] = 0;
					}

					data[entry[0]] = (current > 0)? (current - amount) : 0;
				}

				return user_data.set_data(data);
			}

		};
	}

	static save(user_id = 0, callback = null){
		let user_data = this.data(user_id);

		if(user_data){
			user_data.save(callback);

			return true;
		}

		return false;
	}

	static refresh_all_data(){
		Multiple_Post_Counts.setup_data();
	}

	static clear_all_data(){
		Multiple_Post_Counts.KEY_DATA.clear();
	}

	static sync(user_id){
		if(user_id != yootil.user.id()){
			return;
		}

		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		this._sync.update(user_data.get_data());
	}

};

class Multiple_Post_Counts_Sync {

	constructor(data = {}, handler = null){
		if(!handler || typeof handler.change == "undefined"){
			return;
		}

		this._trigger_caller = false;
		this._handler = handler;
		this._key = "multiple_post_counts_data_sync_" + yootil.user.id();

		// Need to set the storage off the bat

		yootil.storage.set(this._key, data, true, true);

		// Delay adding event (IE issues yet again)

		setTimeout(() => $(window).on("storage", (evt) => {
			if(evt && evt.originalEvent && evt.originalEvent.key == this._key){

				// IE fix

				if(this._trigger_caller){
					this._trigger_caller = false;
					return;
				}

				let event = evt.originalEvent;
				let old_data = event.oldValue;
				let new_data = event.newValue;

				// If old == new, don't do anything

				if(old_data != new_data){
					this._handler.change(JSON.parse(new_data), JSON.parse(old_data));
				}
			}
		}), 100);
	}

	// For outside calls to trigger a manual update

	update(data = {}){
		this._trigger_caller = true;
		yootil.storage.set(this._key, data, true, true);
	}

	get key(){
		return this._key;
	}

};

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

Multiple_Post_Counts.init();