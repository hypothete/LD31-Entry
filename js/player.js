//player definition

/* global
	fullscreen, ftx, Vector, panels, keys, isOnScreen
*/

//name: Olin? 'movement' Olli, 'rubber' 'Necāhual', 'survivor'

'use strict';

var groundHeight = 3*fullscreen.height/4;
var gravity = Vector.create([0,0.4]);
var playerSprite = new Image();

playerSprite.src = 'img/playersprites.png';

function Player(entityManager){
	var player = {
		type: {name:'player'},
		state: 'ready',
		position: Vector.create([fullscreen.width*0.8,groundHeight-100]),
		velocity: Vector.create([0,0]),
		walkSpeed:0.9,
		totalHp: 500,
		hp: 500,
		friction: 0.8,
		facingLeft: true,
		jumping: false,
		jumpCounter: 0,
		jumpMax: 5,
		jumpSpeed: 1.2,
		size: 15,
		teleporting: false,
		macuahuitl: false,
		manager: entityManager,
		kills: {},

		draw: function(){
			var colors = ['red', 'goldenrod', 'green', 'indigo'];
			ftx.save();
			ftx.translate(player.position.elements[0], player.position.elements[1]);

			//draw hp
			ftx.strokeStyle = 'black';
			ftx.strokeRect(-20, -player.size*2,40,10);
			ftx.fillStyle = 'red';
			ftx.fillRect(-20, -player.size*2,40*player.hp/player.totalHp,10);

			//draw sprite
			var spriteIndex = 0;

			if(player.state === 'injured' && player.hp > 0){
				spriteIndex = 2;
			}
			else if(player.jumping){
				spriteIndex = 1;
			}
			else if(player.macuahuitl){
				spriteIndex = 3;
			}
			else if(player.teleporting){
				spriteIndex = 4;
			}
			else if(player.hp === 0){
				spriteIndex = 5;
			}
			ftx.scale(player.facingLeft?-1:1, 1);
			ftx.drawImage(playerSprite,
				spriteIndex*60, 0, 60, 60, -30, -30, 60, 60);

			ftx.restore();
		},

		checkForCollisions: function(set){
			//wrote this for conqs first, next time a prototypical system....
			if(player.hp === 0){
				return;
			}
			set.forEach(function(elem){
				if(player.id !== elem.id && (player.position.distanceFrom(elem.position) < player.size + (elem.size || 0))  && elem.type.name !== 'damageToEnemy'){
					var stepBack = player.position.subtract(elem.position).toUnitVector().multiply(player.size);
					player.position = player.position.add(stepBack);

					if(elem.type.name === 'damageToPlayer'){
						player.hp -= elem.type.attackDamage;
						if(player.hp < 0){
							player.hp = 0;
						}
						player.state = 'injured';

						if(player.velocity.elements[1] >= 0 && player.position.elements[1] == groundHeight - player.size){
							player.velocity = player.velocity.add(Vector.create([0,-2]));
						}
						
						window.setTimeout(function(){
							player.manager.delete(elem.id);
							if(player.hp > 0 ){
								player.state = 'ready';
							}
							
						},60);
					}
				}
			});
		},

		move: function(){
			var potentialPosition;

			if(player.hp > 0){
				//left
				if(keys[65]){
					player.facingLeft = true;
					potentialPosition = player.position.add(player.velocity.add(Vector.create([-player.size,0])));
					if(isOnScreen(potentialPosition.elements[0],potentialPosition.elements[1])){
						player.velocity = player.velocity.add(Vector.create([-player.walkSpeed*(player.jumping? 0.0125 : 1),0]));
					}
					else{
						player.velocity.elements[0] = 0;
					}
				}

				//right
				else if(keys[68]){
					player.facingLeft = false;
					potentialPosition = player.position.add(player.velocity.add(Vector.create([player.size,0])));
					if(isOnScreen(potentialPosition.elements[0],potentialPosition.elements[1])){
						player.velocity = player.velocity.add(Vector.create([player.walkSpeed*(player.jumping? 0.0125 : 1),0]));
					}
					else{
						player.velocity.elements[0] = 0;
					}
				}

				//jump
				if(keys[87] && player.jumpCounter < player.jumpMax && isOnScreen(player.position.add(player.velocity.add(Vector.create([0,-player.jumpSpeed]))))){
					player.jumping = true;
					player.jumpCounter ++;
					player.velocity = player.velocity.add(Vector.create([0,-player.jumpSpeed]));
				}

				//fold screen
				if(keys[16] && !player.teleporting){
					var panelIndex,
						oldAngle,
						oldZ,
						swingDirection;
					//determine which panel folds
					if(player.position.elements[0] < fullscreen.width/2){
						//farLeft
						panelIndex = 0;
						swingDirection = 1;
					}
					else{
						//farRight
						swingDirection = -1;
						panelIndex = 3;
					}
					oldAngle = panels[panelIndex].rotate.y;
					oldZ = panels[panelIndex].translate.z;
					player.teleporting = true;
					panels[panelIndex].rotate.y += swingDirection*90;
					panels[panelIndex].translate.z += 3;

					window.setTimeout(function(){
						var panelWidth = (fullscreen.width/panels.length),
							startPanelIndex = Math.floor((player.position.elements[0]/fullscreen.width)*(panels.length)),
							endPanelIndex = (startPanelIndex%2==1)?startPanelIndex-1:startPanelIndex+1,
							localX = player.position.elements[0]%panelWidth,
							newLocalX = panelWidth - localX,
							newGlobalOffset = endPanelIndex*panelWidth + newLocalX;

						player.facingLeft = !player.facingLeft;
						player.position.elements[0] = newGlobalOffset;
						panels[panelIndex].rotate.y = oldAngle;
						panels[panelIndex].translate.z = oldZ;
						player.teleporting = false;
					},250);
				}

				//attack

				/*
					ideas:
					melee: macuahuitl
					ranged: tenatlatl flings stones, limited resource
					defend: shield - activate, or part of  macuahuitl?
				*/

				if(keys[32] && !player.macuahuitl){
					player.macuahuitl = true;
					var swingParticle = MacahuitlSwing(
						player.facingLeft,
						player.position.add(Vector.create([player.size*(player.facingLeft?-1:1),0])),
						player.velocity,
						player.manager);
				}
				else if(!keys[32]){
					player.macuahuitl = false;
				}
			}


			//gravity
			if(player.position.elements[1]+player.size+player.velocity.elements[1] < groundHeight){
				player.velocity = player.velocity.add(gravity);
			}
			else{
				player.jumping = false;
				player.position.elements[1] = groundHeight - player.size;
				player.velocity.elements[1] = 0;
				player.velocity = player.velocity.multiply(player.friction);
				player.jumpCounter = 0;
			}

			player.velocity.elements.forEach(function(component){
				if(Math.abs(component) > player.size){
					component = player.size*component/Math.abs(component);
				}
			});

			if(isOnScreen(player.position.add(player.velocity))){
				player.position = player.position.add(player.velocity);
			}
			else{
				player.position.elements[1] = groundHeight - player.size;
			}

			if(isOnScreen(player.position.add(player.velocity))){
				player.position = player.position.add(player.velocity);
			}
			else{
				player.position.elements[1] = groundHeight - player.size;
				player.position.elements[0] = player.position.elements[0] > fullscreen.width/2 ? fullscreen.width - player.size : player.size;
			}

		}
	};
	return player;
}