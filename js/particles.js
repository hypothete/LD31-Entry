/*global ftx, isOnScreen*/

'use strict';

//particles for attacks, effects

function MacahuitlSwing(left, position, velocity, manager){
	var swing = {
		type:{
			name: 'damageToEnemy',
			attackDamage: 5
		},
		baseTypeName: 'particle',
		id: Math.round(Math.random()*9999),
		size: 30,
		facingLeft: left,
		position: position,
		velocity: velocity,
		manager: manager,
		move: function(){
			swing.position = swing.position.add(swing.velocity);
		},
		draw: function(){
			ftx.fillStyle = 'white';
			ftx.save();
			ftx.translate(swing.position.elements[0],swing.position.elements[1]);
			ftx.scale(swing.facingLeft? -1 : 1, 1);
			ftx.beginPath();
			ftx.moveTo(0,0);
			ftx.arc(0,0,swing.size, 3*Math.PI/2+Math.PI/4,Math.PI/4, false);
			ftx.lineTo(0,0);
			ftx.closePath();
			ftx.fill();
			ftx.restore();
		}
	};
	swing.manager.add(swing);
	window.setTimeout(function(){
		swing.manager.delete(swing.id);
	},50);
	return swing;
}

function swordSwing(left, position, velocity, angle, manager){
	var swing = {
		type:{
			name: 'damageToPlayer',
			attackDamage: 1
		},
		baseTypeName: 'particle',
		id: Math.round(Math.random()*9999),
		size: 30,
		facingLeft: left,
		position: position,
		velocity: velocity,
		angle: angle,
		manager: manager,
		move: function(){
			swing.position = swing.position.add(swing.velocity);
		},
		draw: function(){
			ftx.fillStyle = '#ddd';
			ftx.save();
			ftx.translate(swing.position.elements[0],swing.position.elements[1]);
			ftx.scale(swing.facingLeft? -1 : 1, 1);
			ftx.beginPath();
			ftx.arc(0,0,swing.size, 3*Math.PI/2+swing.angle,swing.angle, false);
			ftx.lineTo(0,0);
			ftx.closePath();
			ftx.fill();
			ftx.restore();
		}
	};
	swing.manager.add(swing);
	window.setTimeout(function(){
		swing.manager.delete(swing.id);
	},50);
	return swing;
}

function arquebusBall(position, velocity, manager){
	var ball = {
		type:{
			name: 'damageToPlayer',
			attackDamage: 2
		},
		baseTypeName: 'particle',
		id: Math.round(Math.random()*9999),
		size: 4,
		position: position,
		velocity: velocity,
		manager: manager,
		move: function(){
			ball.position = ball.position.add(ball.velocity);
			if(!isOnScreen(ball.position)){
				ball.manager.delete(ball.id);
			}
		},
		draw: function(){
			ftx.fillStyle = '#666';
			ftx.save();
			ftx.translate(ball.position.elements[0],ball.position.elements[1]);
			ftx.beginPath();
			ftx.arc(0,0,ball.size, 2*Math.PI,0, false);
			ftx.lineTo(0,0);
			ftx.closePath();
			ftx.fill();
			ftx.restore();
		}
	};
	ball.manager.add(ball);
	return ball;
}