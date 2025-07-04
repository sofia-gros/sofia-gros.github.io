import Emitter from "../modules/Emitter.js";

export default class UIScene extends Phaser.Scene {
  constructor()
  {
    super({
      key: "UIScene"
    });
  }
  preload()
  {
  }
  create()
  {
    console.log("UIScene Create");
    
    this.mobile_input_gui();
  }
  
  mobile_input_gui() {
    this.gui_pointer_out = this.add.circle(0, 0, 30, 0xffffff)
      .setVisible(false)
      .setAlpha(0.2);
    Emitter.on("pointer_down", pointer => {
      this.gui_pointer_out.setVisible(true).setPosition(pointer.position.x, pointer.position.y);
    });
    Emitter.on("pointer_up", pointer => {
      this.gui_pointer_out.setVisible(false);
    });
  }
}