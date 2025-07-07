import Emitter from "./game/modules/Emitter.js";

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const jumpButton = document.getElementById("jump");

// 状態フラグを保持
const inputState = {
  isLeft: false,
  isRight: false,
  isJump: false
};

// 押下状態を更新する関数
function updateInputState() {
  Emitter.emit("isLeft", inputState.isLeft);
  Emitter.emit("isRight", inputState.isRight);
  Emitter.emit("isJump", inputState.isJump);

  requestAnimationFrame(updateInputState);
}
requestAnimationFrame(updateInputState);

// 各ボタンにイベントを設定
leftButton.addEventListener("pointerdown", () => {
  inputState.isLeft = true;
});
leftButton.addEventListener("pointerup", () => {
  inputState.isLeft = false;
});
leftButton.addEventListener("pointercancel", () => {
  inputState.isLeft = false;
});

rightButton.addEventListener("pointerdown", () => {
  inputState.isRight = true;
});
rightButton.addEventListener("pointerup", () => {
  inputState.isRight = false;
});
rightButton.addEventListener("pointercancel", () => {
  inputState.isRight = false;
});

jumpButton.addEventListener("pointerdown", () => {
  inputState.isJump = true;
});
jumpButton.addEventListener("pointerup", () => {
  inputState.isJump = false;
});
jumpButton.addEventListener("pointercancel", () => {
  inputState.isJump = false;
});