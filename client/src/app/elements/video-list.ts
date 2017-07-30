import {inject} from 'aurelia-framework';
import {FnTs} from '../models/FnTs';

@inject(FnTs)
export class VideoList {

	app_events: any;
	visibility: any = {
		main: {display: 'show', header: 'Video Groups'},
		groups: {display: 'hide', header: ''}
	};
	nav: any = {index: 0, list: null, playlist: false};
	view_header: string = 'Video Groups';
	master_list: any = [];
	selected_groups: any = [];
	visible_group: any = {};
	selected_filter_groups: any = [];
	show_delete_vid_folder: string = 'hide';
	show_delete_group: string = 'hide';
	group_reload: boolean = false;

	constructor(private fn: FnTs) {
		this.getMasterList();
	}

	attached() {
		this.app_events = this.fn.mq.Subscribe((event: any) => {
			if (event.target != null && event.target != 'video-list') { return; }
			if (this[event.event_name] != null) { this[event.event_name](event.data); }
		});
	}

	detached() {
		this.app_events.dispose();
	}

	getMasterList = (): Promise<any> => {
		return new Promise((res, err) => {
			this.fn.fn_Ajax({ url: '/api/videos/groups' })
				.then((data) => {
					this.master_list = data;
					res(data);
				})
				.catch((ex) => {
					err(ex);
				});
		});
	}

	clickAddGroup = () => {
		this.fn.mq.SendMessage({
			event_name: 'showModal',
			data: {
				modal: 'add_playlist',
				content: {
					title: 'Add Video Group',
					name: ''
				},
				reply_target: 'video-list'
			}
		});
	}

	addGroup = (name: any) => {
		var req = {
			url: '/api/videos/groups',
			type: 'POST',
			data: {new_group: name}
		}
		this.fn.fn_Ajax(req)
			.then((data) => {
				this.master_list.push({name: name, filter_groups: []});
			});
	}

	clickBack = () => {
		if (this.visibility.main.display == 'hide') {
			this.visibility.main.display = 'show';
			this.visibility.groups.display = 'hide';
		}
	}

	clickForward = () => {
		if (this.visibility.main.display == 'show' && this.visible_group.name != null) {
			this.visibility.main.display = 'hide';
			this.visibility.groups.display = 'show';
		}
	}

	togglePanelBody = () => {
		if (this.visibility.main.display == 'show') {
			this.visibility.main.display = 'hide';
			this.visibility.groups.display = 'show';
		} else {
			this.visibility.main.display = 'show';
			this.visibility.groups.display = 'hide';
		}
	}

	toggleDeleteButtons = () => {
		if (this.selected_filter_groups.length > 0) {
			this.show_delete_vid_folder = 'show';
		} else {
			this.show_delete_vid_folder = 'hide';
		}
		if (this.selected_groups.length > 0) {
			this.show_delete_group = 'show';
		} else {
			this.show_delete_group = 'hide';
		}
	}

	loadGroupInPlayer = () => {
		if (this.visible_group.filter_groups.length == 0) {return;}
		this.fn.mq.SendMessage({
			event_name: 'loadVideoGroup',
			target: 'video-player',
			data: this.visible_group
		});
	}

	reloadGroupInPlayer = () => {
		if (this.visible_group.filter_groups.length == 0) {return;}
		this.fn.mq.SendMessage({
			event_name: 'reloadVideoGroup',
			target: 'video-player',
			data: this.visible_group.name
		});
	}

	clickDeleteGroups = () => {
		if (this.selected_groups.length == 0) { return; }
		var map = {};
		for (var i = 0; i < this.selected_groups.length; i++) {
			map[this.selected_groups[i].name] = true;
		}
		this.fn.fn_Ajax({
			url: '/api/videos/groups/delete',
			type: 'POST',
			data: {
				groups: JSON.stringify(map)
			}
		})
		.then((data: any) => {
			this.master_list = data;
			this.selected_groups = [];
			this.selected_filter_groups = [];
			this.visible_group = {};
		})
	}

	clickAddFilterGroup = () => {
		this.fn.mq.SendMessage({
			event_name: 'showModal',
			data: {
				modal: 'add_filter_group',
				content: {
					title: 'Add Filter Group',
					fname: ''
				},
				reply_target: 'video-list'
			}
		});
	}

	addFilterGroup = (query: string) => {
		if (query == null || query.trim() == "") { return; }
		this.fn.fn_Ajax({
			url: '/api/videos/groups/insert',
			type: 'POST',
			data: {
				group: this.visible_group.name,
				query: query
			}
		})
		.then(this.updateMasterListItem);
	}

	clickDeleteFilterGroups = () => {
		if (this.selected_filter_groups.length == 0) { return; }
		this.fn.fn_Ajax({
			url: '/api/videos/groups/remove',
			type: 'POST',
			data: {
				group: this.visible_group.name,
				queries: JSON.stringify(this.selected_filter_groups)
			}
		})
		.then(this.updateMasterListItem);
	}

	updateMasterListItem = (data: any) => {
		var index = -1;
		this.master_list.filter((val, i) => {
			if (val.name == data.name) {
				index = i;
				return true;
			}
		});
		this.master_list[index].filter_groups = data.filter_groups;
		this.visible_group = data;
		$("li").removeClass('selected_track');
	}

	//Event Aggregator Functions
	screenResize = (size: any = null): void => {
		this.resizeCategoryLists();
	}

	resizeCategoryLists = () => {
		setTimeout(() => {
			var height =$(window).height() - 150;
			$('.category-list').css('max-height', height + "px");
			$('.playlist-data').css('max-height', (height - 40) + "px");
			$('.filter-group-data').css('max-height', (height - 132) + "px");
		}, 50);
	}

	selectGroup = (index: number) => {
		this.visible_group = this.master_list[index];
		this.group_reload = localStorage[this.visible_group.name] != null;
		this.togglePanelBody();
	}

	clickGroup = (data: any) => {
		var elem = $(data.elem.parentElement);
		var selected = elem.hasClass('selected_track');
		if (selected) {
			elem.removeClass('selected_track');
			this.selected_groups = this.selected_groups.filter((val) => {
				return val.name != data.data.name;
			});
		} else {
			elem.addClass('selected_track');
			this.selected_groups.push(data.data);
		}
		this.toggleDeleteButtons();
	}

	clickFilterGroup = (data: any) => {
		var elem = $(data.elem);
		var selected = elem.hasClass('selected_track');
		if (selected) {
			elem.removeClass('selected_track');
			this.selected_filter_groups = this.selected_filter_groups.filter((val) => {
				return val != data.data;
			});
		} else {
			elem.addClass('selected_track');
			this.selected_filter_groups.push(data.data);
		}
		this.toggleDeleteButtons();
	}

	onModalClose = (data: any) => {
		switch (data.modal) {
			case 'add_playlist':
				this.addGroup(data.content.name);
				break;
			case 'add_filter_group':
				this.addFilterGroup(data.content.query);
				break;
		}
	}

}
