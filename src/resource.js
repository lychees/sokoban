var res = {
    tiles_theme1_png : "res/theme/boxworld30.png",
    HelloWorld_png : "res/HelloWorld.png",
    WelcomeScene_json : "res/WelcomeScene.json",
    SelectScene_json: "res/SelectScene.json",
    SettingScene_json: "res/SettingScene.json",
    AboutScene_json: "res/AboutScene.json",
    SokobanScene_json: "res/SokobanScene.json",
    Effect_mp3: "res/sounds/effect.mp3",
    KeyEffect_mp3: "res/sounds/key_effect.mp3",
    Victory1_ogg: "res/sounds/Victory1.ogg",
    beatmaps_json: "res/beatmaps/beatmaps.json",
    PixelFont_ttf: {type:"font", name:"PixelFont", srcs:["res/PixelFont.ttf"]}
};

tileSprite = res.tiles_theme1_png;
tileSize = 30;

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

