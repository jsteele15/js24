
const start_target = 400
const title_target = 200
const buttons_target = 550
const text_target = 300

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

export const Cut_scene = function(text_scroll, stut, ptut){
    
    if(stut.y < buttons_target){
        stut.y += 10
    }
    if(ptut.y < buttons_target){
        ptut.y += 10
    }
    if(text_scroll.y < text_target){
        text_scroll.y += 10
    }
}