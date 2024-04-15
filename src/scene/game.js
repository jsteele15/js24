import Phaser from '../lib/phaser.js'

//this function creates a hord
const create_h = function(zombie, z_string, s, n, x, y){
    for (let i = 0; i < n; i++){

        const b_z = zombie.create(x, y, z_string)
        b_z.scale = s

        const body = b_z.body
        body.updateFromGameObject()
    }
}

//kills the zombies if it hits an object
const zombie_hit = function(col, zomb){
    zomb.disableBody(true, true);
}

//this is needed to work out where the zombies have to go
const zombie_run = function(target, zombies, speed){
    for(let i = 0; i < zombies.children.entries.length; i++){
        if(zombies.children.entries[i].x > target.x && zombies.children.entries[i].y > target.y){
            zombies.children.entries[i].x -= speed
            zombies.children.entries[i].y -= speed
        }
        if(zombies.children.entries[i].x < target.x && zombies.children.entries[i].y < target.y){
            zombies.children.entries[i].x += speed
            zombies.children.entries[i].y += speed
        }
        if(zombies.children.entries[i].x > target.x){
            zombies.children.entries[i].x -= speed
        }
        if(zombies.children.entries[i].x < target.x){
            zombies.children.entries[i].x += speed
        }
        if(zombies.children.entries[i].y > target.y){
            zombies.children.entries[i].y -= speed
        }
        if(zombies.children.entries[i].y < target.y){
            zombies.children.entries[i].y += speed
        }
    }
}

export default class Game extends Phaser.Scene{
    constructor()
    {
        super('game')
        this.hero_1 = null
        this.base_zombie = null
        this.alive = true
    }

    preload()
    {
        this.load.image('base_zombie', '../res/test.jpg')
        this.load.image('hero_1', '../res/hero.png')
        this.load.image('block', '../res/hit.png')
    }

    create()
    {
        this.base_zombie = this.physics.add.group()
        this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
        const bl = this.physics.add.sprite(80, 80, 'block')

        create_h(this.base_zombie, 'base_zombie', 0.1, 1, 150, 400)
        //create_h(hero_1, 'hero_1', 1, 1)

        //here if the zombies hit the player the player dies straight away, will need to change later to reduce health
        this.physics.add.collider(this.base_zombie, this.hero_1, () => {
            console.log("eaten")
            this.alive = false
            this.hero_1.destroy()
        })

        this.physics.add.overlap(bl, this.base_zombie, zombie_hit, null, this);
        //camera currently follows the player
        //this.cameras.main.startFollow(this.hero_1)
        this.input.on('pointerdown', this.handleLeftClick, this);
        
    }

    update()
    {
        if(this.alive === true){
            this.hero_1.setVelocityX(+20)
        }
        
        //console.log(this.hero_1.x)
        zombie_run(this.hero_1, this.base_zombie, 2)
        //this.base_zombie.setVelocityX(+20)

        

    }
    ///for handeling the left clicks, it will need to drop a zombie
    handleLeftClick(pointer) {
        if (pointer.leftButtonDown()) {
            console.log(pointer.x, pointer.y);
            create_h(this.base_zombie, 'base_zombie', 0.1, 1, pointer.x, pointer.y)
            // Add any other logic you need here
        }
    }
}

