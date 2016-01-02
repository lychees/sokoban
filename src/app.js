

var selectLayer = null;

var WelcomeLayer = cc.Layer.extend({
    sprite:null,
    lbl_Title:{
        object: null,
        frame: 0,
        animatedText: [
            "S",
            "So",
            "Sok",
            "Sodo",
            "Sod ",
            "So",
            "Sok",
            "Soko",
            "Sokob ",
            "Sokoba",
            "Sokoban"
        ],
        interval: 12
    },

    ctor:function () {
        this._super();
        this.scheduleUpdate();
        var size = cc.winSize;
        var welcome_scene = ccs.load(res.WelcomeScene_json);
        this.addChild(welcome_scene.node);

        this.lbl_Title.object = ccui.helper.seekWidgetByName(welcome_scene.node, "lbl_Title");
        var btn_Start = ccui.helper.seekWidgetByName(welcome_scene.node, "btn_Start");
        var btn_Setting = ccui.helper.seekWidgetByName(welcome_scene.node, "btn_Setting");
        var btn_About = ccui.helper.seekWidgetByName(welcome_scene.node, "btn_About");

        if ("touches" in cc.sys.capabilities){
            btn_Start.addTouchEventListener(this.startBtnTouched, this);
            btn_Setting.addTouchEventListener(this.settingBtnTouched, this);
            btn_About.addTouchEventListener(this.aboutBtnTouched, this);

        } else {
            btn_Start.addClickEventListener(this.startBtnClicked.bind(this));
            btn_Setting.addClickEventListener(this.settingBtnClicked.bind(this));
            btn_About.addClickEventListener(this.aboutBtnClicked.bind(this));

        }
        return true;

    },

    update: function () {
        if (this.lbl_Title.frame + 1 == this.lbl_Title.animatedText.length * this.lbl_Title.interval) return;
        this.lbl_Title.frame++;
        if (this.lbl_Title.frame % this.lbl_Title.interval == 0){
            this.lbl_Title.object.setString(
                this.lbl_Title.animatedText[this.lbl_Title.frame/this.lbl_Title.interval]
            );
            if(this.lbl_Title.animatedText[this.lbl_Title.frame/this.lbl_Title.interval] != "SOKOBAN"){
                cc.audioEngine.playEffect(res.KeyEffect_mp3, false);
            }
        }

    },

    startBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopAllEffects();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInR(0.5, new SelectScene()));
                break;
        }
    },

    startBtnClicked: function (sender) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInR(0.5, new SelectScene()));
    },

    settingBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopAllEffects();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInR(0.5, new SettingScene()));
                break;
        }
    },

    settingBtnClicked: function (sender) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInR(0.5, new SettingScene()));
    },

    aboutBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopAllEffects();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInR(0.5, new AboutScene()));
                break;
        }
    },

    aboutBtnClicked: function (sender) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInR(0.5, new AboutScene()));
    }
});

var WelcomeScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new WelcomeLayer();
        this.addChild(layer);
        //cc.audioEngine.playMusic("res/sounds/bgm.mp3", true);
    }
});

var SelectLayer = cc.Layer.extend({
    sprite: null,
    beatmaps: null,
    selected_map_id: 0,
    selected_map: null,
    lst_SongList: null,
    txt_SelectedSongTitle: null,
    img_SelectedSongImage: null,
    txt_SelectedSongDes: null,
    previewLayer: null,

    refresh: function(){
        $.ajax({
            type: 'GET',
            //url: "http://192.168.1.230:4567/stage",
            url: "http://114.119.38.179:3389/stage",
            dataType: 'JSON',
            success: function(message){
                cc.log(JSON.stringify(message));
                //alert(message);
                selectLayer.loadLevelList(message);
            },
            error: function(message){
            }
        });
    },

    deleteBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopAllEffects();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                var query_url = "http://114.119.38.179:3389/stage/" + this.selected_map_id + "/del";
                $.ajax({
                    type: 'GET',
                    url: query_url,
                    success: function (message) {
                        selectLayer.refresh();
                    },
                    error: function (xhr, status, error) {
                        //selectLayer.refresh();
                        //alert(status);
                    }
                });
            break;
        }
    },
    deleteBtnClicked: function (sender) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        var query_url = "http://114.119.38.179:3389/stage/" + this.selected_map_id + "/del";
        $.ajax({
            type: 'GET',
            url: query_url,
            dataType: 'JSON',
            success: function(message){
                alert(message);
            },
            error: function(message){
            }
        });
    },

    playBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopAllEffects();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                //cc.director.runScene(new cc.TransitionSlideInR(0.5, new GameScene()));
                cc.director.pushScene(new cc.TransitionSlideInR(0.5, new GameScene()));
                break;
        }
    },
    playBtnClicked: function (sender) {
        cc.audioEngine.stopAllEffects();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        //cc.director.runScene(new cc.TransitionSlideInR(0.5, new SelectScene()));
        cc.director.runScene(new cc.TransitionSlideInR(0.5, new GameScene()));
    },

    loadLevelList: function(levelList){

        this.lst_SongList.removeAllItems();
        this.lst_SongList.refreshView();
        //this.lst_SongList.init();

        for(var i in levelList){
            var songOption = new ccui.Button();
            songOption.setTitleText(levelList[i].title);
            songOption.setTitleFontName(findFont(res.PixelFont_ttf));
            songOption.setTitleFontSize(60);
            songOption.setTag(i);

            if ("touches" in cc.sys.capabilities){
                songOption.addTouchEventListener(this.songOptionTouched, this);
            } else {
                songOption.addClickEventListener(this.songOptionClicked.bind(this));
            }

            this.lst_SongList.pushBackCustomItem(songOption);
        }
        this.beatmaps = levelList;
        this.txt_SelectedSongTitle.setString("");
        this.txt_SelectedSongDes.setString("");
        this.previewLayer.removeAllChildren();
    },

    ctor:function () {
        this._super();
        this.previewLayer = new cc.Layer();
        this.previewLayer.setAnchorPoint(0, 0);
        this.previewLayer.setPosition(550, 300);
        //this.previewLayer.setContentSize(100, 100);

        this.addChild(this.previewLayer, 10);

        selectLayer = this;
        var size = cc.winSize;
        var select_scene = ccs.load(res.SelectScene_json);
        this.addChild(select_scene.node);
        var btn_Back = ccui.helper.seekWidgetByName(select_scene.node, "btn_Back");
        if ("touches" in cc.sys.capabilities){
            btn_Back.addTouchEventListener(this.backBtnTouched, this);
        } else {
            btn_Back.addClickEventListener(this.backBtnClicked.bind(this));
        }

        this.lst_SongList = ccui.helper.seekWidgetByName(select_scene.node, "lst_SongList");
        this.txt_SelectedSongTitle = ccui.helper.seekWidgetByName(select_scene.node, "txt_SelectedSongTitle");
        this.img_SelectedSongImage = ccui.helper.seekWidgetByName(select_scene.node, "img_SelectedSongImage");
        this.txt_SelectedSongDes = ccui.helper.seekWidgetByName(select_scene.node, "txt_SelectedSongDes");

        var btn_Play = ccui.helper.seekWidgetByName(select_scene.node, "btn_Play");
        var btn_Delete = ccui.helper.seekWidgetByName(select_scene.node, "btn_Delete");

        if ("touches" in cc.sys.capabilities){
            btn_Play.addClickEventListener(this.playBtnClicked, this);
            btn_Delete.addClickEventListener(this.deleteBtnClicked, this);
        } else {
            btn_Play.addTouchEventListener(this.playBtnTouched, this);
            btn_Delete.addTouchEventListener(this.deleteBtnTouched, this);
        }

        this.refresh();
        return true;
    },

    mapSelected: function(){
        this.txt_SelectedSongTitle.setString(this.selected_map.title);
        //this.txt_SelectedSongDes.setString(this.selected_map.description + "\n" + "Author: " + this.selected_map.author);
        this.txt_SelectedSongDes.setString("Author: " + this.selected_map.author);
        //cc.audioEngine.playMusic(this.selected_map.music, true);

        var _grid = this.selected_map.map;
        var m = _grid.length;
        var n = _grid[0].length;

        grid = [];
        for (var i=0;i<n;++i){
            grid[i] = [];
            for (var j=0;j<m;++j){
                grid[i][j] = _grid[m-j-1][i];
            }
        }
        this.previewLayer.removeAllChildren();

        for (var i=0;i<n;++i) {
            for (var j = 0; j < m; ++j){
                var c = grid[i][j], t = new Item();
                t.setContentSize(tileSize, tileSize); t.genImage(c); //t.scaleTo(0.5);
                this.previewLayer.addChild(t); t.setPosition(i*tileSize, j*tileSize);
            }
        }
        this.previewLayer.setScale(1);
        var t = Math.max(n, m);
        if (t > 7) {
            this.previewLayer.setScale(7 / t);
        }
    },

    songOptionTouched: function(sender, type){
        switch (type){
            case ccui.Widget.TOUCH_ENDED:
                trace(sender.getTag());
                traceObj(this.beatmaps[sender.getTag()]);
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                this.selected_map_id = sender.getTag();
                this.selected_map = this.beatmaps[sender.getTag()];
                this.mapSelected();
        }
    },

    songOptionClicked: function(sender){
        trace(sender.getTag());
        traceObj(this.beatmaps[sender.getTag()]);
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        this.selected_map_id = sender.getTag();
        this.selected_map = this.beatmaps[sender.getTag()];
        this.mapSelected();
    },

    backBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopMusic();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
                break;
        }
    },

    backBtnClicked: function (sender) {
        cc.audioEngine.stopMusic();
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
    }
});

var SelectScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new SelectLayer();
        this.addChild(layer);
        //cc.audioEngine.playMusic("res/sounds/bgm.mp3", true);
    }
});

var SettingLayer = cc.Layer.extend({
    sprite:null,

    ctor:function () {
        this._super();
        var size = cc.winSize;
        var welcome_scene = ccs.load(res.SettingScene_json);
        this.addChild(welcome_scene.node);

        var btn_Back = ccui.helper.seekWidgetByName(welcome_scene.node, "btn_Back");
        if ("touches" in cc.sys.capabilities){
            btn_Back.addTouchEventListener(this.backBtnTouched, this);
        } else {
            btn_Back.addClickEventListener(this.backBtnClicked.bind(this));
        }
        return true;
    },

    backBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
                break;
        }
    },

    backBtnClicked: function (sender) {
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
    }
});

var SettingScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new SettingLayer();
        this.addChild(layer);
        //cc.audioEngine.playMusic("res/sounds/bgm.mp3", true);
    }
});

var AboutLayer = cc.Layer.extend({
    sprite:null,

    ctor:function () {
        this._super();
        var size = cc.winSize;
        var welcome_scene = ccs.load(res.AboutScene_json);
        this.addChild(welcome_scene.node);

        var btn_Back = ccui.helper.seekWidgetByName(welcome_scene.node, "btn_Back");
        if ("touches" in cc.sys.capabilities){
            btn_Back.addTouchEventListener(this.backBtnTouched, this);
        } else {
            btn_Back.addClickEventListener(this.backBtnClicked.bind(this));
        }
        return true;
    },

    backBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
                break;
        }
    },

    backBtnClicked: function (sender) {
        cc.audioEngine.playEffect(res.Effect_mp3, false);
        cc.director.runScene(new cc.TransitionSlideInL(0.5, new WelcomeScene()));
    }
});

var AboutScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new AboutLayer();
        this.addChild(layer);
        //cc.audioEngine.playMusic("res/sounds/bgm.mp3", true);
    }
});