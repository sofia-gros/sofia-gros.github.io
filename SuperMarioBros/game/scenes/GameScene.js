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
    this.load.spritesheet("texture", "./game/assets/texture.png", { frameWidth: 16, frameHeight: 16 });
    this.load.json("world", "./game/assets/world.json");
    this.load.bitmapFont("font", './game/assets/pixel.png', "./game/assets/pixel.fnt");
  }
  init()
  {
    
    // 初期値
    this.collision_world = this.physics.add.staticGroup();
    this.block_frame = {
      0: null,
      1: 0, // 🧱
      2: 1, // ⬛
      3: 2, // ❔
      8: 32, // 🍄‍🟫
      9: 9, // 🚩
    };
    this.velocityX = 0;
    this.spacePressedTime = 0;
    this.spacePressedTime = 0;
    this.state = {};
    
  }
  create(props)
  {
    console.log("GameScene create");
    
    this.state.count = props?.count != null? props.count: 10;
    
    const texture = this.textures.get("texture");
    texture.add("window-0", 0, 0, 48, 8, 8); // 上左
    texture.add("window-1", 0, 8, 48, 8, 8); // 上中
    texture.add("window-2", 0, 16, 48, 8, 8); // 上右
    texture.add("window-3", 0, 0, 56, 8, 8); // 中左
    texture.add("window-4", 0, 8, 56, 8, 8); // 中
    texture.add("window-5", 0, 16, 56, 8, 8); // 中右
    texture.add("window-6", 0, 0, 64, 8, 8); // 下左
    texture.add("window-7", 0, 8, 64, 8, 8); // 下左
    texture.add("window-8", 0, 16, 64, 8, 8); // 下左
    
    
    
    this.make.bitmapText({
      x: 6, y: 6,
      text: `Player: ${this.state.count}`,
      font: "font",
      size: 8
    }).setScrollFactor(0);
    
    // キャラクター設計
    this.player = this.physics.add.group();
    this.player_sprite = this.physics.add.sprite(16, 120, "texture", 20);
    // this.player_sprite = this.physics.add.sprite(16 * 90, 120, "texture", 20);
    this.player_sprite.body.setSize(8, 16);
    this.player.add(this.player_sprite);

    // カメラ
    this.cameras.main.startFollow(this.player_sprite, true, 1.0, .1);

    // 入力
    this.keyboard = this.input.keyboard.addKeys({
      left: "A",
      right: "S",
      jump: "SPACE"
    });
    
    // スマホ入力
    Emitter.on("isLeft", press => this.leftPressed = press );
    Emitter.on("isRight", press => this.rightPressed = press );
    Emitter.on("isJump", press => this.spacePressed = press );
    
    // ワールドデータ読み込み
    const world = this.cache.json.get("world")["stage-1"];
    // ワールド生成
    for(let y = 0; y < world.length; y ++) {
      for(let x = 0; x < world[y].length; x ++) {
        let frame = world[y][x];
        if(frame === 0) continue;
        const block = this.physics.add.staticSprite(x * 16, y * 16, "texture", this.block_frame[frame]).setOrigin(0);
        block.body.setOffset(8, 8);
        this.collision_world.add(block);
        if(frame === 8) { // 🍄‍🟫
          block.setData({ enemy: true, move: "left" });
        }
      }
    }
    
    // 説明
    if(this.state.count === 10) {
      // ポップアップウインドウ
      new PopupWindow(this, `Welcome Game!!\nthis is\n fan made game!\n\nMade by\n Sofia & Fin\n\n\nClick to\n Close Window`, 54, 32, 18, 14)
        .show()
        .close_callback(() => {
          new PopupWindow(this, `Controll\n\nA, S: Move\n\nSPACE: Jump\n(short press,\n long press)`, 54, 32, 18, 14)
            .show()
        });
    }
    
    // 当たり判定
    this.physics.add.collider(this.player, this.collision_world, (player, block) => {
      switch(block.frame.name) {
        case 1: // ❔
          if(!this.player_sprite.body.blocked.up) return;
          block.setFrame(2);
        break;
        case 9: // 🚩
          new PopupWindow(this, `\n\n\n\nGAME CLEAR!!!\n\n\n\nMada Aruyo XD`, 54, 32, 18, 14)
            .show()
            .close_callback(() => {
              this.scene.start("GameScene");
            });
        break;
        case 32: // 🍄‍🟫
          if(this.player_sprite.body.blocked.down && this.player_sprite.y < 148) {
            // 倒す
            this.collision_world.remove(block);
            block.destroy();
            this.player.setVelocityY(-200);
          } else {
            this.scene.start("GameScene", { count: this.state.count - 1 });
          }
        break;
      }
    });
    
    
  }
  
  update()
  {
    
    const isRight = this.keyboard.right.isDown || this.rightPressed;
    const isLeft = this.keyboard.left.isDown || this.leftPressed;
    const isJump = this.keyboard.jump.isDown || this.spacePressed;
  
    if (isRight) {
      this.velocityX += 5;
    } else if (isLeft) {
      this.velocityX -= 5;
    } else {
      // 慣性による減速
      this.velocityX *= .95;
      // めっちゃ小さい値で揺れないように
      if (Math.abs(this.velocityX) < 1) this.velocityX = 0;
    }
    // 速度制限（あれば）
    this.velocityX = Phaser.Math.Clamp(this.velocityX, -100, 100);
    // 実際に速度を適用
    this.player.setVelocityX(this.velocityX);
    
    // ジャンプ時間
    if(isJump) {
      this.spacePressedTime ++;
      if(this.spacePressedTime > 12) {
        if(this.player_sprite.body.velocity.y === 0) this.player.setVelocityY(-260);
        this.spacePressedTime = 0;
      }
    } else {
      if(this.spacePressedTime !== 0) {
        if(this.player_sprite.body.velocity.y === 0) this.player.setVelocityY(-200);
        this.spacePressedTime = 0;
      }
      this.spacePressedTime = 0;
    }
    
    if(this.player_sprite.y > 400) {
      this.scene.start("GameScene", { count: this.state.count - 1 });
    }
    

    this.collision_world.getChildren().forEach(obj => {
      if (obj.getData("enemy")) {
        // 敵としての動き処理
        const moveDir = obj.getData("move");
        if (moveDir === "left") {
          obj.x -= .2; // ← 左に移動（staticなので手動で）
        } else if (moveDir === "right") {
          obj.x += .2;
        }
        // 座標を更新してあげる（staticなので必要）
        obj.refreshBody();
      }
    });

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