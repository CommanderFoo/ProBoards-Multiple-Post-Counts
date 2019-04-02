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