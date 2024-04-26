import Phaser from './lib/phaser.js'
import Game from './scene/game.js'


export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    scene: Game,
    scale: {
        
        mode: Phaser.Scale.FIT, 
        // Fit to window
        //mode: Phaser.Scale.ENVELOP, //will work for the actual game, theres still a border on the top though
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center both vertically and horizontally
        
    },
    
    physics: {
        default: 'arcade',
        arcade:{
            gravity: {
                y: 0
            },
            
        }
    }
})

console.dir(Phaser)
