//conq definition

/* global
	fullscreen, ftx, Vector, isOnScreen, swordSwing
*/

'use strict';

var groundHeight = 3*fullscreen.height/4;
var gravity = Vector.create([0,0.4]);

var caballeroSprite = new Image();
caballeroSprite.src = 'img/caballerosprites.png';

var rodeleroSprite = new Image();
rodeleroSprite.src = 'img/rodelerosprites.png';

var arquebusierSprite = new Image();
arquebusierSprite.src = 'img/arquebusiersprites.png';

var conqTypes = [
		{
			name: 'Rodelero',
			jumpSpeed: 1,
			walkSpeed: 1.1,
			hp: 100,
			size: 15,
			states: [
				'rest', 'walkleft', 'walkright', 'jump', 'attack'
			],
			stateSpeed: 80,
			range: 30,
			sprite: rodeleroSprite
		},
		{
			name: 'Caballero',
			jumpSpeed: 0,
			walkSpeed: 1.4,
			hp: 400,
			size: 30,
			states: [
				'rest', 'walkleft', 'walkright', 'jump', 'attack'
			],
			stateSpeed: 90,
			range: 40,
			sprite: caballeroSprite
		},
		{
			name: 'Arquebusier',
			jumpSpeed: 0.5,
			walkSpeed: 0.7,
			hp: 150,
			size: 25,
			states: [
				'rest', 'walkleft', 'walkright', 'jump', 'attack'
			],
			stateSpeed: 100,
			range: 50,
			sprite: arquebusierSprite
		}
	];

function Conq(type, target, x, manager){
	
	var conq = {
		id: Math.round(Math.random()*9999),
		type: type,
		baseTypeName: 'conquistador',
		manager: manager,
		target: target,
		hp: type.hp,
		position: Vector.create([x,groundHeight-100]),
		velocity: Vector.create([0,0]),
		friction: 0.8,
		walkSpeed: type.walkSpeed * (0.75+Math.random()*0.5-0.25),
		facingLeft: false,
		jumping: false,
		jumpCounter: 0,
		jumpMax: 5,
		jumpSpeed: type.jumpSpeed,
		size: type.size,
		state: type.states[0],
		stateCounter: 0,
		stateSpeed: type.stateSpeed,

		chooseState: function(){
			if(conq.stateCounter < conq.stateSpeed){
				conq.stateCounter++;
			}
			else{
				conq.stateCounter = 0;
				//state logic here

				if(conq.target.position.elements[0] < conq.position.elements[0] - conq.type.range){
					conq.state = 'walkleft';
				}
				else if(conq.target.position.elements[0] > conq.position.elements[0] + conq.type.range){
					conq.state = 'walkright';
				}
				else if(conq.target.position.elements[1] < conq.position.elements[1] && Math.abs(conq.position.elements[0] - conq.target.position.elements[0]) < conq.type.range && !conq.jumping){
					conq.state = 'jump';
				}

				if(Math.random()*1000 > 998){
					conq.state = 'rest';
				}
			}

			if(Math.abs(conq.position.elements[0] - conq.target.position.elements[0]) < conq.type.range+conq.size && conq.state !== 'rest'){
				conq.state = 'attack';
				conq.attack();
			}
		},

		draw: function(){
			ftx.strokeStyle = 'black';
			ftx.save();
			ftx.translate(conq.position.elements[0], conq.position.elements[1]);

			//draw hp

			ftx.strokeRect(-20, -conq.size*2,40,10);
			ftx.fillStyle = 'red';
			ftx.fillRect(-20, -conq.size*2,40*conq.hp/conq.type.hp,10);

			ftx.scale(conq.facingLeft?-1:1, 1);

			if(conq.type.hasOwnProperty('sprite')){
				//draw sprite
				var spriteIndex = 0;

				if(conq.state === 'injured'){
					spriteIndex = 3;
				}
				else if(conq.state === 'jump'){
					spriteIndex = 2;
				}
				else if(conq.state === 'attack'){
					spriteIndex = 1;
				}
				else if(conq.state === 'rest'){
					spriteIndex = 4;
				}

				ftx.drawImage(conq.type.sprite,
					spriteIndex*conq.size*4, 0, conq.size*4, conq.size*4, -conq.size*2, -conq.size*2, conq.size*4, conq.size*4);
			}
			else{
				ftx.beginPath();
				ftx.arc(0,0, conq.size, 0, Math.PI*2, false);
				ftx.lineTo(0,0);
				ftx.closePath();
				ftx.stroke();
			}
			
			ftx.restore();
		},

		checkForCollisions: function(set){
			//simplest collision checking - model as distance from a radius
			set.forEach(function(elem){
				if(conq.id !== elem.id && (conq.position.distanceFrom(elem.position) < conq.size + (elem.size || 0)) && elem.type.name !== 'damageToPlayer'){
					var stepBack = conq.position.subtract(elem.position).toUnitVector().multiply(conq.size);
					conq.position = conq.position.add(stepBack);

					if(elem.type.name === 'damageToEnemy'){
						conq.hp -= elem.type.attackDamage;
						conq.stateCounter=0;
						conq.state = 'injured';
						if(conq.hp <= 0){
							conq.manager.delete(conq.id);
						}
					}
				}
			});
		},

		move: function(){
			var potentialPosition;

			//left
			if(conq.state === 'walkleft'){
				conq.facingLeft = true;
				potentialPosition = conq.position.add(conq.velocity.add(Vector.create([-conq.size,0])));
				if(isOnScreen(potentialPosition)){
					conq.velocity = conq.velocity.add(Vector.create([-conq.walkSpeed*(conq.jumping? 0.0125 : 1),0]));
				}
				else{
					conq.velocity.elements[0] = 0;
				}
			}

			//right
			else if(conq.state === 'walkright'){
				conq.facingLeft = false;
				potentialPosition = conq.position.add(conq.velocity.add(Vector.create([conq.size,0])));
				if(isOnScreen(potentialPosition)){
					conq.velocity = conq.velocity.add(Vector.create([conq.walkSpeed*(conq.jumping? 0.0125 : 1),0]));
				}
				else{
					conq.velocity.elements[0] = 0;
				}
			}

			//jump
			if(conq.state === 'jump' && conq.jumpCounter < conq.jumpMax && isOnScreen(conq.position.add(conq.velocity.add(Vector.create([0,-conq.jumpSpeed]))))){
				conq.jumping = true;
				conq.jumpCounter ++;
				conq.velocity = conq.velocity.add(Vector.create([0,-conq.jumpSpeed]));
			}

			//attack
			if(conq.state === 'attack'){
				conq.velocity.elements[0] = 0;
				conq.facingLeft = conq.position.elements[0] - conq.target.position.elements[0] > 0 ? true : false;
				conq.stateCounter=0;
			}

			//gravity
			if(conq.position.elements[1]+conq.size+conq.velocity.elements[1] < groundHeight){
				conq.velocity = conq.velocity.add(gravity);
			}
			else{
				conq.jumping = false;
				conq.position.elements[1] = groundHeight - conq.size;
				conq.velocity.elements[1] = 0;
				conq.velocity = conq.velocity.multiply(conq.friction);
				conq.jumpCounter = 0;
			}

			conq.velocity.elements.forEach(function(component){
				if(Math.abs(component) > conq.size){
					component = conq.size*component/Math.abs(component);
				}
			});
			if(isOnScreen(conq.position.add(conq.velocity))){
				conq.position = conq.position.add(conq.velocity);
			}
			else{
				conq.position.elements[1] = groundHeight - conq.size;
				conq.position.elements[0] = conq.position.elements[0] > fullscreen.width/2 ? fullscreen.width - conq.size : conq.size;
			}
			

		},

		attack: function(){
			if(conq.type.name === 'Rodelero'){
				var swingParticle = swordSwing(
					conq.facingLeft,
					conq.position.add(Vector.create([conq.size*(conq.facingLeft?-1:1),0])),
					conq.velocity,
					Math.PI/4, conq.manager);
				conq.stateCounter = conq.type.stateSpeed;
			}
			else if(conq.type.name === 'Caballero'){
				var swingParticle = swordSwing(
					conq.facingLeft,
					conq.position.add(Vector.create([conq.size*(conq.facingLeft?-1:1),0])),
					conq.velocity,
					Math.PI/2, conq.manager);
				conq.stateCounter = conq.type.stateSpeed;
			}
			else if(conq.type.name === 'Arquebusier'){
				var arquebusShot = arquebusBall(
					conq.position.add(Vector.create([conq.size*(conq.facingLeft?-1:1),0])),
					Vector.create([(conq.facingLeft?-1:1)*8,0]),
					conq.manager
					);
			}
			conq.state = 'rest';
		}
	};
	return conq;
}