import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";

const config = {
  type: Phaser.WEBGL,
  width: 1920 / 3,
  height: 1080 / 3,
  scene: [
    GameScene,
    UIScene,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    min: 60,
    target: 120
  },
  render: {
    antialias: false,
    antialiasGL: false,
    pixelArt: true,
    roundPixels: false,
    powerPreference: "high-performance"
    /*
    antialias: true,
    antialiasGL: true,
    desynchronized: false,
    pixelArt: false,
    roundPixels: false,
    transparent: false,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance', // 'high-performance', 'low-power' or 'default'
    batchSize: 4096,
    maxLights: 10,
    maxTextures: -1,
    mipmapFilter: 'LINEAR', // 'NEAREST', 'LINEAR', 'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST', 'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR'
    autoMobilePipeline: true,
    defaultPipeline: 'MultiPipeline',
    pipeline:[]
    */
  },
};

const game = new Phaser.Game(config);