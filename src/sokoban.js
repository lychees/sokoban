
var dx = [-1, 0, 1, 0];
var dy = [0, 1, 0, -1];
var pushOrder = ['A', 'W', 'D', 'S'];
var moveOrder = ['a', 'w', 'd', 's'];
var tileSprite;
var tileSize;
var game;
var orders = [];
var win;

/*var grid = [
 '#####',
 '#@$.#',
 '#####'
 ];*/
/*
 var grid = [
 '_#######__',
 '##-----###',
 '#-$@$$---#',
 '#-$$$----#',
 '#-$--##*##',
 '#---##-..#',
 '##---*...#',
 '_#--##-..#',
 '_#########'
 ];*/

var grid = [
    "#######",
    "##@####",
    "#-$---#",
    "#---#-#",
    "##-##-#",
    "#-----#",
    "#######"
];

var player = null;
var tiles = null;

var doWin = function(){

    win = true;
    cc.audioEngine.playEffect(res.Victory1_ogg, false);
    //cc.log("Win");

    /*grid = [
        '_#######__',
        '##-----###',
        '#-$@$$---#',
        '#-$$$----#',
        '#-$--##*##',
        '#---##-..#',
        '##---*...#',
        '_#--##-..#',
        '_#########'
    ];*/
    //game.sp();
}


var level_submit = function(){

    var grid = document.getElementById('textField').value; if (grid == "") return;
    grid = grid.trim().split('\n');

    var title = document.getElementById('title').value; if (title == "") title = "noname";
    var author = document.getElementById('author').value; if (author == "") author = "noname";

    var json = JSON.stringify({
        title: title, //$('#title').value,
        author: author, //$('#author').value,
        map: grid
    });

    //cc.log(json);

    $.ajax({
        type: 'POST',
        //url: "http://192.168.1.230:4567/stage",
        url: "http://114.119.38.179:3389/stage",
        data: json,
        success: function(message){
            cc.log(message);
            //alert(message);
        },
        error: function(message){
        }
    });
}

var isWin = function(){
    var n = grid.length, m = grid[0].length;
    for (var i=0;i<n;++i) for (var j=0;j<m;++j) if (tiles[i][j].ch == '.') return false;
    return true;
}

var isFree = function(c){
    return c == '-' || c == '.' || c == '@' || c == '+';
}

var isBox = function(c){
    return c == '$' || c == '*';
}
var inGrid = function(x, y){
    return x >= 0 && y >= 0 && x < tiles.length && y < tiles[0].length;
}
var revDir = function(d){
    if (d < 2) return d + 2;
    return d - 2;
}

var setGrid = function(g, ch){
    if (g.ch == ch) return;
    g.genImage(ch);
}

var getGrid = function() {
    var n = tiles.length, m = tiles[0].length;
    var grid = [];

    for (var i=0;i<m;++i){
        grid[i] = "";
        for (var j=0;j<n;++j){
            grid[i] += tiles[j][m-i-1].ch;
        }
    }
    return grid;
}

var _pushOrder = true;

var Item = cc.Layer.extend({
    ch:null,
    xx:0,
    yy:0,

    ctor:function () {
        this._super();
    },
    highlight:function(c){
        this.removeAllChildren();
        var xi = 3, yi = 0;
        if (this.ch == '*') ++yi;
        var bg = new cc.Sprite(res.tiles_theme1_png, cc.rect(xi*tileSize, yi*tileSize, tileSize, tileSize));
        bg.setAnchorPoint(0, 0);
        this.addChild(bg);
    },
    genImage:function(c){
        this.ch = c;
        this.removeAllChildren();
        var xi = 2, yi = 3;

        if (c == '-'){
            xi = 0, yi = 0;
        }
        else if (c == '@'){
            xi = 1, yi = 0;
        }
        else if (c == '$'){
            xi = 2, yi = 0;
        }
        else if (c == '*'){
            xi = 2, yi = 1;
        }
        else if (c == '.') {
            xi = 0, yi = 1;
        }
        else if (c == '#'){
            xi = 0, yi = 2;
        }
        else if (c == '+'){
            xi = 1, yi = 1;
        }
        var bg;

        if (xi == 2 && yi == 3){
            bg = new cc.Sprite(res.tiles_theme1_png, cc.rect(xi*tileSize + tileSize/4, yi*tileSize + tileSize/4, tileSize/2, tileSize/2));
            bg.setScale(2);
        }
        else {
            bg = new cc.Sprite(res.tiles_theme1_png, cc.rect(xi * tileSize, yi * tileSize, tileSize, tileSize));
        }

        bg.setAnchorPoint(0, 0);
        this.addChild(bg);
    },

    tryMove:function(d){
        var x = this.xx, y = this.yy; var old = tiles[x][y];
        x += dx[d]; y += dy[d]; var cur = tiles[x][y];

        if (!isBox(old.ch) && isBox(cur.ch)) { // 箱子
            if (cur.tryMove(d)){
                if (_pushOrder == true) {
                    _pushOrder = false;
                    this.doMove(d);
                    _pushOrder = true;
                }
                else {
                    this.doMove(d);
                }
                return true;
            }
            return false;
        }

        if (cur.ch != '-' && cur.ch != '.'){
            return false;
        }
        this.doMove(d);
        return true;
    },

    doMove:function(d) {
        var x = this.xx, y = this.yy;
        var xx = x + dx[d], yy = y + dy[d];

        var old = tiles[x][y], cur = tiles[xx][yy];

        if (isBox(old.ch)){
            if (_pushOrder) orders.push(pushOrder[d]);
            setGrid(cur, cur.ch == '.' ? '*' : '$');
            setGrid(old, old.ch == '*' ? '.' : '-');
        }
        else{
            if (_pushOrder) orders.push(moveOrder[d]);
            setGrid(cur, cur.ch == '.' ? '+' : '@');
            setGrid(old, old.ch == '+' ? '.' : '-');
            player = cur;
        }
    }
});

Item.create = function () {
    var t = new Item();
    return this;
};

var GameLayer = cc.Layer.extend({
    sprite: null,
    lst_SongList: null,
    _itemMenu:null,
    _beginPos:0,
    isMouseDown:false,

    tilesLayer:null,
    visLayer:null,
    vis: null,
    viss: null,
    dirr: null,
    activeTile: null,

    scroll_view: null,


    back: function(){
        if (orders.length == 0) return;
        _pushOrder = false;
        var t = orders.pop();
        cc.log(t);
        if (t == 'a'){
            player.doMove(2);
        }
        else if (t == 'w'){
            player.doMove(3);
        }
        else if (t == 'd'){
            player.doMove(0);
        }
        else if (t == 's'){
            player.doMove(1);
        }
        else if (t == 'A'){
            var x = player.xx + dx[0], y = player.yy + dy[0];
            player.doMove(2);
            tiles[x][y].doMove(2);
        }
        else if (t == 'W'){
            var x = player.xx + dx[1], y = player.yy + dy[1];
            player.doMove(3);
            tiles[x][y].doMove(3);
        }
        else if (t == 'D'){
            var x = player.xx + dx[2], y = player.yy + dy[2];
            player.doMove(0);
            tiles[x][y].doMove(0);
        }
        else if (t == 'S'){
            var x = player.xx + dx[3], y = player.yy + dy[3];
            player.doMove(1);
            tiles[x][y].doMove(1);
        }
        _pushOrder = true;
    },

    move0: function(target, order){
        var xx = target.xx, yy = target.yy;
        while (this.vis[xx][yy] != 0){
            for (var d=0;d<4;++d){
                var x = xx - dx[d], y = yy - dy[d];
                if (!inGrid(x, y)) continue;
                if (this.vis[x][y] + 1 == this.vis[xx][yy]){
                    order.push(d);
                    xx = x; yy = y;
                    break;
                }
            }
        }
    },

    move1: function(target){

        var xx = target.xx, yy = target.yy, dd = 0;
        var order = [];
        for (var d=0;d<4;++d){
            cc.log(xx,yy,d);
            cc.log(this.viss[xx][yy][d]);
            if (this.viss[xx][yy][dd] == -1 || (this.viss[xx][yy][d] != -1 && this.viss[xx][yy][d] < this.viss[xx][yy][dd])) dd = d;
        }

        var player_xx = player.xx, player_yy = player.yy;

        while (this.viss[xx][yy][dd] != 0){
            var d = this.dirr[xx][yy][dd];

            if (d == dd) {
                var x = xx + dx[dd], y = yy + dy[dd];
                order.push(revDir(d));
                xx = x; yy = y;
            }
            else{
                player.xx = xx + dx[d], player.yy = yy + dy[d];
                this.bfs0(0, xx, yy);
                this.move0(tiles[xx+dx[dd]][yy+dy[dd]], order);
                dd = d;
            }
        }

        player.xx = player_xx, player.yy = player_yy;
        this.bfs0(0, xx, yy);
        this.move0(tiles[xx+dx[dd]][yy+dy[dd]], order);
        player.xx = player_xx, player.yy = player_yy;
        for (var i=order.length-1;i>=0;--i) player.tryMove(order[i]);
    },

    bfs0: function(){
        var bj = arguments[0] != null ? arguments[0] : 1;
        var bx = arguments[1], by = arguments[2];

        var n = grid.length;
        var m = grid[0].length;
        var x = player.xx, y = player.yy;
        var vis = [];
        for (var i=0;i<n;++i){
            vis[i] = [];
            for (var j=0;j<m;++j){
                vis[i][j] = -1;
            }
        }

        vis[x][y] = 0;
        var cz = 0, op = 1;
        var Qx = [], Qy = [];
        Qx[cz] = x; Qy[cz] = y;
        while (cz < op){
            var x = Qx[cz], y = Qy[cz]; ++cz;
            for (var d=0;d<4;++d){
                var xx = x + dx[d], yy = y + dy[d];
                if (!inGrid(xx, yy)) continue;
                var ok = false;
                if (bj == 0){
                    if (xx == bx && yy == by) ok = false;
                    else ok = isFree(tiles[xx][yy].ch) || (xx == this.activeTile.xx && yy == this.activeTile.yy);
                }
                else{
                    ok = isFree(tiles[xx][yy].ch);
                }

                if (ok && vis[xx][yy] == -1){
                    Qx[op] = xx; Qy[op] = yy;
                    vis[xx][yy] = vis[x][y] + 1;
                    if (bj == 1){
                        var t = new cc.Sprite(tileSprite, cc.rect(2 * tileSize, 3 * tileSize, tileSize / 4, tileSize / 4));
                        t.setAnchorPoint(0.5, 0.5);
                        this.visLayer.addChild(t);
                        t.setPosition(xx*tileSize + tileSize/2, yy*tileSize + tileSize/2);
                    }
                    ++op;
                }
            }
        }
        this.vis = vis;
        if (bj == 1) this.activeTile = player;
    },



    bfs1: function(target){
        target.highlight();
        var n = grid.length;
        var m = grid[0].length;
        this.activeTile = target;

        var viss = [], dirr = [];
        for (var i=0;i<n;++i){
            viss[i] = []; dirr[i] = [];
            for (var j=0;j<m;++j){
                viss[i][j] = []; dirr[i][j] = [];
                for (var d=0;d<4;++d){
                    viss[i][j][d] = -1; dirr[i][j][d] = -1;
                }
            }
        }

        var cz = 0, op = 0;
        var Qx = [], Qy = [], Qd = [];
        var player_xx = player.xx, player_yy = player.yy;
        var x = target.xx, y = target.yy;

        this.bfs0(0, x, y);
        for (var d=0;d<4;++d){
            var xx = x + dx[d], yy = y + dy[d];
            if (!inGrid(xx, yy)) continue;
            if (this.vis[xx][yy] != -1) {
                viss[x][y][d] = 0;
                //cc.log(x,y,d,0,0,0);
                Qx[op] = x, Qy[op] = y, Qd[op] = d; ++op;
            }
        }

        while (cz < op){
            var x = Qx[cz], y = Qy[cz], d = Qd[cz]; ++cz;

            var xx = x - dx[d], yy = y - dy[d];
            if (!inGrid(xx, yy)) continue;
            if ((isFree(tiles[xx][yy].ch) || xx == target.xx && yy == target.yy) && viss[xx][yy][d] == -1){
                viss[xx][yy][d] = viss[x][y][d] + 1;
                dirr[xx][yy][d] = d;
                Qx[op] = xx, Qy[op] = yy, Qd[op] = d; ++op;
                if (xx != target.xx || yy != target.yy){
                    var t = new cc.Sprite(tileSprite, cc.rect(2 * tileSize, 3 * tileSize, tileSize / 4, tileSize / 4));
                    t.setAnchorPoint(0.5, 0.5);
                    this.visLayer.addChild(t);
                    t.setPosition(xx * tileSize + tileSize / 2, yy * tileSize + tileSize / 2);
                }
            }
            player.xx = x+dx[d], player.yy = y+dy[d]; this.bfs0(0, x, y);
            for (var dd=0;dd<4;++dd) if (d != dd){
                var xx = x + dx[dd], yy = y + dy[dd];
                if (!inGrid(xx, yy)) continue;
                if (this.vis[xx][yy] != -1 && viss[x][y][dd] == -1) {
                    viss[x][y][dd] = viss[x][y][d];
                    dirr[x][y][dd] = d;
                    Qx[op] = x, Qy[op] = y, Qd[op] = dd; ++op;
                }
            }
        }

        player.xx = player_xx, player.yy = player_yy;
        this.viss = viss;
        this.dirr = dirr;
    },


    setLv: function(){

        //this.removeAllChildren();
        this.scroll_view.removeAllChildren();
        //this.scroll_view.setSize(cc.size(960, 400));
        //missionlist.setTouchEnabled(true);
        //missionlist.setBounceEnabled(true);
        //missionlist.setVisible(true);

        var len = 5;var size = cc.winSize;
        //this.scroll_view.y = size.height/2;
        //this.scroll_view.x = size.width/2;
        //this.scroll_view.setAnchorPoint(cc.p(0.5,0.5));

        //var _grid = grid;
        var n = grid.length;
        var m = grid[0].length;

        tiles = [];

        for (var i=0;i<n;++i){
            //grid[i] = [];
             tiles[i] = [];
            for (var j=0;j<m;++j){
                //grid[i][j] = _grid[m-j-1][i];
            }
        }

        var size = cc.director.getWinSize();
        this.tilesLayer = new cc.Layer();
        this.visLayer = new cc.Layer();
        this.scroll_view.addChild(this.tilesLayer); //this.tilesLayer.setPosition(size.width/2 - tileSize*n/2, size.height/2 - tileSize*m/2);
        this.scroll_view.addChild(this.visLayer, 100); //this.visLayer.setPosition(size.width/2 - tileSize*n/2, size.height/2 - tileSize*m/2);
        //this.scroll_view.setInnerContainerSize(n*tileSize, m*tileSize);
        this.scroll_view.setInnerContainerSize(cc.size(n*tileSize, m*tileSize));

        //this.scroll_view.addChild(this.tilesLayer, 200);
        //this.scroll_view.addChild(this.visLayer, 100);

        var tilesClicked = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,					   // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞掉事件，不再向下传递。
            onTouchBegan: function (touch, event) {	 //实现 onTouchBegan 事件处理回调函数
                var target = event.getCurrentTarget();  // 获取事件所绑定的 target, 通常是cc.Node及其子类
                // 获取当前触摸点相对于按钮所在的坐标
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);
                if (cc.rectContainsPoint(rect, locationInNode)) {	   // 判断触摸点是否在按钮范围内
                    if (isBox(target.ch)){
                        cc.audioEngine.playEffect(res.Effect_mp3, false);
                        if (game.activeTile != null && isBox(game.activeTile.ch)){
                            game.activeTile.genImage(game.activeTile.ch);
                            game.activeTile = null;
                            game.visLayer.removeAllChildren();
                        }
                        if (game.activeTile == null) {
                            game.bfs1(target);
                            return true;
                        }
                    }
                    else if (game.activeTile != null && isFree(target.ch)) {
                        if (game.activeTile == player) {
                            if (game.vis[target.xx][target.yy] != -1) {
                                var order =[]; game.move0(target, order);
                                for (var i = order.length - 1; i >= 0; --i) player.doMove(order[i]);
                            }
                            else {
                                //error
                            }
                        }
                        else if (isBox(game.activeTile.ch)){
                            for (var d=0;d<4;++d) {
                                if (game.viss[target.xx][target.yy][d] != -1) {
                                    game.move1(target);
                                    break;
                                }
                            }
                        }
                    }
                    else if (target == player){
                        cc.audioEngine.playEffect(res.Effect_mp3, false);
                        if (game.activeTile == null) {
                            game.bfs0();
                            return true;
                        }
                    }
                    if (game.activeTile != null && isBox(game.activeTile.ch)) game.activeTile.genImage(game.activeTile.ch);
                    game.activeTile = null;
                    game.visLayer.removeAllChildren();
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {		 //实现onTouchMoved事件处理回调函数, 触摸移动时触发
            },
            onTouchEnded: function (touch, event) {		 // 实现onTouchEnded事件处理回调函数

            }
        });

        for (var i=0;i<n;i++){
            for (var j=0;j<m;j++){
                var c = grid[i][j], t = new Item();
                t.setContentSize(tileSize, tileSize);
                t.genImage(c);
                t.xx = i; t.yy = j;
                this.tilesLayer.addChild(t); t.setPosition(i*tileSize, j*tileSize);
                //this.scroll_view.addChild(t);
                tiles[i][j] = t;
                cc.eventManager.addListener(tilesClicked.clone(), t);

                if (c == '@'){
                    //t.setLocalZOrder(10);
                    player = t;
                }
            }
        }

        win = false;
        if (isWin()) doWin();
    },

    backBtnTouched: function (sender, type){
        switch (type) {
            case ccui.Widget.TOUCH_BEGAN:
                cc.audioEngine.stopMusic();
                cc.audioEngine.playEffect(res.Effect_mp3, false);
                cc.director.popScene();
                break;
        }
    },

    backBtnClicked: function (sender) {
        alert("error");
    },


    ctor:function () {
        this._super(); game = this;
        var sokoban_scene = ccs.load(res.SokobanScene_json);
        this.addChild(sokoban_scene.node);
        this.scroll_view = ccui.helper.seekWidgetByName(sokoban_scene.node, "scroll_view");

        var btn_Back = ccui.helper.seekWidgetByName(sokoban_scene.node, "btn_Back");
        if ("touches" in cc.sys.capabilities){
            btn_Back.addTouchEventListener(this.backBtnTouched, this);
        } else {
            btn_Back.addClickEventListener(this.backBtnClicked.bind(this));
        }

        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    if (win == true) return;

                    game.visLayer.removeAllChildren();
                    cc.log(key);

                    if (key == 37 || key == 65){ // A
                        player.tryMove(0);
                    }
                    else if (key == 38 || key == 87){ // W
                        player.tryMove(1);
                    }
                    else if (key == 39 || key == 68){ // D
                        player.tryMove(2);
                    }
                    else if (key == 40 || key == 83){ // S
                        player.tryMove(3);
                    }
                    else if (key == 79){ // O
                        document.getElementById('textField').value = orders.join('');
                    }
                    else if (key == 8 || key == 90){ // back, z
                        game.back();
                    }
                    else if (key == 80){ // p
                        var grid = getGrid();
                        //$('#textField').value = "";
                        document.getElementById('textField').value = "";
                        for (var i=0;i<grid.length;++i) {
                            //$('#textField').value += grid[i];
                            //$('#textField').value += '\n';
                            document.getElementById('textField').value += grid[i];
                            document.getElementById('textField').value += '\n';
                        }
                    }
                    else if (key == 81){
                        document.getElementById('textField').value = getGrid();
                        //$('#textField').value = "";
                        document.getElementById('textField').value = "";
                        for (var i=0;i<grid.length;++i) {
                            //$('#textField').value += grid[i];
                            //$('#textField').value += '\n';
                            document.getElementById('textField').value += grid[i];
                            document.getElementById('textField').value += '\n';
                        }
                        level_submit();
                    }
                    
                    if (isWin()) doWin();
                },
                onKeyReleased: function (key, event) {

                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }
        this.setLv();
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

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
        //cc.audioEngine.playMusic("res/sounds/bgm.mp3", true);
    }
});