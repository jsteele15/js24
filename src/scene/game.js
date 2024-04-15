import Phaser from '../lib/phaser.js'

export default class Game extends Phaser.Scene{
    constructor()
    {
        super('game')
    }

    preload()
    {
        this.load.image('background', '../res/test.jpg')
    }

    create()
    {
        this.add.image(240, 320, 'background')
    }
}