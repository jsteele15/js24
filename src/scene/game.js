import Phaser from '../lib/phaser.js'

///vars that need to be used across the file
let saved_movement_ind = 1
let cur_h_health = 100
let zombies_lost = 0
let timeMinutes = 0
let timeSeconds = 0
let timerText = null
let level_num = 1

//state machine for inside the class, im thinking, Menu, Upgrade, Battle
let state = 'Battle'
//kills the zombies if it hits an object
const zombie_hit = function(col, zomb){
    if(zomb.health >= 1){
        zomb.health -= 50
    } 
    if(zomb.health <= 1) {
        zomb.disableBody(true, true);
        zombies_lost += 1
    }
    
    col.disableBody(true, true);
    
}


///work on movement ai for the hero
const followPath = function(hero, s_ind ,target, speed){
    if(hero.x < target[s_ind][0]){
        hero.x += speed
    }
    if(hero.y < target[s_ind][1]){
        hero.y += speed
    }
    if(hero.x > target[s_ind][0]){
        hero.x -= speed
    }
    if(hero.y > target[s_ind][1]){
        hero.y -= speed
    }
    if(hero.x === target[s_ind][0] && hero.y === target[s_ind][1]){
        saved_movement_ind = Phaser.Math.Between(0, target.length-1)
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
        }
    }
}

export default class Game extends Phaser.Scene{
    constructor()
    {
        super('game')
        this.hero_1 = null
        this.change_test = null
        this.hero_list = [this.hero_1, null, null, null, null, null, null, null, null]
        this.healthBar = null
        this.base_zombie = null
        this.bl = null
        this.alive = true
        this.bat_fired = false
        this.up_fired = false
        this.emitter = null
        this.upB = null
        
        //current selected will include the curent zombie, and then the 'string name'
        this.current_selected = [null, null]
    }

    preload()
    {
        this.load.image('base_zombie', '../res/test.jpg')
        //for the heros
        this.load.image('hero_1', '../res/hero.png')
        this.load.image('test_hero', '../res/test_hero.png')
        this.load.image('hero_3', '../res/hero_3.png')

        this.load.image('block', '../res/hit.png')
        this.load.image('parts', '../res/hit.png')
        this.load.image('upBack', '../res/upgrade_back.png')
        //test for the fast zombie
        //this.load.image('fast_z', '../res/fast_zombie.png')
    }

    create()
    {
        this.base_zombie = this.physics.add.group()
        //heros
        this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
        //this.change_test = this.physics.add.sprite(50, 50, 'test_hero')
        //this.bl = this.physics.add.sprite(80, 80, 'block')
        this.bl = this.physics.add.group()
        

        //particles, dont need just yet
        //let particles = this.add.particles('parts')
        //let particles = this.add.particles('parts')
        
        //this is for creating particle, it cannot be used to directly interact with game objects, but i could use them to make the game more juicy
        //this.emitter = this.add.particles(199, 300, 'parts', {
            //angle: {min: -30, max: 30},
            //speed:150
        //});

        //this.emitter.setPosition(100, 100);
        //this.emitter.setFrequency(1000, 200);


        //test for the zombie
        //const fast_zombie = this.physics.add.sprite(200, 64, 'fast_z')

        this.create_h(this.base_zombie, 'base_zombie', 0.1, 1, 150, 400)
        //create_h(hero_1, 'hero_1', 1, 1)

        //here if the zombies hit the player the player dies straight away, will need to change later to reduce healthpulapulapula
        this.physics.add.collider(this.base_zombie, this.hero_1, () => {
            //console.log("eaten")
            //this.alive = false
            //this.hero_1.destroy()
            if(cur_h_health > 0){
                cur_h_health -= 1
            } else {
                this.alive = false
                console.log("it gets here")
                this.hero_1.disableBody(true, true)
            }
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

        //to count how long it takes to defeat the heros
        timerText = this.add.text(320, 30, 'testing', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
        })
        timerText.setOrigin(0.5);
        
        const myClock = this.time.addEvent({
            delay: 1000, 
            callback: this.updateClock,
            callbackScope: this,
            loop: true, // Repeat indefinitely
        });
        this.healthBar = this.makeBar(this.hero_1.x, this.hero_1.y, 0x2ecc71);
        this.upB = this.physics.add.sprite(300, 300, 'upBack')
    }

    update()
    {
        
        if(state === 'Battle'){
            if(this.bat_fired === false){
                if(level_num === 1){
                    //this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
                }
                if(level_num === 2){
                    this.hero_1 = this.physics.add.sprite(10, 10, 'test_hero')
                    
                    this.physics.add.collider(this.base_zombie, this.hero_1, () => {

                        if(cur_h_health > 0){
                            cur_h_health -= 1
                        } else {
                            this.alive = false
                            this.hero_1.destroy()
                        }
                    })
                }
                if(level_num === 3){
                    this.hero_1 = this.physics.add.sprite(100, 100, 'hero_3')
                    
                    this.physics.add.collider(this.base_zombie, this.hero_1, () => {
                        if(cur_h_health > 0){
                            cur_h_health -= 1
                        } else {
                            this.alive = false
                            this.hero_1.destroy()
                        }
                    })
                }
                this.upB.visible = false
                this.alive = true
                cur_h_health = 100
                this.bat_fired = true
                this.up_fired = false
            }
            
            if(this.alive === true){
                followPath(this.hero_1, saved_movement_ind, [[100, 100],[500, 200], [600, 600], [100, 600], [300, 300]], 2)
            }

            //this sets the current time in the run
            timerText.setText(`${timeMinutes} : ${timeSeconds}`)
            
            //this changes the size of the heros health bar
            this.setValue(this.healthBar, cur_h_health, this.hero_1);

            //console.log(this.hero_1.x)
            this.zombie_run(this.hero_1, this.base_zombie, 2)
            //this.base_zombie.setVelocityX(+20)
        
            //this works out where the bullets are in relation to the hero, if it ever leaves the square around the hero itll stop the bullet
            //this enables the screen not to get clogged up with stuff
            //probably better off moving this too a function but will keep this for now and move it on saturday
            for(let i = 0; i < this.bl.children.entries.length; i++){
                if(this.bl.children.entries[i].x < this.hero_1.x+200 && this.bl.children.entries[i].x > this.hero_1.x-200 && this.bl.children.entries[i].y < this.hero_1.y+200 && this.bl.children.entries[i].y > this.hero_1.y-200){
                    
                }  else {
                    this.bl.children.entries[i].disableBody(true, true);
                }
                if (this.alive === 'false'){
                    this.bl.children.entries[i].disableBody(true, true);
                }
            }
            //console.log(this.bl.children.entries)
        

            if(cur_h_health <= 0){
                
                state = 'Upgrade'
            }
        }
        if(state === 'Upgrade'){
            if(this.up_fired === false){
                this.upB = this.physics.add.sprite(300, 300, 'upBack')
                this.upB.visible = true
                level_num += 1
                //this.hero_1 = null
                this.bat_fired = false
                //disable all the zombies on the screen
                for(let i = 0; i < this.base_zombie.children.entries.length; i++){
                    this.base_zombie.children.entries[i].disableBody(true, true)
                    this.base_zombie.children.entries[i].health = 0
                }
                this.up_fired = true
            }
            

        }
    }

    //this is needed to work out where the zombies have to go
    zombie_run(target, zombies, speed){
        
        for(let i = 0; i < zombies.children.entries.length; i++){
            
            this.setValue(zombies.children.entries[i].hb, zombies.children.entries[i].health, zombies.children.entries[i]);

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
    ///for handeling the left clicks, it will need to drop a zombie
    handleLeftClick(pointer) {
        if(state === 'Battle'){
            if (pointer.leftButtonDown()) {
                this.create_h(this.base_zombie, 'base_zombie', 0.1, 1, pointer.x, pointer.y)
                // Add any other logic you need here
            }}
        if(state === 'Upgrade'){
            state = 'Battle'
        }

    }
    //this function creates a hord
    create_h(zombie, z_string, s, n, x, y){
        for (let i = 0; i < n; i++){

            const b_z = zombie.create(x, y, z_string)
            b_z.health = 100
            b_z.scale = s
            b_z.hb = this.makeBar(x, y, 0x2ecc71);
            
            const body = b_z.body
            body.updateFromGameObject()
        }
    }
    ///firing the heros weapon
    fireWeapon(){
        if(this.alive === true && state === 'Battle'){
            fireProjectile(this.bl, this.hero_1.x, this.hero_1.y, "random")
        }
    }

    makeBar(x, y, color) {
        // Draw the bar
        let bar = this.add.graphics();
        bar.fillStyle(color, 1);
        bar.fillRect(0, 0, 60, 10);

        // Position the bar
        bar.x = x;
        bar.y = y;

        // Return the bar
        return bar;
    }

    setValue(bar, percentage, char) {
        // Scale the bar based on the percentage
        bar.scaleX = percentage / 100;
        bar.x = char.x - 30
        bar.y = char.y - 50
    }

    //after defeating a hero, get  choice of an upgrade
    chooseUpgrade(){

    }

    updateClock(){
        if(state === 'Battle'){
            if(timeSeconds+1 === 60){
                timeMinutes += 1
                timeSeconds = 0
            } else {
                timeSeconds += 1
            }
        }
        //console.log(timeMinutes, ":", timeSeconds)
    }
}
