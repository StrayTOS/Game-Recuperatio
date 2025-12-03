# Recuperatio
This is a game project being created using Google Antigravity's Gemini 3 Pro (High) Agent.  
  
  
LICENSE : "Attribution-NonCommercial-NoDerivatives 4.0 International"   
  
**[Supplementary Information and Disclaimer]**  
  
The following points clarify the terms of use and liability:  
  
*   The copyright remains with the author Mugnus Crunch Strayers and is not waived or relinquished.
*   The author is not liable for any responsibility or damages arising from the use of this work (provided "as-is" without warranty).
*   Any redistribution beyond the terms of the above license, including posting on other websites or SNS platforms, is strictly prohibited.  
  
  
===== Initial Specifications =====  
  
The initial specifications were as follows. There were some path errors in the initial artifacts, but I fixed them and the overall flow was established to a certain extent. The generated images were manually re-edited into pixel-perfect images and transparency was applied. The background of the shooting game screen uses an atlas texture, but I was unable to create the desired image even with Google Antigravity's Nano Banana Pro. Therefore, the images I manually connected were simply edited and remain unfinished. This may be a challenge when creating a game using Antigravity. This will require the ability to accurately communicate prompts to Nano Banana Pro. In the case of Antigravity's Gemini 3 Pro, separate prompts for image generation are created based on the considerations, which could lead to misunderstandings between the Agent and the user. Antigravity may need to take such misinterpretations into consideration.  
  
  
===== Below are the initial instructions I gave to the Agent =====  
  
#Your Role    
 ##Game Creator  
 ##Create a side-scrolling shooter game  
 ##If there are traditional methods, propose and attempt to implement them.  
  
#Production Prerequisites  
 ##Ultimately, the game will be replaced with 3D models. In the initial stages, substitute it whitch the sprites   will be created by applying pixel art textures to polygonal polygons instead the eventual 3D models.
 ##Until the 3D model replacement is instructed, the polygonal plates will be used for construction.  
 ##To ensure efficient replacement, the player character, enemy characters, items, and background objects will be   clearly separated.
 ##Displays such as Health and Magic gauge bars, remaining lives, and consoles displayed to the player will be   managed on 2D layers.
  
#Game Title  
 ##Recuperatio  
  
#Worldview  
 ##A world where medieval European magic exists.  
  
#Music  
 ##Mysterious music box music for the title screen  
 ##Elegant string music for the episodes screen  
 ##Lifting flute music for the shooter screen  
 ##Tense orchestral music for the boss battles  
 ##Tragic flute music for the game over screen  
 ##Joyful wind instrument music for the game completion  
 ##Calm orchestral music for the ending screen  
  
#Sound Effects  
 ##Confirmation Button Sound  
  *Light short sound  
##Cancel Button Sound  
  *Dissonance short sound  
 ##Player Attack Sound  
  *Magic casting sound  
   -Three types means strongth: Small, Medium, and Large  
 ##Sounds when the player relation with an item  
  *Short sound indicating acquisition, opening a scroll, uncorking cork stoppers a bottle  
 ##Enemy Defeated Sound  
  *The sound that turns into sand and disappears, sound of deadwood cracking and crumbling  
 ##Enemy Attack Sound  
  *Short sound of energy being released, fire being spit out, short sound made by cracking a seed  
  
#Screen Ratio  
 ##16:9  
  
#Controls  
 ##On-screen controller  
  *D-Pad for controlling the player's character  
   -Located in the lower left corner of the screen  
  *Item Use Button  
   -Located in the lower right corner of the screen, to the right of the Attack Button  
   -Also serves as the Confirm Button outside of the Side-scrolling shooter screen  
  *Attack Button  
   -Located in the lower right corner of the screen, to the left of the Item Use Button  
   -Also functions as the Cancel Button outside of the Side-scrolling shooter screen  
 ##Keyboard Controls  
  *Controling the player's character with the D-pad  
  *Attack with the Z key  
  *Use items with the X key  
  *Confirm with the Space key  
  *Cancel with the ESC key  
  
#Game Screen Configuration  
 ##Title Screen  
  *A shot as the background looking up at a towering huge tree in a forest with fantastically dappled sunlight  
  *The game title "Recuperatio" logo is placed in the center of the foreground  
  *The start button is below the title logo  
  *The copyright notice for "Magnus Crunch Strayers 2025" is placed in the bottom center  
  *A notice at the bottom states that the game was created using the "Google Antigravity" generative AI  
 ##Prologue Screen  
  *A full-screen window featuring a vine design  
  *The story text is displayed within the window  
   -If the story text is long, it slowly scrolls to the end of contents  
  *A play icon flashes in the bottom right corner once every 5 seconds  
   -The play icon functions as a progress button to transition to the next screen  
 ##Objective Description Screen  
  *A half-screen window featuring a magical character design  
  *A magic circle icon flashes at the bottom of the window every 5 seconds.  
   -The magic circle icon functions as a progress button to transition to the next screen.  
 ##Side-scrolling shooter screen  
  *Score  
   -Displayed as a 10-digit number in the center of the top row.  
  *Health Gauge  
   -Displayed in the upper left corner, spanning half the width of the screen. The gauge bar height is thin.  
   -The bar has a transparent background with a golden border.  
   -The bar's foreground means a value ranging from 0 to 100.  
   -The bar's foreground is green when normal, changing red when the value falls below 30 and blink once per second   when the value falls below 10.
  *Magic Gauge  
   -Displayed in the upper left corner, spanning half the width of the screen, below the health gauge. The gauge bar   height is thin.
   -The bar has a transparent background with a silver border.  
   -The bar's foreground means a value ranging from 0 to 100.  
   -The bar's foreground is light blue.  
  *Owned Items  
   -A ruby colored frame is placed to the right of the health and magic gauges.  
   -An icon of the currently owned item is displayed within the ruby colored frame.  
  *Remaining Lives Indicator  
   -Located on the right edge of the top of the screen.  
   -A blacky purple witch's hat icon with a two-digit yellow number superimposed on it displays the number of   remaining lives.
 ##Epilogue Screen  
  *A plain diary is open in the background, with ink and a quill pen next to it.  
  *The epilogue is spelled out in white text with a black drop shadows.  
  *A play icon indicating "Next" blinking once per 5 seconds in the lower right corner of the screen.  
 ##Game Over Screen  
  *The background is a dark room with a witch's hat on the floor, illuminated by a spotlight.  
  *The words "Game Over" are displayed.  
 ##Ending Screen  
  *A witch standing with smiling and gazing into the distance, is displayed in the background.  
  *The word "Finale" is displayed in the lower right corner.  
  
#Screen Transition Specifications  
 ##Pressing the Start button on the title screen will transition to the prologue screen.  
 ##Pressing the Progress button on the prologue screen will transition to the objective explanation screen.  
 ##Pressing the Progress button on the objective screen will transition to the side-scrolling shooter screen.  
  ##On the side-scrolling shooting screen, the transition to the next screen is switched depending on the conditions.  
  *If the player dies and runs out of lives, the game will transition to the game over screen.  
   -All game parameters are reset when the game over screen is displayed.  
  *If the player defeats the boss and wins, the game will transition to the epilogue screen.  
 ##Pressing the Confirm button on the Game Over screen will transition to the title screen.  
 ##Pressing the Confirm button on the Epilogue screen will transition to the following screen branch:  
  *If there is a next stage, the stage settings will change to next it and game will be transition to the Prologue   screen.
  *If there is no next stage, game will be taken to the Ending screen.  
 ##Pressing the Confirm button on the Ending screen will take you to the title screen.  
  *When game transittions to the title screen, all game parameters will be reset.  
  
#Stage Structure  
 ##A prologue, objective explanation, side-scrolling shooter, and epilogue make up each stage.  
 ##Currently, only Stage 1 has been developed.  
  *Stage 1 Structure  
   -Proceed from the plains, through the lakeside, into the woods, forest, and large forest, with the boss located   at the deepest part.
   -Small enemies will be the main enemies in the plains, and as game progress, the number of medium and large   enemies will increase.
 ##Please make the system structure expandable so that stages can be added later.  
  
#Item Settings  
 ##Health Recovery Item  
  *A red liquid is contained in a clear bottle sealed with a cork.  
  *When used, the player's health is fully restored and the item disappears.  
 ##Magic Recovery Item  
  *A blue liquid is contained in a clear bottle sealed with a cork.  
  *Upon use, the player's magic is fully restored and the item disappears.  
  
#Character Settings  
 ##Common Settings for All Characters  
  *All characters have health and attack power.  
  *Player  
   -Fired bullets deal damage equal to their attack power when they hit an enemy character.  
   -Touching an enemy character's body or a bullet will cause damage equal to the enemy's attack power.  
   -Upon taking damage, the character will appear as a red silhouette during 0.3 seconds.  
   -Cannot leave the screen.  
   -Die when their health reaches 0.  
  *Enemy Character  
   -Touching the player character's bullet will cause damage.  
   -Upon taking damage, the character will appear as a red silhouette during 0.3 seconds.  
   -Appears from off-screen of right side edge to on-screen.  
   -Disappears when they leave the screen from on-screen.  
   -Die when their health reaches 0.  
   -Upon death, an amount equal to their max health value is added to the player's score.  
 ##Item Box Character  
  *Stone tablet engraved with a relief of the seal.  
  *Based on 5% of the screen's vertical width.  
  *Appeaer one every 30 seconds, it slowly moves horizontally from off-screen on the right side of the screen to the   left into on-screen.
  *Health is 5, Attack Power is 0  
  *When health reaches zero, it is destroyed and an item appears.  
   -The item that appears is a health recovery item or a magic recovery item, chosen randomly with a 50% chance.  
  *Can be acquired by the player character when touching it.  
   -Obtained items disappear and become part of the player's inventory.  
 ##Player Character  
  *A wizard girl riding a broomstick  
  *Based on 8% of the screen's vertical height  
  *When appearing, Player's character is located on the left side middle of the screen, facing right.  
  *Health is 100  
   -Health is fully restored by using a health recovery item.  
   -Using a health recovery item when health is at maximum increases the remaining life by one.  
  *Magic Power is 100  
   -When an attack bullet is fired, the attack power value is subtracted from the magic power.  
   -If magic power is insufficient, attack bullets cannot be fired.  
   -Magic power recovers by 1 per second until its max gage.  
   -Magic power is fully restored by using a magic recovery item.  
  *Attack power varies depending on the conditions.  
   -The condition is the length of time the attack button is pressed.  
   -Attack power is 1 if the attack button is pressed for less than 1 second, 5 if it is pressed for 3 seconds, and   10 if it is pressed for 6 seconds.
   -Bullets are fired the moment the attack button is released, based on the time.  
   -Bullets size is small, middle andbig witch based on the time.  
   -Bullets cannot be fired if the player does not have magic power equal to or greater than the attack power.  
  *Only one item can be carried.  
   -There are two types of items: health recovery items and magic recovery items.  
   -If the player already has the item in their inventory, discard the old item and get the new one.  
   -Using one will result in a state where the player has no items.  
  *Only one player character can be on screen at a time.  
  *When health reaches zero, the player dies.  
   -One life is lost.  
   -If the player does not have zero lives, the player flies back onto the screen from off-screen on the left side.  
   -After player character returning to the screen, the player blinks for 5 seconds, making them immune to enemy   attacks among it.
   -If the player has zero lives, the game is over.  
 ##Small enemy characters  
  *Translucent ghosts  
  *Size is based on 8% of the screen's height.  
  *Flying horizontally from the right side of the off-screen and drifting to the left.  
  *Health is 1, attack power is 2.  
  *No more than  ten will appear on the screen at a time  
 ##Medium enemy characters  
  *Skeleton Ghost  
  *size is based on 12% of the screen's height  
  *It appears on the screen from the right side off-screen, flies up and down in large zigzags, and advance to the   left side off-screen.
  *Fires horizontal energy projectiles when reaching its middle, highest and lowest altitudes  
  *Health: 5, Attack: 8  
  *No more than three will appear on the screen at a time  
 ##Large Enemy Character  
  *Evil-Colored European Dragon  
  *Size is based on 20% of the screen's height  
  *Flying horizontally from the right side of the off-screen into on-screen, it ascends and descends changing toward   direction the player character every three seconds, drifting to the left
  *Attacks by shooting flames from its mouth in the direction of travel when changing direction  
  *Health: 20, Attack: 25  
  *No more than two will appear on the screen at a time  
  *When its health reaches zero and it dies, it falls to the bottom of the screen while burning, then disappears   off-screen
 ##Enemy Boss Character  
  *Giant Evil-Colored Doll of Withered Tree  
  *Size is based on 80% of the screen's height  
  *Occupies the right side of the screen and moves up and down  
  *Attacks by firing nut bullets in a spiral formation from the palms of both arms  
  *Health is 300, attack power is 3 per bullet, dameged by touch body  is 8  
  *No more than one this enemy will appears on the screen at a time  
  *Bullets specification  
   -Up to 100 appear on the screen at a time  
   -Speed ​​is slowly linear velosity that so no accelerate  
   -Cannot be destroyed except by collision with the player  
   -Destroys when off-screen  
  
#Folder and File Structure  
 ##Character Settings Folder  
  *Detailed Settings Files for Each Character  
   -Defines parameters for health, magic, attack power, lives, items, score, and reference of the movement algorithms  
 ##Stage Settings Folder  
  *Detailed Settings Files for Each Stage  
   -Saves stage-specific settings such as prologue, epilogue, stage background sights, and enemy appearance patterns  
 ##Object Folder  
  *3D data in glTF format  
 ##Texture Image Folder  
  *PNG image data used for 2D elements  
  *PNG image data for textures used for 3D elements  
 ##Audio Folder  
  *Music files  
  *Sound effect files  
 ##Enemy Algorithm Folder  
  *Files that define the appearance, movement, and attack patterns for each enemy type  
 ##Game Engine Folder  
  *Processing files used throughout the game  
  
  