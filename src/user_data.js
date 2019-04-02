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