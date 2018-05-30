
(function() {
	'use strict';

	@@include('jquery.js')

var world = {
	el: {},
	camera: {
		mode: 'rotate',
		posX: 63,
		posY: 31,
		distance: 205,
		angleX: 144,
		angleY: -37
	},
	init: function() {
		this.doc = $(document);
		this.body = $('body');
		this.el.world    = $('.world');
		this.el.viewport = $('.viewport');
		this.el.ship     = $('.ship');
		this.el.info     = $('.info');
		this.el.cabinNr  = $('input[name="cabin-nr"]');
		this.el.cabinType = $('select[name="cabin-type"]');
		this.update();

		this.el.viewport.bind('mousedown', this.doEvent);
		this.body.on('click', '.nolink, [data-cmd], svg *', this.doEvent);
		this.body.on('change', 'select', this.doEvent);
		this.doc.on('keydown', this.doEvent);

		// temp
		//this.el.ship.addClass('show-backgrounds');
		//$('.cabins span:nth-child(3)').trigger('mousedown');
	},
	doEvent: function(event, el, orgEvent) {
		var self = world,
			cmd  = typeof event === 'string' ? event : event.type,
			xDiff,
			yDiff,
			camera,
			cId,
			name,
			value,
			pEl,
			srcEl;
		switch (cmd) {
			// native events
			case 'click':
				srcEl = $(this);
				pEl = srcEl.parent();
				cmd = srcEl.attr('href') || srcEl.attr('data-cmd');
				if (srcEl.attr('class') === 'cabin') {
					return self.doEvent('tag-cabin', srcEl);
				}
				if (!cmd) {
					srcEl = srcEl.hasClass('nolink') || srcEl.attr('data-cmd') ? srcEl : srcEl.parents('.nolink, [data-cmd]');
					if (!srcEl.length) return;
				}
				name = event.target.nodeName.toLowerCase()
				if (name === 'select') return;
				if (name !== 'input') {
					event.preventDefault();
				}
				if (pEl.hasClass('btn-group')) {
					pEl.find('.active').removeClass('active');
					srcEl.addClass('active');
				}

				if (srcEl.hasClass('disabled')) return;

				return self.doEvent(cmd, srcEl, event);
			case 'keydown':
				value = +self.el.cabinNr.val();
				if (event.which === 38) {
					self.el.cabinNr.val(value + 1);
				} else if (event.which === 40) {
					self.el.cabinNr.val(value - 1);
				}
				break;
			case 'change':
				srcEl = $(this);
				cmd = srcEl.attr('data-cmd');
				if (cmd) {
					event.preventDefault();

					self.doEvent(cmd, srcEl);
				}
				break;
			case 'mousedown':
				event.preventDefault();

				self.mDown = {
					winH: window.innerHeight,
					winW: window.innerWidth,
					posX: self.camera.posX,
					posY: self.camera.posY,
					dist: self.camera.distance,
					clientY: event.clientY,
					clientX: event.clientX,
					rY: -((self.camera.angleX / 180) - .5) * window.innerHeight,
					rX: ((self.camera.angleY / 180) + .5) * window.innerWidth
				};

				$(document).bind('mousemove mouseup', self.doEvent);
				break;
			case 'mousemove':
				if (!self.mDown) return;
				xDiff = self.mDown.clientX - event.clientX;
				yDiff = event.clientY - self.mDown.clientY;
				switch (true) {
					case (event.metaKey):
					case (self.camera.mode === 'zoom'):
						self.camera.distance = self.mDown.dist - yDiff;
						break;
					case (event.altKey):
					case (self.camera.mode === 'pan'):
						self.camera.posX = self.mDown.posX - xDiff;
						self.camera.posY = yDiff + self.mDown.posY;
						break;
					case (self.camera.mode === 'rotate'):
						self.camera.angleX = ((.5 - ((yDiff + self.mDown.rY) / self.mDown.winH)) * 180);
						self.camera.angleY = -((.5 - ((xDiff + self.mDown.rX) / self.mDown.winW)) * 180);
						break;
				}

				self.update();
				break;
			case 'mouseup':
				self.mDown = false;
				$(document).unbind('mousemove mouseup', self.doEvent);
				break;
			// custom events
			case 'tag-cabin':
				value = +self.el.cabinNr.val();
				el.attr({
					'class': 'cabin '+ self.el.cabinType.val(),
					'data-id': value
				});
				self.el.cabinNr.val(value+1);
				break;
			case 'camera-mode':
				self.camera.mode = el.attr('data-arg');
				break;
			case 'toggle-button':
				self.doEvent(el.attr('data-arg'), el.find('input').is(':checked'));
				break;
			case 'camera-info':
				self.el.info[arguments[1] ? 'addClass' : 'removeClass']('visible');
				break;
			case 'floor-outlines':
				self.el.ship[arguments[1] ? 'addClass' : 'removeClass']('show-floors');
				break;
			case 'floor-cabins':
				self.el.ship[arguments[1] ? 'addClass' : 'removeClass']('show-cabins');
				break;
			case 'floor-backgrounds':
				self.el.ship[arguments[1] ? 'addClass' : 'removeClass']('show-backgrounds');
				break;
			case 'extra':
				self.body.find('.config')[arguments[1] ? 'addClass' : 'removeClass']('expanded');
				break;
			case 'add-plus':
				srcEl = el.next('input');
				srcEl.val(+srcEl.val() + 1);
				break;
			case 'select-cabin-type':
				break;
			case 'select-floor':
				value = el.val();
				
				self.el.world.addClass('floor-zoom');
				self.el.ship.removeClass('show-only-floor-5 show-only-floor-6 show-only-floor-7 show-only-floor-8 show-only-floor-9 show-only-floor-10 show-only-floor-11 show-only-floor-12 show-only-floor-13 show-only-floor-14 show-only-floor-15 show-only-floor-16 show-only-floor-18');
				
				if (value === 'all') {
					self.camera = self.camera_prev_state;
					self.update();
					delete self.camera_prev_state;
				} else {
					self.el.ship.addClass('show-only-'+ value);
					// save current state of camera
					if (!self.camera_prev_state) {
						self.camera_prev_state = self.camera;
					}
					self.camera = {
						mode: 'rotate',
						posX: 20,
						posY: 0,
						distance: 638,
						angleX: 95,
						angleY: -90
					};
					self.update();
				}
				setTimeout(function() {
					self.el.world.removeClass('floor-zoom');
				}, 1000);
				break;
		}
	},
	update: function() {
		var el = world.el,
			cam = world.camera,
			t = 'translateX( ' + cam.posX + 'px ) '+
				'translateY( ' + cam.posY + 'px ) '+
				'translateZ( ' + cam.distance + 'px ) '+
				'rotateX( ' + cam.angleX + 'deg) '+
				'rotateY( ' + cam.angleY + 'deg)';
		el.world[0].style.webkitTransform = t;
		el.world[0].style.MozTransform = t;
		el.world[0].style.oTransform = t;

		t = 'translateX( ' + cam.posX + 'px ) '+
			'translateY( ' + cam.posY + 'px ) '+
			'translateZ( ' + cam.distance + 'px ) '+
			'rotateX( ' + parseInt(cam.angleX, 10) + 'deg) '+
			'rotateY( ' + parseInt(cam.angleY, 10) + 'deg)';
		el.info.html( t.replace(/\)/g, ')<br/>') );
	}
};

window.onload = world.init.bind(world);
window.world = world;

})();
