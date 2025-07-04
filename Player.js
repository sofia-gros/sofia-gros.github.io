export default class Player {
  constructor(scene)
  {
    this.scene = scene;
  }
  init(props = {})
  {
    const { helth, speed, exp, level } = props;
    this.player = this.scene.physics.add.sprite(0, 0, "sheet", 0);
    this.player.setCircle(16);
    this.player.setData({ helth, speed, exp, level });
    return this;
  }
  area(radius = 100)
  {
    this.playerAreaGroup = this.physics.add.group();
    this.playerExpArea = this.add.graphics({ x: 0, y: 0, fillStyle: { color: 0xffffff, alpha: .2 } });
    this.playerExpArea.fillCircleShape({x: 0, y: 0, radius });
    this.playerAreaGroup.add(this.playerExpArea);
    return this;
  }
  exp
  setVelocity(x, y)
  {
    this.player.setVelocity(x, y);
    this.playerAreaGroup.setVelocity(x, y);
    return this;
  }
  get gameObject()
  {
    return this.player;
  }
  get allGameObject()
  {
    return { player: this.player, area: this.playerAreaGroup };
  }
}