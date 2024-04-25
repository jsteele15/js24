import Phaser from '../lib/phaser.js'
import {Cut_scene, Main_menu} from './cutscene.js'


///vars that need to be used across the file
let saved_movement_ind = 1
let path = null
let pat = null
let cur_h_health = 100
let zombies_lost = 0
let timeSeconds = 100
let timerText = null
let upgradeText = null
let scoreText = null
let loseText = null
let level_num = 1
let hero_speed = 2
let base_speed = 1
let score = 0
//max for zombies

//state machine for inside the class, im thinking, Menu, Upgrade, Battle
let state = 'Main_menu'

//attack for the zombies
const attack_hero = function(hero, z_list){
    
    if(cur_h_health > 0){
        if(z_list.name === "bomb"){
            cur_h_health -= 50
            z_list.health -= 100
        } 
        if(z_list.name === "fast"){
            cur_h_health -= 1
        } 
        if(z_list.name === "spitter"){
            hero_speed = 1
        }
        else {
            cur_h_health -= 2
        }
    } else {
        this.bite.play()
        this.alive = false
        hero.disableBody(true, true)
    }
    if(hero.x <= z_list.x && hero.y <= z_list.y){
        z_list.x += 30
        z_list.y += 30
    }
    if(hero.x > z_list.x && hero.y <= z_list.y){
        z_list.x -= 30
        z_list.y += 30
    }
    if(hero.x <= z_list.x && hero.y > z_list.y){
        z_list.x += 30
        z_list.y -= 30
    }
    if(hero.x > z_list.x && hero.y > z_list.y){
        z_list.x -= 30
        z_list.y -= 30
    }
    
}

//kills the zombies if it hits an object



const any_alive = function(zombie_list){
    for(let z = 0; z < zombie_list.length; z++){
        for(let i = 0; i < zombie_list[z].children.entries.length; i++){
            if(zombie_list[z].children.entries[i].health > 0){
                return true
    
    return false
}}}}

///work on movement ai for the hero
const followPath = function(hero, s_ind ,target, speed, pattern){

    //let deltaX =  target[s_ind][0] - hero.x;
    //let deltaY =  target[s_ind][1] - hero.y;

    //hero.setVelocity(deltaX *= speed, deltaY*= speed);

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
    
    if(pattern === 'rand'){
        
        if(Math.round(hero.x) === target[s_ind][0] && Math.round(hero.y) === target[s_ind][1]){
            saved_movement_ind = Phaser.Math.Between(0, target.length-1)
        }
    }
    if(pattern === 'top'){

        if(hero.x === target[s_ind][0] && hero.y === target[s_ind][1]){
            if(s_ind === 0){
                saved_movement_ind = 1
            } else {
                saved_movement_ind = 0
            }
            
        }
    }
    if(pattern === 'perimiter'){
        if(hero.x === target[s_ind][0] && hero.y === target[s_ind][1]){
            if(s_ind < 3){
                saved_movement_ind += 1
            } else {
                saved_movement_ind = 0
            }

    }}
    if(pattern === 'center'){

    }
}

const fireProjectile = function(proj, x, y, type, zombie_list){
    //you can change the type of fire rate by changing the type
    const thresholdY = 300;
    if(type === "rand"){
        const choices = [200, -200]
        const bomb = proj.create(x, y, 'dino')
        bomb.setVelocityY(Phaser.Math.RND.pick(choices))
        bomb.setVelocityX(Phaser.Math.RND.pick(choices))

    }
    if(type === "top"){
        const light1 = proj.create(x - 15, y, 'block')
        const light2 = proj.create(x, y, 'block')
        const light3 = proj.create(x + 15, y, 'block')
        const l_list = [light1, light2, light3]
        
        for(let i = 0; i <l_list.length; i++){
            l_list[i].setVelocityY(500)
        }
    }
    if(type === "center"){
        let saved_dist = 0
        let saved_ind_z = 0
        let saved_ind_i = 0

        for(let z = 0; z < zombie_list.length; z++){
            for(let i = 0; i < zombie_list[z].children.entries.length; i++){
                if(zombie_list[z].children.entries[i].health > 0){
                    let combo = 0
                    if(zombie_list[z].children.entries[i].x > -1){
                        combo += zombie_list[z].children.entries[i].x
                    }
                    if(zombie_list[z].children.entries[i].x < 0){
                        let rev = Math.abs(zombie_list[z].children.entries[i].x)
                        combo += rev
                    }
                    if(zombie_list[z].children.entries[i].y > -1){
                        combo += zombie_list[z].children.entries[i].y
                    }
                    if(zombie_list[z].children.entries[i].y < 0){
                        let rev = Math.abs(zombie_list[z].children.entries[i].y)
                        combo += rev
                    }
                    if(combo > saved_dist){
                        saved_dist = combo
                        saved_ind_z = z
                        saved_ind_i = i
                    }
                }        
        }}
        let deltaX = zombie_list[saved_ind_z].children.entries[saved_ind_i].x - x;
        let deltaY = zombie_list[saved_ind_z].children.entries[saved_ind_i].y - y;

        let fireing = any_alive(zombie_list)
        let speed_factor = 4
        if(fireing === true){
            const bull = proj.create(x, y, 'bullet')
            bull.setVelocity(deltaX *= speed_factor, deltaY*= speed_factor);
            bull.body.immovable = true;
        }
    }
    if(type === "perimiter"){
        //const sword = proj.create(x, y, 'sword')
        //sword.rotation = 1
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
        this.tiles = null
        this.inside_ex = false
        
        this.title = null
        this.start = null
        this.building = null
        this.tutorial_fired = false

        this.jaw = null
        this.skull = null
        this.inside = null
        this.eyes = null
        this.behind = null
        this.skull_parts = null
        this.movement_eyes = 'right'
        this.stut = null
        this.ptut = null

        this.base_max = 10
        this.ghost_max = 5
        this.fast_max = 5
        this.sheild_max = 3
        this.bomb_max = 3
        this.spit_max = 3
        this.otz_max = 1

        //current
        this.base_cur =  0
        this.ghost_cur = 0
        this.fast_cur = 0
        this.sheild_cur = 0
        this.bomb_cur = 0
        this.spit_cur = 0
        this.otz_cur = 0
        
        

        this.main_menu_zombies = null
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
        this.lose_fired = false
        this.emitter = null
        this.upB = null
        this.sword = null

        //for buttons
        this.over_button = false
        this.exclusion = null
        this.nz = null
        this.gh = null
        this.bo = null
        this.sh = null
        this.fa = null
        this.otz = null
        this.button_list = []
        
        //for upgrades
        this.choose_upgrade = null
        this.ghost_tool = null
        this.bomb_tool = null
        this.sheild_tool = null
        this.fast_tool = null
        this.spit_tool = null
        this.otz_tool = null
        this.tool_tips = null

        this.win_text = null

        //for sounds
        this.spawn = null
        this.bite = null
        this.click = null

        //for timers
        this.timer = null
        this.emitter_timer = null
        //current selected will include the curent zombie, and then the 'string name' then animation name
        this.current_selected = [this.ghost_zombie, 'ghost', 'bounce']
    }

    preload()
    {   
        //for audio 
        this.load.audio('background_track', './res/track.mp3')
        this.load.audio('spawn', './res/spawn.mp3')
        this.load.audio('bite', './res/bite.mp3')
        this.load.audio('click', './res/click.mp3')
        //win text
        this.load.image('win_text', './res/win_text.png')

        //particles
        this.load.image('parts', './res/parts.png')

        //tool tipes
        this.load.image('choose_upgrade', './res/cau.png')
        this.load.image('ghost_tool', './res/ghost_tool.png')
        this.load.image('bomb_tool', './res/bomb_tool.png')
        this.load.image('fast_tool', './res/fast_tool.png')
        this.load.image('spit_tool', './res/spit_tool.png')
        this.load.image('sheild_tool', './res/sheild_tool.png')
        this.load.image('otz_tool', './res/otz_tool.png')

        //start
        this.load.image('start_but', './res/start.png')
        this.load.image('title_card', './res/title.png')
        this.load.image('build', './res/Overlay - abdoned house.png')

        //cutscene
        this.load.image('jaw', './res/jaw.png')
        this.load.image('skull', './res/skull.png')
        this.load.image('inside', './res/inside.png')
        this.load.image('eyes', './res/eyes.png')
        this.load.image('behind', './res/behind_skull.png')
        this.load.image('text_scroll', './res/text_scroll.png')
        this.load.image('stut', './res/skip_tutorial.png')
        this.load.image('ptut', './res/play_tutorial.png')

        //tutorial
        this.load.image('tt1', './res/tut_text_1.png')
        this.load.image('tt2', './res/tut_text_2.png')
        this.load.image('tt3', './res/tut_text_3.png')

        //TILES
        this.load.image('tile1', './res/Background tile 1.png')
        this.load.image('tile2', './res/Background tile 2.png')
        this.load.image('tile3', './res/Background tile 3.png')
        this.load.image('tile4', './res/Background tile 4.png')
        this.load.image('tile5', './res/Background tile 5.png')
        
        //this.load.image('base_zombie', '../res/test.jpg')
        //for the heros
        this.load.image('exc', './res/exclusion.png')

        this.load.spritesheet('little_girl', './res/Tutorial girl.png',{
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('hero_bomb', './res/Hero - bomb.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('hero_shotgun', './res/Hero - shotgun.png', {
            frameWidth: 64,
            frameHeight: 64
        })
        
        this.load.spritesheet('hero_sword', './res/Hero - sword boi.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.image('hero_1', './res/hero.png')
        this.load.image('test_hero', './res/test_hero.png')
        this.load.image('hero_3', './res/hero_3.png')

        //the sprites for the amunition
        this.load.image('block', './res/hit.png')
        this.load.image('dino', './res/dino.png')
        this.load.image('sword', './res/light_sword.png')
        this.load.image('bullet', './res/bullet.png')

        this.load.image('upBack', './res/upgrade_back.png')

        //the sprite sheets for buttons
        this.load.spritesheet('buttons', './res/icons_zom.png',{
            frameWidth: 64,
            frameHeight: 64
        })


        //the spritesheets for the zombies
        this.load.spritesheet('base_zombie', './res/Zombie 1 - basic walk.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('ghost', './res/Ghost zombie.png', {
            frameWidth: 64,
            frameHeight: 64
        })
        
        this.load.spritesheet('fast', './res/Fast zombie 2.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('sheild', './res/Zombie shield.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('bomb', './res/bomb zombie.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('spitter', './res/spitter.png', {
            frameWidth: 64,
            frameHeight: 64
        })

        this.load.spritesheet('one_tough', './res/otz.png', {
            frameWidth: 64,
            frameHeight: 64
        })
        //test for the fast zombie
        //this.load.image('fast_z', '../res/fast_zombie.png')
    }

    create()
    {   
        const backgroundMusic = this.sound.add('background_track', { volume: 0.5 });
        backgroundMusic.loop = true;
        backgroundMusic.play();

        this.spawn = this.sound.add('spawn')
        this.bite = this.sound.add('bite')
        this.click = this.sound.add('click')

        this.anims.create({
                key: 'bobbing',
                frames: this.anims.generateFrameNumbers('little_girl', { start: 0, end: 1 }),
                frameRate: 10,
                repeat: -1 // Infinite loop
        });
        this.anims.create({
                key: 'throwing',
                frames: this.anims.generateFrameNumbers('hero_bomb', { start: 0, end: 4 }),
                frameRate: 10,
                repeat: -1 // Infinite loop
        });
        this.anims.create({
                key: 'blasting',
                frames: this.anims.generateFrameNumbers('hero_shotgun', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1 // Infinite loop
        });
        this.anims.create({
                key: 'swording',
                frames: this.anims.generateFrameNumbers('hero_sword', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1 // Infinite loop
        });
        //tiles
        this.tiles = this.physics.add.group()
        let tile_list = ['tile1', 'tile2', 'tile3', 'tile4', 'tile5']
        for(let r = 0; r < 15; r++){
            for(let c = 0; c < 15; c++){
                const randomInt = Math.floor(Math.random() * 4)
                let tile1 = this.tiles.create(64*r, 64*c, tile_list[randomInt])
                //tile1.setScale(10)
            }
        }
        
        this.upB = this.physics.add.sprite(300, 300, 'upBack')
        this.win_text = this.physics.add.sprite(450, 100, 'win_text')
        this.win_text.visible = false
        this.choose_upgrade = this.physics.add.sprite(450, 100, 'choose_upgrade')
        this.ghost_tool = this.physics.add.sprite(480, 200, 'ghost_tool')
        this.bomb_tool = this.physics.add.sprite(480, 300, 'bomb_tool')
        this.fast_tool = this.physics.add.sprite(480, 200, 'fast_tool')
        this.spit_tool = this.physics.add.sprite(480, 200, 'spit_tool')
        this.sheild_tool = this.physics.add.sprite(480, 300, 'sheild_tool')
        this.otz_tool = this.physics.add.sprite(480, 300, 'otz_tool')

        this.tool_tips = [this.choose_upgrade, this.ghost_tool, this.bomb_tool, this.sheild_tool, this.fast_tool, this.spit_tool, this.otz_tool]
        for(let i = 0; i < this.tool_tips.length; i++){
            this.tool_tips[i].visible = false
        }

        //tutorial
        this.tt1 = this.physics.add.sprite(400, 480,'tt1')
        this.tt2 = this.physics.add.sprite(320, 70,'tt2')
        this.tt3 = this.physics.add.sprite(170, 250,'tt3')
        this.tt1.visible = false
        this.tt2.visible = false
        this.tt3.visible = false


        //amunition objects
        this.bl = this.physics.add.group()
        this.di = this.physics.add.group()
        this.sw = this.physics.add.group()
        this.bu = this.physics.add.group()
        //heros

        this.exclusion = this.physics.add.sprite(310, 100, 'exc')
        this.exclusion.visible = false
        
        this.hero_1 = this.physics.add.sprite(350, -4000, 'hero_1')

        //main_ menu
        this.main_menu_zombies = this.physics.add.group()
        let list_zombies = ['base_zombie', 'ghost', 'fast', 'fast', 'sheild', 'bomb', 'spitter', 'one_tough']
        this.building = this.physics.add.sprite(320, 500, 'build')
        for(let i = 0; i < 20; i++){
            for(let c = 0; c < 24; c++){
                const randomInt = Math.floor(Math.random() * 8)
                this.main_menu_zombies.create(35*i, 800+(30*c), list_zombies[randomInt])
            }
        }
        this.emitter = this.add.particles(199, 300, 'parts', {
            //angle: {min: -30, max: 30},
            scale: { start:1 , end: 0},
            speed:50
        });
        this.emitter.stop()

        this.start = this.physics.add.sprite(320, -20, 'start_but')
        this.title = this.physics.add.sprite(320, -200, 'title_card')
        
        this.stut = this.physics.add.sprite(175, -50, 'stut')
        this.ptut = this.physics.add.sprite(475, -50, 'ptut')

        this.button_actions(this.start, [], [])
        this.button_actions(this.stut, 1, [])
        this.button_actions(this.ptut, 2, [])

        //cut scene
        this.behind = this.physics.add.sprite(200, -100, 'behind')
        this.eyes = this.physics.add.sprite(200, -100, 'eyes')
        this.inside = this.physics.add.sprite(200, -100, 'inside')
        this.skull = this.physics.add.sprite(200, -100, 'skull')
        this.jaw = this.physics.add.sprite(200, -100, 'jaw')
        this.skull_parts = [this.behind, this.eyes, this.inside, this.skull, this.jaw]
        this.text_scroll = this.physics.add.sprite(450, -300, 'text_scroll')
        this.text_scroll.visible = false
        

        //zombies
        this.base_zombie = this.physics.add.group()
        this.ghost_zombie = this.physics.add.group()
        this.fast_zombie = this.physics.add.group()
        this.sheild_zombie = this.physics.add.group()
        this.bomb_zombie = this.physics.add.group()
        this.spit_zombie = this.physics.add.group()
        this.one_tough_zombie = this.physics.add.group()
        
        this.zombie_list = [this.base_zombie, this.ghost_zombie, this.fast_zombie, this.sheild_zombie, this.bomb_zombie, this.spit_zombie, this.one_tough_zombie]
        this.current_selected = [this.base_zombie, 'base_zombie', 'walk', 3, [this.base_max, this.base_cur]]
        this.animation_list = ['walk', 'bounce', 'sprint', 'hold']

        //for buttons
        this.nz = this.add.sprite(200, 590, 'buttons',2)
        this.gh = this.add.sprite(400, 590, 'buttons',4)
        this.fa = this.add.sprite(100, 590, 'buttons',8)
        this.sh = this.add.sprite(300, 590, 'buttons',10)
        this.bo = this.add.sprite(400, 590, 'buttons',0)
        this.sp = this.add.sprite(400, 590, 'buttons',6)
        this.ont = this.add.sprite(400, 590, 'buttons',12)

        this.gh.visible = false
        this.fa.visible = false
        this.sh.visible = false
        this.ont.visible = false
        this.sp.visible = false
        this.bo.visible = false

        this.left_list = [this.gh, this.sp, this.fa]
        this.right_list = [this.bo, this.sh, this.ont]

        this.button_list = [this.nz]
        //this.otz = this.add.sprite(400, 400, 'buttons',5)
        this.button_actions(this.exclusion, 1, 1)
        this.button_actions(this.nz, [this.base_zombie, 'base_zombie', 'walk', 3, [this.base_max, this.base_cur]],[2, 3])
        this.button_actions(this.gh, [this.ghost_zombie, 'ghost', 'bounce', 4, [this.ghost_max, this.ghost_cur]], [4, 5])
        this.button_actions(this.fa, [this.fast_zombie, 'fast', 'sprint', 3, [this.fast_max, this.fast_cur]], [8, 9])
        this.button_actions(this.sh, [this.sheild_zombie, 'sheild', 'hold', 2 , [this.sheild_max, this.sheild_cur]], [10, 11])
        this.button_actions(this.bo, [this.bomb_zombie, 'bomb', 'boom', 1, [this.bomb_max, this.bomb_cur]], [0, 1])
        this.button_actions(this.sp, [this.spit_zombie, 'spitter', 'spit', 1, [this.spit_max, this.spit_cur]], [6, 7])
        this.button_actions(this.ont, [this.one_tough_zombie, 'one_tough', 'stars', 1, [this.otz_max, this.otz_cur]], [12, 13])
        //particles, dont need just yet
        //let particles = this.add.particles('parts')
        let particles = this.add.particles('parts')
        
        

        //here if the zombies hit the player the player dies straight away, will need to change later to reduce healthpulapulapula
        this.add_collision(this.zombie_list, this.hero_1)
        
        //disable drag
        this.hero_1.inputEnabled = false
        //collisions for the different kinds of zombies
        for(let i = 0; i < this.zombie_list.length; i ++){
            this.physics.add.collider(this.bl, this.zombie_list[i], this.zombie_hit_dis, null, this);
        }
        
        for(let i = 0; i < this.zombie_list.length; i ++){
            this.physics.add.collider(this.di, this.zombie_list[i],  this.zombie_hit_dis, null, this);
        }
        for(let i = 0; i < this.zombie_list.length; i ++){
            this.physics.add.collider(this.sw, this.zombie_list[i],  this.zombie_hit_static, null, this);
        }
        for(let i = 0; i < this.zombie_list.length; i ++){
            this.physics.add.collider(this.bu, this.zombie_list[i], this.zombie_hit_static, null, this);
        }
        
        //this.physics.add.collider(this.bl, this.ghost_zombie, zombie_hit, null, this);

        //camera currently follows the player
        //this.cameras.main.startFollow(this.hero_1)
        this.input.on('pointerdown', this.handleLeftClick, this);

        //timer for the weapons
        this.timer = this.time.addEvent({
            delay: 100,
            callback: this.fireWeapon,
            callbackScope: this,
            loop: true
        });

        //to count how long it takes to defeat the heros
        timerText = this.add.text(320, 30, 'testing', {
            fontFamily: 'Stencil Std, fantasy',
            fontSize: '40px',
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

        this.emitter_timer = this.time.addEvent({
            delay: 1000, 
            callback: this.updateEmitter,
            callbackScope: this,
            loop: true, // Repeat indefinitely
        });
        this.healthBar = this.makeBar(this.hero_1.x, this.hero_1.y, 0x2ecc71);
        
    }

    update()
    {   
        
        if(state === 'Main_menu'){
            this.upB.visible = false
            timerText.visible = false
           
            for(let i = 0; i < this.main_menu_zombies.children.entries.length; i++){
                this.main_menu_zombies.children.entries[i].setVelocity(0, -200)
                
                if(this.main_menu_zombies.children.entries[i].y < -40){
                    this.main_menu_zombies.children.entries[i].y += 700
                }
                //zombies.children.entries[i].setVelocity(deltaX *= speed, deltaY*= speed);
            }
            Main_menu(this.button_list, this.start, this.title, this.building)
        }
        if(state === 'Cutscene'){
           
            
            this.title.destroy()
            this.start.destroy()
            this.main_menu_zombies.destroy(true)
            this.building.destroy()
            this.move_skull("down")
            Cut_scene(this.text_scroll, this.stut, this.ptut)
            
        }
        if(state === 'Tutorial'){
            if(this.tutorial_fired === false){
                this.tt1.visible = true
                this.tt2.visible = true
                this.tt3.visible = true
                timerText.visible = true
                this.building = this.physics.add.sprite(320, 320, 'build')
                this.hero_1.destroy()
                this.hero_1 = this.physics.add.sprite(310, 350, 'little_girl')
                this.hero_1.setScale(1.5)
                this.exclusion.visible = true
                this.exclusion.x = this.hero_1.x
                this.exclusion.y = this.hero_1.y
                this.hero_1.play('bobbing') 
                this.upB.visible = false
                this.text_scroll.destroy()
                this.stut.destroy()
                this.ptut.destroy()
                this.change_butt_pos()
                this.hero_1.body.immovable = true
                saved_movement_ind = 0
                path = [[310, 350]]
                pat = 'center'
                this.add_collision(this.zombie_list, this.hero_1)
                this.tutorial_fired = true
                
            }
            
            timerText.setText(`${timeSeconds}`)
            this.setValue(this.healthBar, cur_h_health, this.hero_1);
            if(this.alive === true){
                followPath(this.hero_1, saved_movement_ind, path, hero_speed, pat)
            }

           
            this.move_skull('up')
            
            this.zombie_run(this.hero_1, this.base_zombie, base_speed)
            if(cur_h_health <= 0){
                state = 'Battle'
            }
        }
        if(state === 'Battle'){
            if(this.bat_fired === false){
                
                if(level_num === 1){
                    this.exclusion.visible = true
                    this.base_cur =  0
                    this.building.destroy()
                    this.building = this.physics.add.sprite(320, 320, 'build')
                    for(let z = 0; z < this.zombie_list.length; z++){
                        for(let i = 0; i < this.zombie_list[z].children.entries.length; i++){
                            this.zombie_list[z].children.entries[i].disableBody(true, true)
                            this.zombie_list[z].children.entries[i].health = 0
                    }}
                    this.tt1.destroy()
                    this.tt2.destroy()
                    this.tt3.destroy()
                    cur_h_health = 100
                    this.text_scroll.destroy()
                    timerText.visible = true
                    this.stut.destroy()
                    this.ptut.destroy()
                    this.current_selected[4][1] = 0
                    this.current_selected = [this.base_zombie, 'base_zombie', 'walk', 3, [this.base_max, this.base_cur]]
                    this.hero_1.destroy()
                    this.hero_1 = this.physics.add.sprite(50, 50, 'hero_bomb')
                    this.hero_1.play('throwing')
                    this.timer.delay = 200
                    //this.hero_1 = this.physics.add.sprite(50, 50, 'hero_1')
                    this.change_butt_pos()
                    saved_movement_ind = 0
                    this.hero_1.body.immovable = true;
                    path = [[100, 100],[500, 200], [600, 600], [100, 600], [300, 300]]
                    pat = 'rand'
                    this.add_collision(this.zombie_list, this.hero_1)
                }
                if(level_num === 2){
                    
                    this.hero_1 = this.physics.add.sprite(30, 30, 'hero_shotgun')
                    this.hero_1.play('blasting')
                    this.hero_1.body.immovable = true;
                    this.change_butt_pos()
                    saved_movement_ind = 0
                    path = [[30, 70], [620, 70]]
                    pat = 'top'
                    this.add_collision(this.zombie_list, this.hero_1)
                }
                if(level_num === 3){
                    
                    this.timer.delay = 500
                    this.hero_1 = this.physics.add.sprite(520, 520, 'hero_sword')
                    this.hero_1.play('swording')
                    this.hero_1.body.immovable = true;
                    this.change_butt_pos()
                    saved_movement_ind = 0
                    this.sword = this.sw.create(this.hero_1.x, this.hero_1.y, 'sword')
                    
                    path = [[520, 520], [520, 70], [70, 70], [70, 520]]
                    pat = 'perimiter'
                    this.add_collision(this.zombie_list, this.hero_1)
                }
                if(level_num === 4){
                    
                    this.sword = null
                    this.hero_1 = this.physics.add.sprite(300, 300, 'hero_3')
                    this.hero_1.body.immovable = true;
                    this.change_butt_pos()
                    saved_movement_ind = 0
                    path = [[300, 300]]
                    pat = 'center'
                    this.add_collision(this.zombie_list, this.hero_1)
                }

                
                this.alive = true
                cur_h_health = 100
                this.bat_fired = true
                this.up_fired = false

                if(upgradeText != null){
                    upgradeText.visible = false
                }
                if(scoreText != null){
                    scoreText.visible = false
                }
            }
            this.move_skull("up")
            this.exclusion.visible = true
            this.exclusion.x = this.hero_1.x
            this.exclusion.y = this.hero_1.y

            if(this.alive === true){
                followPath(this.hero_1, saved_movement_ind, path, hero_speed, pat)
            }
            if(this.sword != null){
                this.sword.rotation += 0.2
                this.sword.x = this.hero_1.x
                this.sword.y = this.hero_1.y
            }
            
            //this sets the current time in the run
            timerText.setText(`${timeSeconds}`)
            
            //this changes the size of the heros health bar
            this.setValue(this.healthBar, cur_h_health, this.hero_1);

            
            //to make the zombies move and flip
            this.zombie_run(this.hero_1, this.base_zombie, base_speed)
            this.zombie_run(this.hero_1, this.ghost_zombie, base_speed)
            this.zombie_run(this.hero_1, this.sheild_zombie, base_speed/2)
            this.zombie_run(this.hero_1, this.bomb_zombie, base_speed)
            this.zombie_run(this.hero_1, this.fast_zombie, base_speed*2)
            this.zombie_run(this.hero_1, this.spit_zombie, base_speed)
            this.zombie_run(this.hero_1, this.one_tough_zombie, base_speed)
            
        
            //this works out where the bullets are in relation to the hero, if it ever leaves the square around the hero itll stop the bullet
            //this enables the screen not to get clogged up with stuff
            //probably better off moving this too a function but will keep this for now and move it on saturday

            this.move_skull("up")

            if(cur_h_health <= 0){
                
                state = 'Upgrade'
            }
            
            for(let i = 0; i < this.bl.children.entries.length; i++){
                if(this.bl.children.entries[i].x < this.hero_1.x+500 && this.bl.children.entries[i].x > this.hero_1.x-500 && this.bl.children.entries[i].y < this.hero_1.y+500 && this.bl.children.entries[i].y > this.hero_1.y-500){
                    
                }  else {
                    this.bl.children.entries[i].disableBody(true, true);
                }
                if (this.alive === 'false'){
                    this.bl.children.entries[i].disableBody(true, true);
                }
            }
            for(let i = 0; i < this.di.children.entries.length; i++){
                if(this.di.children.entries[i].x < this.hero_1.x+200 && this.di.children.entries[i].x > this.hero_1.x-200 && this.di.children.entries[i].y < this.hero_1.y+200 && this.di.children.entries[i].y > this.hero_1.y-200){
                    
                }  else {
                    this.di.children.entries[i].disableBody(true, true);
                }
                if (this.alive === 'false'){
                    this.di.children.entries[i].disableBody(true, true);
                }
            }
            for(let i = 0; i < this.sw.children.entries.length; i++){
                if(this.sw.children.entries[i].x < this.hero_1.x+200 && this.sw.children.entries[i].x > this.hero_1.x-200 && this.sw.children.entries[i].y < this.hero_1.y+200 && this.sw.children.entries[i].y > this.hero_1.y-200){
                    
                }  else {
                    this.sw.children.entries[i].disableBody(true, true);
                }
                if (this.alive === 'false'){
                    this.sw.children.entries[i].disableBody(true, true);
                }
            }
            this.building.visible = true
 
        }
        if(state === 'Upgrade'){
            if(this.up_fired === false){
                score += timeSeconds
                timeSeconds = 100
                if(level_num >= 4){
                    this.hero_1.destroy()

                    
                    upgradeText = this.add.text(450, 200, 'testing', {
                        fontFamily: 'Stencil Std, fantasy',
                        fontSize: '40px',
                        color: '#000000',
                    })
                    upgradeText.setOrigin(0.5);
                    upgradeText.setText(`Zombies used: ${zombies_lost}`)

                    scoreText = this.add.text(450, 300, 'testing', {
                        fontFamily: 'Stencil Std, fantasy',
                        fontSize: '40px',
                        color: '#000000',
                    })
                    scoreText.setOrigin(0.5);
                    scoreText.setText(`Score: ${score*4}`)
                    if(upgradeText != null){
                        upgradeText.visible = false
                    }
                    if(scoreText != null){
                        scoreText.visible = false
                    }
                    for(let i = 0; i < this.button_list.length; i++){
                        this.button_list[i].visible = false
                        
                    }
                    for(let z = 0; z < this.zombie_list.length; z++){
                        for(let i = 0; i < this.zombie_list[z].children.entries.length; i++){
                            this.zombie_list[z].children.entries[i].health = 0
                            this.setValue(this.zombie_list[z].children.entries[i].hb, this.zombie_list[z].children.entries[i].health, this.zombie_list[z].children.entries[i]);
                            this.zombie_list[z].children.entries[i].disableBody(true, true)
                            
                    }}
                    level_num+= 1
                    this.up_fired = true

                }
                if(level_num < 4){
                    
                    
                    this.hero_1.destroy()
                    
                    this.base_cur =  0
                    this.ghost_cur = 0
                    this.fast_cur = 0
                    this.sheild_cur = 0
                    this.bomb_cur = 0
                    this.spit_cur = 0
                    this.otz_cur = 0
                    for(let i = 0; i < this.button_list.length; i++){
                        this.button_list[i].visible = false
                        
                    }

                    
                    level_num += 1
                    //this.hero_1 = null
                    this.bat_fired = false
                    //disable all the zombies on the screen
                    for(let z = 0; z < this.zombie_list.length; z++){
                        for(let i = 0; i < this.zombie_list[z].children.entries.length; i++){
                            this.zombie_list[z].children.entries[i].health = 0
                            this.setValue(this.zombie_list[z].children.entries[i].hb, this.zombie_list[z].children.entries[i].health, this.zombie_list[z].children.entries[i]);
                            this.zombie_list[z].children.entries[i].disableBody(true, true)
                            
                    }}
                    this.up_fired = true
                }
                
                }
            this.move_skull("down")
            this.building.visible = false
            this.exclusion.visible = false

        }
        if(state === 'Win'){
            console.log("win")
            this.move_skull("down")
            this.building.visible = false
            this.exclusion.visible = false
        }
        if(state === "Lose"){
            if(this.lose_fired === false){
                
                loseText = this.add.text(200, 200, 'testing', {
                    fontFamily: 'Stencil Std, fantasy',
                    fontSize: '40px',
                    color: '#ffffff',
                })
                loseText.setOrigin(0.5);
                loseText.setText('You lost :(')
                loseText.visible = true
                this.lose_fired = true
            }
        }
    }
    zombie_hit_dis(col, zomb){
        console.log(zomb.name)
        if(zomb.name === 'base_zombie' || zomb.name === 'spitter' || zomb.name === 'fast'){
            if(zomb.health >= 1){
                zomb.health -= 50
                
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                this.emitter.start()
                this.emitter.setPosition(zomb.x, zomb.y)
                zombies_lost += 1
                if(zomb.name === 'base_zombie'){
                    this.base_cur -= 1
                }
                if(zomb.name === 'spitter'){
                    this.spit_cur -= 1
                }
                if(zomb.name === 'fast'){
                    this.fast_cur -= 1
                }
            }
            
            col.disableBody(true, true);
        }
        if(zomb.name === 'ghost'){
            const randomInt = Math.floor(Math.random() * 2) + 1
            if(randomInt === 1){
                if(zomb.health >= 1){
                zomb.health -= 50
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.ghost_cur -= 1
            }
            
            col.disableBody(true, true);
            }
        }
        if(zomb.name === 'sheild'){
            if(zomb.health >= 1){
                zomb.health -= 5
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.sheild_cur -= 1
            }
            
            col.disableBody(true, true);
        }
        if(zomb.name === 'bomb'){
            if(zomb.health >= 1){
                zomb.health -= 100
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.bomb_cur -= 1
            }
            
            col.disableBody(true, true);
        }
            
    }

    zombie_hit_static(col, zomb){
        if(zomb.name === 'base_zombie' || zomb.name === 'spitter' || zomb.name === 'fast'){
            if(zomb.health >= 1){
                zomb.health -= 50
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                this.emitter.start()
                this.emitter.setPosition(zomb.x, zomb.y)
                zombies_lost += 1
                if(zomb.name === 'base_zombie'){
                    this.base_cur -= 1
                }
                if(zomb.name === 'spitter'){
                    this.spit_cur -= 1
                }
                if(zomb.name === 'fast'){
                    this.fast_cur -= 1
                }
            }

        }
        if(zomb.name === 'ghost'){
            const randomInt = Math.floor(Math.random() * 2) + 1
            if(randomInt === 1){
                if(zomb.health >= 1){
                zomb.health -= 50
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.ghost_cur -= 1
            }
            }
        }
        if(zomb.name === 'sheild'){
            if(zomb.health >= 1){
                zomb.health -= 5
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.sheild_cur -= 1
            }

        }
        if(zomb.name === 'bomb'){
            if(zomb.health >= 1){
                zomb.health -= 100
            } 
            if(zomb.health <= 1) {
                zomb.disableBody(true, true);
                zombies_lost += 1
                this.bomb_cur -= 1
            }
        }
    }
    //this is needed to work out where the zombies have to go
    zombie_run(target, zombies, speed){
        
        for(let i = 0; i < zombies.children.entries.length; i++){
            let deltaX =  target.x- zombies.children.entries[i].x;
            let deltaY =  target.y- zombies.children.entries[i].y;
            this.setValue(zombies.children.entries[i].hb, zombies.children.entries[i].health, zombies.children.entries[i]);
            zombies.children.entries[i].setVelocity(deltaX *= speed, deltaY*= speed);

        }
    }
    ///for handeling the left clicks, it will need to drop a zombie
    handleLeftClick(pointer) {
        if(this.over_button === false){
            if(state === 'Battle' || state === 'Tutorial'){
                if(this.inside_ex === false){    
                    if (pointer.leftButtonDown()) {
                        if(this.current_selected[1] === 'base_zombie'){
                            
                            this.current_selected[4][1] = this.base_cur
                        }
                        if(this.current_selected[1] === 'ghost'){
                            
                            this.current_selected[4][1] = this.ghost_cur
                        }
                        if(this.current_selected[1] === 'fast'){
                            
                            this.current_selected[4][1] = this.fast_cur
                        }
                        if(this.current_selected[1] === 'sheild'){
                            
                            this.current_selected[4][1] = this.sheild_cur
                        }
                        if(this.current_selected[1] === 'bomb'){
                           
                            this.current_selected[4][1] = this.bomb_cur
                        }
                        if(this.current_selected[1] === 'spitter'){
                           
                            this.current_selected[4][1] = this.spit_cur
                        }
                        if(this.current_selected[1] === 'one_tough'){
                            
                            this.current_selected[4][1] = this.otz_cur
                        }
                        
                        if(this.current_selected[4][0] > this.current_selected[4][1]){
                            this.spawn.play()
                             //this.create_h(this.base_zombie, 'base_zombie', 0.1, 1, pointer.x, pointer.y, 'be_cool')
                            this.create_h(this.current_selected[0], this.current_selected[1], 1, this.current_selected[3], pointer.x, pointer.y, this.current_selected[2])
                            
                            console.log(this.current_selected[4][0], ' ', this.current_selected[4][1])
                            
                            if(this.current_selected[1] === 'base_zombie'){
                                this.base_cur += 1
                                this.current_selected[4][1] = this.base_cur
                            }
                            if(this.current_selected[1] === 'ghost'){
                                this.ghost_cur += 1
                                this.current_selected[4][1] = this.ghost_cur
                            }
                            if(this.current_selected[1] === 'fast'){
                                this.fast_cur += 1
                                this.current_selected[4][1] = this.fast_cur
                            }
                            if(this.current_selected[1] === 'sheild'){
                                this.sheild_cur += 1
                                this.current_selected[4][1] = this.sheild_cur
                            }
                            if(this.current_selected[1] === 'bomb'){
                                this.bomb_cur += 1
                                this.current_selected[4][1] = this.bomb_cur
                            }
                            if(this.current_selected[1] === 'spitter'){
                                this.spit_cur += 1
                                this.current_selected[4][1] = this.spit_cur
                            }
                            if(this.current_selected[1] === 'one_tough'){
                                this.otz_cur += 1
                                this.current_selected[4][1] = this.otz_cur
                            }
                            
                            //this.create_h(this.ghost_zombie, 'ghost', 1, 1, pointer.x, pointer.y, 'bounce')
                            for(let i = 0; i < this.zombie_list.length; i++){
                                this.zombie_list[i].children.iterate(sprite => {
                                    sprite.play(this.animation_list[i])
                                })
                            }}
                    }}
            }
    }}
    add_collision(z_list, hero){
        for(let i = 0; i < z_list.length; i++)
            this.physics.add.collider(hero, z_list[i], attack_hero, null, this)
    }
    //this function creates a hord
    create_h(zombie, z_string, s, n, x, y, action_name){
        for (let i = 0; i < 1; i++){

            const b_z = zombie.create(x, y, z_string, i)
            b_z.health = 100
            b_z.scale = s
            b_z.name = z_string

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
            if(pat === 'rand'){
                fireProjectile(this.di, this.hero_1.x, this.hero_1.y, pat, this.zombie_list)
            }
            if(pat === 'top'){
                fireProjectile(this.bl, this.hero_1.x, this.hero_1.y, pat, this.zombie_list)
            }
            if(pat === 'perimiter'){
                fireProjectile(this.bu, this.hero_1.x, this.hero_1.y, pat, this.zombie_list)
            }
            if(pat === 'center'){
                fireProjectile(this.sw, this.hero_1.x, this.hero_1.y, pat, this.zombie_list)
            }
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
        if(state === 'Battle' || state == 'Tutorial'){
            if(timeSeconds !== 0){
                //timeMinutes += 1
                timeSeconds -= 1
            } 
            if(timeSeconds === 0){
                state = 'Lose'
            }
        }
        //console.log(timeMinutes, ":", timeSeconds)
    }

    button_actions(button, s_list, f_list){
        button.setInteractive()
        button.on('pointerdown', ()=> {
            this.click.play()
            if(state === 'Main_menu'){
                state = 'Cutscene'
            }
            if(state === 'Cutscene'){
                if(s_list === 1){
                    state = 'Battle'
                }
                if(s_list === 2){
                    state = 'Tutorial'
                }
            }
            if(state === 'Battle' || state === 'Tutorial'){
                if(s_list != 1){
                    this.current_selected = s_list
                }
            }    
            if(state  === 'Upgrade'){
                this.button_list.push(button)
                state = 'Battle'
            }
                
        })

        button.on('pointerover', ()=> {
            if(state === 'Battle' || state === 'Tutorial'){
                if(s_list === 1){
                    this.inside_ex = true}
                else{
                    this.over_button = true
                    button.setFrame(f_list[1])}
            }
            if(state === 'Upgrade'){
                this.over_button = true
                button.setFrame(f_list[1])
            }
        })

        button.on('pointerout', ()=>{
            if(state === "Battle" || state === 'Tutorial'){
                if(s_list === 1){
                    this.inside_ex = false}
                else{
                    this.over_button = false
                    button.setFrame(f_list[0])}}
            if(state === 'Upgrade'){
                this.over_button = true
                button.setFrame(f_list[0])
            }
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
            this.button_list[i].x = 128*[i+1]
            this.button_list[i].visible = true
            this.button_list[i].y = 550
        }
    }
    updateEmitter(){
        this.emitter.stop()
    }
    move_skull(dir){
        if(dir === "up"){
            this.upB.visible = false
            for(let i = 0; i < this.tool_tips.length; i++){
                this.tool_tips[i].visible = false
            }
            for(let i = 0; i < this.skull_parts.length; i++){
                if(this.skull_parts[i].y > -100){
                    this.skull_parts[i].y -= 10
                }
            }
        }
        if(dir === "down"){

            for(let i = 0; i < this.skull_parts.length; i++){
                

                if(this.skull_parts[i].y < 300){
                    this.skull_parts[i].y += 5
                } else {
                    this.upB.x = 450
                    this.upB.y = 250
                    this.upB.visible = true
                    
                    if(this.movement_eyes === 'right'){
                        this.skull_parts[1].x += 0.2
                        if(this.skull_parts[1].x > 193){
                            this.movement_eyes = 'left'
                        }
                    }
                    if(this.movement_eyes === 'left'){
                        this.skull_parts[1].x -= 0.2
                        if(this.skull_parts[1].x < 182){
                            this.movement_eyes = 'right'
                        }
                    }
                    if(state === 'Cutscene'){
                        this.text_scroll.visible = true
                    }
                    if(state === 'Upgrade' && level_num === 2){
                        this.left_list[level_num-2].visible = true
                        this.right_list[level_num-2].visible = true
                        this.left_list[level_num-2].x = 320
                        this.left_list[level_num-2].y = 200
                        this.right_list[level_num-2].x = 320
                        this.right_list[level_num-2].y = 300
                        this.tool_tips[0].visible = true
                        this.tool_tips[1].visible = true
                        this.tool_tips[2].visible = true
                    }
                    if(state === 'Upgrade' && level_num === 3){
                        this.left_list[level_num-2].visible = true
                        this.right_list[level_num-2].visible = true
                        this.left_list[level_num-2].x = 320
                        this.left_list[level_num-2].y = 200
                        this.right_list[level_num-2].x = 320
                        this.right_list[level_num-2].y = 300
                        this.tool_tips[0].visible = true
                        this.tool_tips[5].visible = true
                        this.tool_tips[3].visible = true
                    }
                    if(state === 'Upgrade' && level_num === 4){
                        this.left_list[level_num-2].visible = true
                        this.right_list[level_num-2].visible = true
                        this.left_list[level_num-2].x = 320
                        this.left_list[level_num-2].y = 200
                        this.right_list[level_num-2].x = 320
                        this.right_list[level_num-2].y = 300
                        this.tool_tips[0].visible = true
                        this.tool_tips[4].visible = true
                        this.tool_tips[6].visible = true
                    }
                    if(state === 'Upgrade' && level_num === 5){
                        this.win_text.visible = true
                        if(upgradeText != null){
                            upgradeText.visible = true
                        }
                        if(scoreText != null){
                            scoreText.visible = true
                        }
                    }
                    
                }
            }
        }
    }
}
