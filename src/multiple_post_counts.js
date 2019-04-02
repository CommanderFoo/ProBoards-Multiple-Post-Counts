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

		if((yootil.location.posting() || yootil.location.thread())){
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