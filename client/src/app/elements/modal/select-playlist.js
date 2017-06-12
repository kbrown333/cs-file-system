System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var SelectPlaylist;
    return {
        setters: [],
        execute: function () {
            SelectPlaylist = class SelectPlaylist {
                constructor() {
                    this.list = [];
                    this.selectPlaylist = (index, event) => {
                        var elem = $(event.target);
                        var selected = elem.hasClass('mdl-playlist-selected');
                        $("li", ".mdl-select-playlist").removeClass('mdl-playlist-selected');
                        if (selected) {
                            elem.removeClass('mdl-playlist-selected');
                            this.parent.modal_data.content.selected = null;
                        }
                        else {
                            elem.addClass('mdl-playlist-selected');
                            this.parent.modal_data.content.selected = this.list[index].name;
                        }
                    };
                }
                activate(parent) {
                    if (parent != null) {
                        this.parent = parent;
                        this.list = parent.modal_data.content.playlists;
                    }
                }
            };
            exports_1("SelectPlaylist", SelectPlaylist);
        }
    };
});
