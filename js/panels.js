/*global
	Dom3D, dQ, clicking
*/

//panel management

'use strict';

var mainaxis = dQ('.mainaxis'),
	flpanel = dQ('.farleftpanel'),
	lpanel = dQ('.leftpanel'),
	rpanel = dQ('.rightpanel'),
	frpanel = dQ('.farrightpanel'),
	intro = Dom3D.create(dQ('.intro')),
	ending = Dom3D.create(dQ('.ending')),
	fullscreen = document.createElement('canvas'),
	ftx = fullscreen.getContext('2d'),
	panels = [Dom3D.create(flpanel), Dom3D.create(lpanel), Dom3D.create(rpanel), Dom3D.create(frpanel)],
	panelctx = panels.map(function(panel){
		return panel.domElement.getContext('2d');
	}),
	axis = Dom3D.create(mainaxis),
	bg = document.createElement('img');

fullscreen.width = 800;
fullscreen.height = 600;

axis.translate.x = window.innerWidth/2;
axis.translate.y = window.innerHeight/2;
axis.translate.z = 260;
axis.domElement.width = axis.domElement.height = '0px';

intro.translate.x = -400;
intro.translate.y = -300;
intro.translate.z = 50;

ending.translate.x = -400;
ending.translate.y = -300;
ending.translate.z = -100;

bg.src = 'img/bg.png';

var panelSpacing = Math.round(Math.sqrt((Math.pow(fullscreen.width/panels.length,2))/2));

panels.forEach(function(panel, panelIndex){
	panel.domElement.height = fullscreen.height;
	panel.domElement.width = fullscreen.width/panels.length;

	if(panelIndex === 0){
		panel.domElement.style.transformOrigin = '100% 50%';
		panel.translate.x = panelSpacing*(panelIndex-2.2);
		panel.translate.z -= panelSpacing/2;
	}
	else if(panelIndex+1 == panels.length){
		panel.domElement.style.transformOrigin = '0% 50%';
		panel.translate.x = panelSpacing*(panelIndex-1.8);
		panel.translate.z -= panelSpacing/2;
	}
	else{
		panel.translate.x = panelSpacing*(panelIndex-2);
	}
	panel.translate.y = -panel.domElement.height/2;
	panel.rotate.y = 90*((panelIndex+1)%2) - 45;
});

function drawBg(){
	ftx.drawImage(bg, 0,0);
}

function drawToPanels(){
	panels.forEach(function(panel, panelIndex){
		panelctx[panelIndex].drawImage(fullscreen,
			panelIndex*fullscreen.width/panels.length, 0, fullscreen.width/panels.length, fullscreen.height,
			0, 0, panel.domElement.width, panel.domElement.height);
	});
}

function isOnScreen(x,y){ //works with Vectors and xy coords
	var tx, ty;
	if(x.hasOwnProperty('elements')){
		tx = x.elements[0];
		ty = x.elements[1];
	}
	else{
		tx = x;
		ty = y;
	}
	if(tx < fullscreen.width && ty < fullscreen.height && tx >= 0 && ty >= 0){
		return true;
	}
	return false;
}

document.addEventListener('mousemove', function(evt){
	if(clicking){
		axis.rotate.y= 90*evt.pageX/window.innerWidth - 45;
		axis.rotate.x = 45*evt.pageY/window.innerHeight - 22.5;
	}
}, false);

document.addEventListener('wheel', function(evt){
	axis.translate.z -= evt.deltaY/10;
}, false);

window.onresize = function(){
	axis.translate.x = window.innerWidth/2;
	axis.translate.y = window.innerHeight/2;
};