import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
  type: Phaser.WEBGL,
  pixelArt: true,
  width: 256,
  height: 176,
  render: {
    pixelArt: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 1 // 内部解像度
  },
  scene: [
    GameScene,
    UIScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 500 }
    }
  }
};

const game = new Phaser.Game(config);