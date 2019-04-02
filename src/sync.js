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