//code for Ludum Dare 31 Entry
//duncan@hypothete.com

/*global
	drawToPanels, Player, drawBg, Conq, conqTypes, intro, ending
*/

'use strict';

var keys = [],
	clicking = false,
	conqDistribution = [0, 0, 0, 0, 0, 0, 2, 2, 1, 1],
	conqsOnScreen = 3;

//collision manager
var entityMan = {
		entities: [],
		delete: function(id){
			var self = this;
			self.entities.forEach(function(part, partIndex){
				if(part.id == id){
					var recount = false;
					if(part.baseTypeName === 'conquistador'){
						recount = true;
						player.kills[part.type.name] = player.kills[part.type.name] ? player.kills[part.type.name]++ : 1;
					}
					self.entities.splice(partIndex, 1);
					if(recount){
						self.countConqs();
					}
				}
			});
		},
		add: function(newEntity){
			var self = this;
			self.entities.push(newEntity);
		},
		countConqs: function(){
			var countedConqs = 0;
			var self = this;
			self.entities.forEach(function(ent){
				if(ent.baseTypeName === 'conquistador'){
					countedConqs++;
				}
			});
			if(countedConqs < conqsOnScreen){
				conqsOnScreen++;
				for(var i=countedConqs; i<conqsOnScreen; i++){
					entityMan.add(new Conq(
						conqTypes[conqDistribution[Math.floor(Math.random()*conqDistribution.length)]],
						player,
						i*25 + 50,
						entityMan));
				}
			}
		}
	};

var player = new Player(entityMan);

function animate(){
	if(player.hp > 0){
		window.requestAnimationFrame(animate);
	}
	else{
		ending.domElement.classList.add('show');
		ending.translate.z = 50;
		for(var conqType in player.kills){
			ending.domElement.innerHTML += '<b>'+conqType+'s:</b> ' + player.kills[conqType] + '<br>'
		}
	}
	

	drawBg();
	player.checkForCollisions(entityMan.entities);
	player.move();
	player.draw();

	entityMan.entities.forEach(function(ent){
		if(ent.baseTypeName === 'conquistador'){
			ent.chooseState();
		}
		ent.move();
		if(ent.baseTypeName === 'conquistador'){
			ent.checkForCollisions(entityMan.entities);
		}
		ent.draw();
	});

	drawToPanels();
}

intro.on('click', function(){
	intro.domElement.classList.add('hide');
	intro.translate.z = -100;

	window.setTimeout(function(){
		entityMan.countConqs();
		animate();
	}, 1000);
});

//document eventListeners

document.addEventListener('mousedown', function(){
	clicking = true;
}, false);

document.addEventListener('mouseup', function(){
	clicking = false;
}, false);

document.addEventListener('keydown', function(e){
	keys[e.keyCode] = true;
}, false);

document.addEventListener('keyup', function(e){
	keys[e.keyCode] = false;
}, false);