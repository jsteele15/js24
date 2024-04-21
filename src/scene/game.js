import Phaser from '../lib/phaser.js'

///vars that need to be used across the file
let saved_movement_ind = 1
let cur_h_health = 100
let zombies_lost = 0
let timeMinutes = 0
let timeSeconds = 0
let timerText = null
let upgradeText = null
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
        this.ghost_zombie = null
        this.fast_zombie = null
        this.sheild_zombie = null
        this.bomb_zombie = null
        this.spit_zombie = null
        this.one_tough_zombie = null
        this.zombie_list = null
        this.left_list = null
        this.right_list = null

        this.animation_list = null
        this.bl = null
        this.alive = true
        this.bat_fired = false
        this.up_fired = false
        this.emitter = null
        this.upB = null

        //for buttons
        this.over_button = false
        this.nz = null
        this.gh = null
        this.bo = null
        this.sh = null
        this.fa = null
        this.otz = null
        this.button_list = []
        
        //current selected will include the curent zombie, and then the 'string name' then animation name
        this.current_selected = [this.ghost_zombie, 'ghost', 'bounce']
    }

    preload()
    {
        //this.load.image('base_zombie', '../res/test.jpg')
        //for the heros
        this.load.image('hero_1', '../res/hero.png')
        this.load.image('test_hero', '../res/test_hero.png')
        this.load.image('hero_3', '../res/hero_3.png')

        this.load.image('block', '../res/hit.png')
        this.load.image('parts', '../res/hit.png')
        this.load.image('upBack', '../res/upgrade_back.png')

        this.load.spritesheet('buttons', '../res/temp_buts.png',{
            frameWidth: 50,
            frameHeight: 50
        })

        this.load.spritesheet('base_zombie', '../res/Zombie 1 - basic walk.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('ghost', '../res/Ghost zombie.png', {
            frameWidth: 64,
            frameHeight: 64
        })
        
        this.load.spritesheet('fast', '../res/Fast zombie 2.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('sheild', '../res/Zombie shield.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('bomb', '../res/bomb zombie.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('spitter', '../res/spitter.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('one_tough', '../res/otz.png', {
            frameWidth: 64,
            frameHeight: 64
        })
        //test for the fast zombie
        //this.load.image('fast_z', '../res/fast_zombie.png')
    }

    create()
    {   
        this.upB = this.physics.add.sprite(300, 300, 'upBack')
        this.base_zombie = this.physics.add.group()
        this.ghost_zombie = this.physics.add.group()
        this.fast_zombie = this.physics.add.group()
        this.sheild_zombie = this.physics.add.group()
        this.bomb_zombie = this.physics.add.group()
        this.spit_zombie = this.physics.add.group()
        this.one_tough_zombie = this.physics.add.group()
        //heros
        this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
        //this.change_test = this.physics.add.sprite(50, 50, 'test_hero')
        //this.bl = this.physics.add.sprite(80, 80, 'block')
        this.bl = this.physics.add.group()
        
        this.zombie_list = [this.base_zombie, this.ghost_zombie, this.fast_zombie, this.sheild_zombie, this.bomb_zombie, this.spit_zombie, this.one_tough_zombie]
        this.current_selected = [this.base_zombie, 'base_zombie', 'walk', 3]
        this.animation_list = ['walk', 'bounce', 'sprint', 'hold']
        //for buttons
        this.nz = this.add.sprite(200, 590, 'buttons',0)
        this.gh = this.add.sprite(400, 590, 'buttons',1)
        this.fa = this.add.sprite(100, 590, 'buttons',2)
        this.sh = this.add.sprite(300, 590, 'buttons',3)
        this.bo = this.add.sprite(400, 590, 'buttons',4)
        this.sp = this.add.sprite(400, 590, 'buttons',5)
        this.ont = this.add.sprite(400, 590, 'buttons',6)

        this.gh.visible = false
        this.fa.visible = false
        this.sh.visible = false

        this.left_list = [this.gh, this.sh, this.sp]
        this.right_list = [this.fa, this.bo, this.ont]

        this.button_list = [this.nz]
        //this.otz = this.add.sprite(400, 400, 'buttons',5)

        this.button_actions(this.nz, [this.base_zombie, 'base_zombie', 'walk', 3])
        this.button_actions(this.gh, [this.ghost_zombie, 'ghost', 'bounce', 4])
        this.button_actions(this.fa, [this.fast_zombie, 'fast', 'sprint', 3])
        this.button_actions(this.sh, [this.sheild_zombie, 'sheild', 'hold', 2])
        this.button_actions(this.bo, [this.bomb_zombie, 'bomb', 'boom', 0])
        this.button_actions(this.sp, [this.spit_zombie, 'spitter', 'spit', 0])
        this.button_actions(this.ont, [this.one_tough_zombie, 'one_tough', 'stars', 0])
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
        
        
        //this.create_h(this.base_zombie, 'base_zombie', 0.1, 1, 150, 400, 'be_cool')
        //create_h(hero_1, 'hero_1', 1, 1)

        //here if the zombies hit the player the player dies straight away, will need to change later to reduce healthpulapulapula
        this.add_collision(this.zombie_list, this.hero_1)
        

        //collisions for the different kinds of zombies
        this.physics.add.collider(this.bl, this.base_zombie, zombie_hit, null, this);
        this.physics.add.collider(this.bl, this.ghost_zombie, zombie_hit, null, this);

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
        
    }

    update()
    {
        
        if(state === 'Battle'){
            if(this.bat_fired === false){
                
                if(level_num === 1){
                    //this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
                    this.change_butt_pos()
                }
                if(level_num === 2){
                    this.hero_1 = this.physics.add.sprite(10, 10, 'test_hero')
                    this.change_butt_pos()
                    
                    this.add_collision(this.zombie_list, this.hero_1)
                }
                if(level_num === 3){
                    this.hero_1 = this.physics.add.sprite(100, 100, 'hero_3')
                    this.change_butt_pos()
                    
                    this.add_collision(this.zombie_list, this.hero_1)
                }
                this.upB.visible = false
                this.alive = true
                cur_h_health = 100
                this.bat_fired = true
                this.up_fired = false
                if(upgradeText != null){
                    upgradeText.visible = false
                }
            }

            if(this.alive === true){
                followPath(this.hero_1, saved_movement_ind, [[100, 100],[500, 200], [600, 600], [100, 600], [300, 300]], 2)
            }

            //this sets the current time in the run
            timerText.setText(`${timeMinutes} : ${timeSeconds}`)
            
            //this changes the size of the heros health bar
            this.setValue(this.healthBar, cur_h_health, this.hero_1);

            //console.log(this.hero_1.x)
            for(let i = 0; i < this.zombie_list.length; i++){

            }

            //to make the zombies move and flip
            this.zombie_run(this.hero_1, this.base_zombie, 1)
            this.zombie_run(this.hero_1, this.ghost_zombie, 2)
            
        
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
               
                if(level_num < 3){
                    this.upB = this.physics.add.sprite(300, 200, 'upBack')
                    this.upB.visible = true
                    
                    for(let i = 0; i < this.button_list.length; i++){
                        this.button_list[i].visible = false
                    }

                    this.left_list[level_num-1].visible = true
                    this.right_list[level_num-1].visible = true
                    this.left_list[level_num-1].x = 300
                    this.right_list[level_num-1].x = 400

                    
                    upgradeText = this.add.text(200, 200, 'testing', {
                        fontFamily: 'Arial',
                        fontSize: '24px',
                        color: '#ffffff',
                    })
                    upgradeText.setOrigin(0.5);
                    upgradeText.setText('choose an upgrade')
                    upgradeText.visible = true

                    
                    level_num += 1
                    //this.hero_1 = null
                    this.bat_fired = false
                    //disable all the zombies on the screen
                    for(let z = 0; z < this.zombie_list.length; z++){
                        for(let i = 0; i < this.zombie_list[z].children.entries.length; i++){
                            this.zombie_list[z].children.entries[i].disableBody(true, true)
                            this.zombie_list[z].children.entries[i].health = 0
                    }}
                    this.up_fired = true
                }
                if(level_num >= 3){
                    this.upB = this.physics.add.sprite(300, 200, 'upBack')
                    this.upB.visible = true
                    upgradeText = this.add.text(200, 200, 'testing', {
                        fontFamily: 'Arial',
                        fontSize: '24px',
                        color: '#ffffff',
                    })
                    upgradeText.setOrigin(0.5);
                    upgradeText.setText('You won')

                    this.up_fired = true
                }
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
                zombies.children.entries[i].setFlipX(true)
            }
            if(zombies.children.entries[i].x > target.x){
                zombies.children.entries[i].x -= speed
                
            }
            if(zombies.children.entries[i].x < target.x){
                zombies.children.entries[i].x += speed
                zombies.children.entries[i].setFlipX(true)
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
        if(this.over_button === false){
            if(state === 'Battle'){
                if (pointer.leftButtonDown()) {
                    
                    //this.create_h(this.base_zombie, 'base_zombie', 0.1, 1, pointer.x, pointer.y, 'be_cool')
                    this.create_h(this.current_selected[0], this.current_selected[1], 1, this.current_selected[3], pointer.x, pointer.y, this.current_selected[2])
                    //this.create_h(this.ghost_zombie, 'ghost', 1, 1, pointer.x, pointer.y, 'bounce')
                    for(let i = 0; i < this.zombie_list.length; i++){
                        this.zombie_list[i].children.iterate(sprite => {
                            sprite.play(this.animation_list[i])
                        })
                    }
                    //this.ghost_zombie.children.iterate(sprite => {
                    //sprite.play(this.current_selected[2])});
                    
                    // Add any other logic you need here
                }}
           

    }}
    add_collision(z_list, hero){
        for(let i = 0; i < z_list.length; i++)
            this.physics.add.collider(z_list[i], hero, () => {
                //console.log("eaten")
                //this.alive = false
                //this.hero_1.destroy()
                if(cur_h_health > 0){
                    cur_h_health -= 1
                } else {
                    this.alive = false
                    console.log("it gets here")
                    hero.disableBody(true, true)
                }
            })
    }
    //this function creates a hord
    create_h(zombie, z_string, s, n, x, y, action_name){
        for (let i = 0; i < 1; i++){

            const b_z = zombie.create(x, y, z_string, i)
            b_z.health = 100
            b_z.scale = s
            b_z.hb = this.makeBar(x, y, 0x2ecc71);
            
            const body = b_z.body
            body.updateFromGameObject()
        }
        this.anims.create({
            key: action_name,
            frames: this.anims.generateFrameNumbers(z_string, { start: 0, end: n }),
            frameRate: 10,
            repeat: -1 // Infinite loop
        });

        //zombie.iterate(sprite => {
            //sprite.play(action_name); // Play the 'spin' animation for each sprite
        //});

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

    button_actions(button, s_list){
        button.setInteractive()
        button.on('pointerdown', ()=> {
            if(state === 'Battle'){
                this.current_selected = s_list
            }    
            if(state  === 'Upgrade'){
                this.button_list.push(button)
                state = 'Battle'
            }
                
        })

        button.on('pointerover', ()=> {
            this.over_button = true
            console.log("over")
        })

        button.on('pointerout', ()=>{
            this.over_button = false
            console.log("out")
        })
    }

    change_butt_pos(){
        for(let i = 0; i < this.left_list.length; i++){
            this.left_list[i].visible = false
        }
        for(let i = 0; i < this.right_list.length; i++){
            this.right_list[i].visible = false
        }
        for(let i = 0; i < this.button_list.length; i++){
            this.button_list[i].x = 100*[i+1]
            this.button_list[i].visible = true
            
        }
    }
}
