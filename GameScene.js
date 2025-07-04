import Emitter from "./Emitter.js";

// 指定円周上のランダム位置
function randRandomXY(gameObject, minRand, maxRand) {
  let angle = Math.random() * 360;
  let r = Phaser.Math.Between(minRand, maxRand);
  let x = gameObject.x + Math.cos(angle * (Math.PI / 180)) * r;
  let y = gameObject.y + Math.sin(angle * (Math.PI / 180)) * r;
  return { x, y };
}


export default class GameScene extends Phaser.Scene {
  constructor()
  {
    super({
      key: "GameScene"
    });
  }
  preload()
  {
    this.load.spritesheet("number", "./number.png", { frameWidth: 8, frameHeight: 8 });
    this.load.spritesheet("character", "./character.png", { frameWidth: 24, frameHeight: 24 });
    this.load.spritesheet("item", "./assets/item.png", { frameWidth: 24, frameHeight: 24 });
    
  }
  create()
  {
    console.log("GameScene Create");
    this.scene.launch("UIScene");
    
    this.player = this.add.container();
    this.player._body = this.add.sprite(0, 0, "character", 0);
    this.player.add(this.player._body);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(6, -3, -3)
      .setMaxVelocity(100, 100)
      .setImmovable();
    this.cameras.main.startFollow(this.player)
      .setLerp(0.05, 0.05);
    this.player.setData({
      move_speed: 30,
      helth: 5,
      max_helth: 5,
      get_exp_area: 60,
    })
    .setDepth(999);
    
    this.player._gui_progress_bg = this.add.rectangle(0, 18, 16, 4, 0xd95477);
    this.player._gui_progress_ov = this.add.rectangle(0, 18, 16, 4, 0xaed5e5);
    this.player.add(this.player._gui_progress_bg);
    this.player.add(this.player._gui_progress_ov);
    
    this.enemy_group = this.physics.add.group();
    this.physics.add.collider(this.enemy_group, this.enemy_group, this.collideEnemyGroupBind.bind(this));
    this.physics.add.collider(this.player, this.enemy_group, this.collideEnemyToPlayerBind.bind(this));
    
    this.attack_to_enemy_group = this.add.group();
    this.physics.add.overlap(this.attack_to_enemy_group, this.enemy_group, this.overlapAttackToEnemyBind.bind(this));
    
    this.dropitem_group = this.physics.add.group();
    this.exp_group = this.physics.add.group();
    this.physics.add.overlap(this.exp_group, this.player, this.overlapGetExpBind.bind(this));
    
    //this.physics.add.sprite(0, 0, "sheet", 1);
    
    this.inputManager();
    this.gameTimer();
  }
  update() {
  }

  gameTimer() {
    this.game_run_ms = 0;
    this.game_timer = this.time.addEvent({
    delay: 10,
    callback: () => {
      this.game_run_ms += 10;
      
      if(this.game_run_ms % 100 === 0) {
        this.spawnEnemy();
      }
      
      if(this.game_run_ms % 500 === 0) {
        this.attackForEnemy();
      }
      
      if(this.game_run_ms % 500 === 0) {
        this.getExp();
        this.flipEnemy();
      }
    },
    loop: true
    });
  }
  // 敵の向きをプレイヤーの位置にあわせて変更する
  flipEnemy() {
    this.enemy_group.getMatching("visible", true).forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, enemy.getData("speed"));
      if(this.player.x > enemy.x) enemy.setFlipX(false);
      else enemy.setFlipX(true);
    });
  }
  dropExp(x, y) {
    const exp = this.physics.add.sprite(x, y, "item", 0)
      .setScale(0.4);
    this.exp_group.add(exp);
  }
  // 経験値吸い寄せる
  getExp() {
    this.exp_group.getMatching("visible", true).forEach(exp => {
      const dist = Phaser.Math.Distance.BetweenPoints(this.player, exp);
      if(dist >= this.player.getData("get_exp_area")) {
        exp.setVelocity(0, 0);
        return;
      }
      this.physics.moveToObject(exp, this.player, 100);
    });
  }
  overlapGetExpBind(player, exp) {
    this.exp_group.remove(exp);
    exp.destroy();
  }
  // 敵に対する攻撃
  attackForEnemy() {
    const enemy = this.physics.closest(this.player, this.enemy_group.getMatching("visible", true));
    if(!enemy) return;
    const rad = Phaser.Math.Angle.BetweenPoints(this.player, enemy);
    const bullet = this.physics.add.sprite(this.player.x, this.player.y, "item", 1);
    bullet.setScale(.2)
      .setData({
        speed: 500,
        damage: 100,
        critical: 0, // 0 / 0
        critical_damage: 1, // 1.2倍
        destroy: null // 何回目で壊れるか
      });
    this.attack_to_enemy_group.add(bullet);
    this.physics.moveToObject(bullet, enemy, bullet.getData("speed"));
  }
  // 敵スポーン
  spawnEnemy(id = 0) {
    const cnf = [{
      frame: 10,
      data: {
        speed: 20,
        helth: 100,
      }
    }];
    const pos = randRandomXY(this.player, 400, 500);
    const enemy = this.physics.add.sprite(pos.x, pos.y, "character", cnf[id].frame)
      .setCircle(6, 6, 6)
      .setPushable(false)
      .setData(cnf[id].data)
      .setDepth(100);
    this.enemy_group.add(enemy);
  }
  
  collideEnemyGroupBind() {
    // 敵同士の当たり判定
  }
  
  collideEnemyToPlayerBind(player, enemy) {
    // プレイヤーと敵の当たり判定
    this.enemy_group.remove(enemy);
    enemy.destroy();
    this.player.setData("helth", this.player.getData("helth") - 1);
    if(this.invTimeCircle?.visible) return;
    this.invTimeCircle = this.physics.add.sprite(player.x, player.y, "sheet", 2)
      .setCircle(16, 0, 0)
      .setAlpha(0)
      .setData({
        damage: 100,
        critical: null,
        critical_damage: 0,
        destroy: null
      });
    this.tweens.add({
      targets: this.invTimeCircle,
      scale: "+=8",
      duration: 200,
      repeat: 0,
      onComplete: () => {
        this.attack_to_enemy_group.remove(this.invTimeCircle);
        this.invTimeCircle.destroy();
      }
    });
    this.attack_to_enemy_group.add(this.invTimeCircle);
    this.simpleProgressUpdate();
  }
  
  overlayDamage(x, y, damage) {
    let group = [];
    `${damage}`.split("").forEach((v, i) => {
      const txt = this.add.sprite(x + (i * 16), y + -20, "number", v);
      txt.setDepth(400)
        .setScale(2)
      group.push(txt);
    });
    this.time.delayedCall(500, () => {
      group.forEach(v => v.destroy());
      group = [];
    });
  }
  
  overlapAttackToEnemyBind(attack, enemy) {
    // 攻撃と敵の当たり判定
    const helth = enemy.getData("helth");
    const { damage, critical, critical_damage, destroy } = attack.data.values;
    let _damage = damage,
      _helth = helth;
    if(critical !== null) {
      const random = Math.random() * critical | 0;
      if(random === 0) _damage = damage * critical_damage;
    }
    _helth -= _damage;
    enemy.setData({ helth: _helth });
    this.overlayDamage(enemy.x, enemy.y, _damage);
    if(_helth <= 0) {
      this.dropExp(enemy.x, enemy.y);
      this.enemy_group.remove(enemy);
      enemy.destroy();
    }
    if(destroy !== null) {
      if(destroy === 0) {
        this.attack_to_enemy_group.remove(attack);
        attack.destroy();
      } else {
        attack.setData({ destroy: destroy - 1 });
      }
    }
    
  }
  // HPバー
  simpleProgressUpdate() {
    const { helth, max_helth } = this.player.data.values,
      percent = Phaser.Math.Percent(helth, 0, max_helth),
      wpercenet = Phaser.Math.Percent(percent * 16, 0, 16);
      this.player._gui_progress_ov.width = 16 * wpercenet;
  }
  // 操作関連
  inputManager() {
    
    const mobile = () => {
      let start_pointer,
        timer_event,
        vecter;
      
      this.input.on("pointerdown", pointer => {
        const { x, y } = pointer.position;
        start_pointer = { x, y };
        Emitter.emit("pointer_down", pointer);
      });
      
      this.input.on("pointermove", pointer => {
        const { x: sx, y: sy } = start_pointer,
          { x: mx, y: my } = pointer.position,
          rad = Phaser.Math.Angle.Between(sx, sy, mx, my),
          deg = Phaser.Math.RadToDeg(rad);
          if(Phaser.Math.Distance.Between(sx, sy, mx, my) < 15) {
          this.player.body.setVelocity(0, 0);
          return;
        }
        if(deg === 0) return;
        if(deg > -22.5 && deg < 22.5) { // 右
          vecter = { x: 1, y: 0 };
        } else if(deg > 22.5 && deg < 67.5) { // 右下
          vecter = { x: 1, y: 1 };
        } else if(deg > 67.5 && deg < 112.5) { // 下
          vecter = { x: 0, y: 1 };
        } else if(deg > 112.5 && deg < 157.5) { // 左下
          vecter = { x: -1, y: 1 };
        } else if(deg > 157.5 || deg < -157.5) { // 左
          vecter = { x:-1, y: 0 };
        } else if(deg > -157.5 && deg < -112.5) { // 左上
          vecter = { x: -1, y: -1 };
        } else if(deg > -112.5 && deg < -67.5) { // 上
          vecter = { x: 0, y: -1 };
        } else if(deg > -67.5 && deg < -22.5) { // 右上
          vecter = { x: 1, y: -1 };
        }
        const ms = this.player.getData("move_speed");
        this.player.body.setVelocity(vecter.x * ms, vecter.y * ms);
        if(vecter.x === 1) this.player._body.setFlipX(false);
        else this.player._body.setFlipX(true);
        Emitter.emit("pointer_move", pointer);
      });
      
      this.input.on("pointerup", pointer => {
        Emitter.emit("pointer_up", pointer);
        const { x, y } = this.player.body.velocity;
        if((x | 0) === 0 && (y | 0) === 0) return;
        if(x | 0 !== 0) this.player.body.setVelocityX(0);
        if(y | 0 !== 0) this.player.body.setVelocityY(0);
      });
    };
    
    mobile();
    
  }
}


class Player {
  default_config = {
    move_speed: 100, // 移動速度
    helth: 100, // 体力
  }
  
  constructor(scene, config) {
    this.scene = scene;
  }
}
