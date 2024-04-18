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
    col.disableBody(true, true);
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

const followPath = function(hero, target){
    if(hero.x < target[0]){
        hero.x += 2
    }
}

const fireProjectile = function(bl, x, y, type){
    //you can change the type of fire rate by changing the type
    const thresholdY = 300;
    if(type === "random"){
        const choices = [200, -200, 100, -100]
        const bullet = bl.create(x, y, 'block')
        bullet.setVelocityY(Phaser.Math.RND.pick(choices))
        bullet.setVelocityX(Phaser.Math.RND.pick(choices))

        //this doesnt work, im too tired to get it working
        if(bl.y > thresholdY){
            bl.disableBody(true, true);
            console.log("hfrheui")
        }
    }
}

export default class Game extends Phaser.Scene{
    constructor()
    {
        super('game')
        this.hero_1 = null
        this.base_zombie = null
        this.bl = null
        this.alive = true
        this.fired = false
        this.emitter = null
        //current selected will include the curent zombie, and then the 'string name'
        this.current_selected = [null, null]
    }

    preload()
    {
        this.load.image('base_zombie', '../res/test.jpg')
        this.load.image('hero_1', '../res/hero.png')
        this.load.image('block', '../res/hit.png')
        this.load.image('parts', '../res/hit.png')
        //test for the fast zombie
        //this.load.image('fast_z', '../res/fast_zombie.png')
    }

    create()
    {
        this.base_zombie = this.physics.add.group()
        this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
        //this.bl = this.physics.add.sprite(80, 80, 'block')
        this.bl = this.physics.add.group()
        
        //let particles = this.add.particles('parts')
        //let particles = this.add.particles('parts')
        
        //this is for creating particle, it cannot be used to directly interact with game objects, but i could use them to make the game more juicy
        this.emitter = this.add.particles(199, 300, 'parts', {
            angle: {min: -30, max: 30},
            speed:150
        });

        this.emitter.setPosition(100, 100);
        this.emitter.setFrequency(1000, 200);
        //test for the zombie
        //const fast_zombie = this.physics.add.sprite(200, 64, 'fast_z')

        create_h(this.base_zombie, 'base_zombie', 0.1, 1, 150, 400)
        //create_h(hero_1, 'hero_1', 1, 1)

        //here if the zombies hit the player the player dies straight away, will need to change later to reduce healthpulapulapula
        this.physics.add.collider(this.base_zombie, this.hero_1, () => {
            //console.log("eaten")
            this.alive = false
            this.hero_1.destroy()
        })
        
        this.physics.add.collider(this.bl, this.base_zombie, zombie_hit, null, this);
        //camera currently follows the player
        //this.cameras.main.startFollow(this.hero_1)
        this.input.on('pointerdown', this.handleLeftClick, this);

        //timer for the weapons
        const timer = this.time.addEvent({
            delay: 100,
            callback: this.fireWeapon,
            callbackScope: this,
            loop: true


        
        });

        
    }

    update()
    {
        if(this.alive === true){
            followPath(this.hero_1, [500, 200])
        }
        
        //console.log(this.hero_1.x)
        zombie_run(this.hero_1, this.base_zombie, 2)
        //this.base_zombie.setVelocityX(+20)

        //this works out where the bullets are in relation to the hero, if it ever leaves the square around the hero itll stop the bullet
        //this enables the screen not to get clogged up with stuff
        //probably better off moving this too a function but will keep this for now and move it on saturday
        for(let i = 0; i < this.bl.children.entries.length; i++){
            if(this.bl.children.entries[i].x < this.hero_1.x+200 && this.bl.children.entries[i].x > this.hero_1.x-200 && this.bl.children.entries[i].y < this.hero_1.y+200 && this.bl.children.entries[i].y > this.hero_1.y-200){
                
            } else {
                this.bl.children.entries[i].disableBody(true, true);
            }
        }
        //console.log(this.bl.children.entries)
        if(this.bl.x > 200){
            this.bl.disableBody(true, true)
        }
        
    }

    ///for handeling the left clicks, it will need to drop a zombie
    handleLeftClick(pointer) {
        if (pointer.leftButtonDown()) {
            console.log(pointer.x, pointer.y);
            create_h(this.base_zombie, 'base_zombie', 0.1, 1, pointer.x, pointer.y)
            // Add any other logic you need here
        }
    }

    ///firing the heros weapon
    fireWeapon(){
        if(this.alive === true){
            fireProjectile(this.bl, this.hero_1.x, this.hero_1.y, "random")
        }
    }
}
