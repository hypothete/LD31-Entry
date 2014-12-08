//helpers, wrappers

'use strict';

var Dom3D = {
	create: function(dom){
		var domW = {
			domElement: dom,
			translate: {x:0, y:0, z:0},
			rotate: {x:0, y:0, z:0},
			startObservers: function(){
				Object.observe(domW.translate, domW.updateTransform);
				Object.observe(domW.rotate, domW.updateTransform);
			},
			updateTransform: function(){
				domW.domElement.style.transform = 'translate3d('+(domW.translate.x)+'px, '+(domW.translate.y)+'px, '+(domW.translate.z)+
					'px) rotateX('+(domW.rotate.x)+'deg) rotateY('+(domW.rotate.y)+'deg) rotateZ('+(domW.rotate.z)+'deg)';
			},
			on: function(eventType, handler){
				domW.domElement.addEventListener(eventType, handler, false);
			}
		};

		domW.startObservers();

		return domW;
	}
};

function dQ(selector){
	return document.querySelector(selector);
}