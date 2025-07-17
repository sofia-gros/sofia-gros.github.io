import Emitter from "../modules/Emitter.js";

export default class GameScene extends Phaser.Scene {
  constructor()
  {
    super({
      key: "GameScene"
    });
  }
  preload()
  {
    this.load.image("texture", "./game/assets/texture.png");
    this.load.json("world", "./game/assets/world.json");
    this.load.bitmapFont("font", './game/assets/pixel.png', './game/assets/pixel.fnt');
  }
  init()
  {
    this.state = {
      stage: "stage-1"
    };
  }
  create()
  {
    console.log("GameScene create");
   
    // 定数
    this.user_name = "Fumiya";
    this.maxCameraScrollX = 0;
    this.spacePressedTime = 0;
   
    // テクスチャ設定
    const texture = this.textures.get("texture");
    texture.add(0, 0, 32, 32, 16, 16);
    texture.add(1, 0, 0, 0, 16, 16); // レンガ
    texture.add(2, 0, 16, 0, 16, 16); // ハテナ
    texture.add(3, 0, 32, 0, 16, 16); // 固いブロック
    texture.add(4, 0, 48, 0, 16, 16); // 石壁
    texture.add("mario-idle", 0, 0, 32, 16, 16); // マリオ: アイドル状態
    texture.add("mashroom", 0, 32, 50, 16, 16); // キノコ
    texture.add(9, 0, 48, 50, 16, 16); // ノコノコ
    
    this.add.image(16, 16, "texture", "nokonoko");
    
    // popupテクスチャ
    texture.add("window-0", 0, 0, 48, 8, 8); // 上左
    texture.add("window-1", 0, 8, 48, 8, 8); // 上中
    texture.add("window-2", 0, 16, 48, 8, 8); // 上右
    texture.add("window-3", 0, 0, 56, 8, 8); // 中左
    texture.add("window-4", 0, 8, 56, 8, 8); // 中
    texture.add("window-5", 0, 16, 56, 8, 8); // 中右
    texture.add("window-6", 0, 0, 64, 8, 8); // 下左
    texture.add("window-7", 0, 8, 64, 8, 8); // 下左
    texture.add("window-8", 0, 16, 64, 8, 8); // 下左
    
    // 初期化
    this.collision_world = this.physics.add.staticGroup();
    this.mario = this.add.container();
    this.physics.world.enable(this.mario);
    this.marioSprite = this.add.image(8, 8, "texture", "mario-idle");
    this.mario.add(this.marioSprite);
    this.mario.body.setSize(8, 16);
    this.jaw = this.add.rectangle(14, 6, 8, 1, 0x00aa00);
    this.physics.world.enable(this.jaw);
    this.jaw.body.stop();
    this.mario.add(this.jaw);
    
    this.cameraFollowing = false;
    this.cameras.main.setRoundPixels(true);
    this.mashrooms = this.physics.add.staticGroup();
    
    // 入力
    this.keyboard = this.input.keyboard.addKeys({
      left: "A",
      right: "S",
      jump: "SPACE"
    });
    this.velocityX = 0; // 現在の速度
    this.acceleration = 5; // 加速量
    this.friction = 0.95;   // 減速率（0.9〜0.95くらいが自然）
    
    
    
    // ワールドデータ読み込み
    const world = this.cache.json.get("world")[this.state.stage];
    
    // ワールド生成
    for(let y = 0; y < world.length; y ++) {
      for(let x = 0; x < world[y].length; x ++) {
        let frame = world[y][x];
        if(frame === 0) continue;
        const block = this.physics.add.staticImage(x * 16, y * 16, "texture", frame).setOrigin(0);
        block.body.setOffset(8, 8);
        this.collision_world.add(block);
      }
    }
    
    // Marioと壁の当たり判定
    this.physics.add.collider(this.mario, this.collision_world, (mario, block) => {
      if(block.frame.name === 2) {
        // ハテナブロック
        
        if(this.mario.body.blocked.up) {
          Emitter.emit("?-block", "mushroom", block);
        }
        /*
        const marioTop = mario.body.y;
        const blockBottom = block.body.y + block.body.height;
        const yDiff = marioTop - blockBottom;
        if (yDiff > -15) {
          Emitter.emit("?-block", "mushroom", block);
        }
        */
      }
    });
    
    // マリオとハテナブロック
    Emitter.on("?-block", (type, block) => {
      this.collision_world.remove(block);
      const _ = this.physics.add.staticImage(block.x, block.y, "texture", 3).setOrigin(0);
      _.body.setOffset(8, 8);
      block.destroy();
      this.collision_world.add(_);
      const mashroom = this.physics.add.staticImage(block.x + 8, block.y - 5, "texture", "mashroom");
      this.mashrooms.add(mashroom);
    });
    
    // マリオときのこ
    this.physics.add.overlap(this.mario, this.mashrooms, (mario, mashroom) => {
      mashroom.destroy();
    });
    
    
    // ポップアップウインドウ
    new PopupWindow(this, `Welcome ${this.user_name}!\nthis game is\n fan made game!\n\nMade by\n Sofia & Fin\n\n\nClick to\n Close Window`, 54, 32, 18, 14)
      .show()
      .close_callback(() => {
        new PopupWindow(this, `Controll\n\nA, S: Move\n\nSPACE: Jump\n(short press,\n long press)`, 54, 32, 18, 14)
          .show()
      });
    
    this.input.addPointer(3); // 指の認識数

    Emitter.on("isLeft", press => this.leftPressed = press );
    Emitter.on("isRight", press => this.rightPressed = press );
    Emitter.on("isJump", press => this.spacePressed = press );
    
  }
  
  update()
  {
    
    const isRight = this.keyboard.right.isDown || this.rightPressed;
    const isLeft = this.keyboard.left.isDown || this.leftPressed;
    const isJump = this.keyboard.jump.isDown || this.spacePressed;
  
    if (isRight) {
      this.velocityX += this.acceleration;
    } else if (isLeft) {
      this.velocityX -= this.acceleration;
    } else {
      // 慣性による減速
      this.velocityX *= this.friction;
      // めっちゃ小さい値で揺れないように
      if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    }
    // 速度制限（あれば）
    this.velocityX = Phaser.Math.Clamp(this.velocityX, -100, 100);
    // 実際に速度を適用
    this.mario.body.setVelocityX(this.velocityX);


    // ジャンプ時間
    if(isJump) {
      this.spacePressedTime ++;
      if(this.spacePressedTime > 12) {
        if(this.mario.body.velocity.y === 0) this.mario.body.setVelocityY(-260);
        this.spacePressedTime = 0;
      }
    } else {
      if(this.spacePressedTime !== 0) {
        if(this.mario.body.velocity.y === 0) this.mario.body.setVelocityY(-200);
        this.spacePressedTime = 0;
      }
      this.spacePressedTime = 0;
    }
    
    // スプライトの状態
    if(this.mario.body.velocity.x > 0) {
      this.marioSprite.setFrame("mario-idle");
      this.marioSprite.flipX = false;
    } else if(this.mario.body.velocity.x < 0) {
      this.marioSprite.setFrame("mario-idle");
      this.marioSprite.flipX = true;
    }


    // カメラ追従
    const screenCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    // カメラが追従中で、かつ特定の条件が満たされた場合に追従を停止
    // 例: マリオが画面の左端付近に戻ってきた場合など
    if (this.cameraFollowing || this.mario.x < screenCenterX) {
      this.cameras.main.stopFollow();
      this.cameraFollowing = false;
    }
    
    // まだカメラが追従していない、かつマリオが画面中央より右にいる場合に追従を開始
    if (!this.cameraFollowing && this.mario.x > screenCenterX) {
      this.cameras.main.startFollow(this.mario, true, 1, 0);
      this.cameraFollowing = true;
      // console.log(this.cameras.main);
    }
    

    // カメラが追従中の場合、Y座標を固定する
    if(this.cameraFollowing) {
      this.cameras.main.scrollY = 0;
    }

    // マリオの左移動制限
    const leftLimit = this.cameras.main.scrollX;
    if (this.mario.x < leftLimit) {
      this.mario.x = leftLimit;
      this.mario.setVelocityX(0);
    }
    
    // if(this.mario.body.blocked.up) console.dir(this.mario.body.blocked.up);
    
  }
  
  
}

class PopupWindow
{
  constructor(scene, text, x, y, width, height)
  {
    this.scene = scene;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.popup_group = scene.add.group();
    this.callback = { show: null, close: null };
  }
  show()
  {
    const { scene, text, x, y, width, height } = this;
    const tileSize = 8;
    
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let frame = 4; // 中央（デフォルト）
        // 上
        if (j === 0) {
          if (i === 0) frame = 0;            // 左上
          else if (i === width - 1) frame = 2; // 右上
          else frame = 1;                    // 上中
        }
        // 中段
        else if (j === height - 1) {
          if (i === 0) frame = 6;            // 左下
          else if (i === width - 1) frame = 8; // 右下
          else frame = 7;                    // 下中
        }
        // 中央行
        else {
          if (i === 0) frame = 3;            // 中左
          else if (i === width - 1) frame = 5; // 中右
          else frame = 4;                    // 中央
        }
  
        const px = x + tileSize * i;
        const py = y + tileSize * j;
        const tile = scene.add.image(px, py, "texture", `window-${frame}`).setOrigin(0).setScrollFactor(0);
        this.popup_group.add(tile);
      }
    }
    const t = scene.make.bitmapText({
      x: x + 6, y: y + 6,
      text,
      font: "font",
      size: 8
    }).setScrollFactor(0);
    this.popup_group.add(t);
    if(this.callback.show) {
      this.collback.show();
      this.callback.show = null;
    }
    scene.input.setHitArea(this.popup_group.getChildren()).on("gameobjectdown", (pointer, gameObject) => {
      this.close();
    });
    return this;
  }
  close()
  {
    if(this.callback.close) {
      this.callback.close();
      this.callback.close = null;
    }
    this.popup_group.destroy(true);
    return this;
  }
  show_callback(func) {
    if(func) this.callback.show = func;
  }
  close_callback(func) {
    if(func) this.callback.close = func;
  }
}