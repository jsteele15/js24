import Phaser from '../lib/phaser.js'

//this function creates a hord
const create_h = function(zombie, z_string){
    for (let i = 0; i < 5; i++){
        const x = Phaser.Math.Between(80, 400)
        const y = 150*i

        const b_z = zombie.create(x, y, z_string)
        b_z.scale = 0.2

        const body = b_z.body
        body.updateFromGameObject()
    }
}

export default class Game extends Phaser.Scene{
    constructor()
    {
        super('game')
    }

    preload()
    {
        this.load.image('base_zombie', '../res/test.jpg')
    }

    create()
    {
        const base_zombie = this.physics.add.staticGroup()

        create_h(base_zombie, 'base_zombie')
        //for (let i = 0; i < 5; i++){
            //const x = Phaser.Math.Between(80, 400)
            //const y = 150*i

            //const b_z = base_zombie.create(x, y, 'base_zombie')
            //b_z.scale = 0.5

            //const body = b_z.body
            //body.updateFromGameObject()
        //}
    }
}