import Phaser from './lib/phaser.js'
import Game from './scene/game.js'


export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    scene: Game
})

console.dir(Phaser)

console.log("working")