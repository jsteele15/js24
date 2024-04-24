import Phaser from '../lib/phaser.js'
const start_target = 400
const title_target = 200

export const Main_menu = function( button_list, start, title, building){
    for(let i = 0; i < button_list.length; i++){
        button_list[i].visible = false
    }  
    if(start.y < start_target){
        start.y += 10
    }
    if(title.y < title_target){
        title.y += 10
    } /*else{
         building.y -= 3
    }*/


    
}

export const Cut_scene = function(){
    
}