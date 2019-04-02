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