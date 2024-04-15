import Phaser from './lib/phaser.js'
import Game from './scene/game.js'


export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    scene: Game,
    physics: {
        default: 'arcade',
        arcade:{
            gravity: {
                y: 200
            },
            debug: true
        }
    }
})

console.dir(Phaser)

console.log("working")