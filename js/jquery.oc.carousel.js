/**
 *
 * oc.carousel - Carousel Widget for jQuery v0.1
 *	http://www.oscarcao.com/jquery/carousel/
 * 
 * Copyright (c) 2011 Oscar Cao
 * (http://www.oscarcao.com)
 * 
 * This software is licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Requires: 
 * jQuery library (http://jquery.com)
 * and jQuery UI core/widget library (http://jqueryui.com)
 * 
 * Inspired by jCarousel by Jan Sorgalla 
 * (http://sorgalla.com/jcarousel/)
 *
 **/
(function($){
	$.widget('oc.carousel', {
		options: {
			visibleItems: 5, // determines the number of items that should be visible to the user at a single point in time
			slideItems: 5, // determines the number of items to be shifted on each scroll animation
			scrollSpeed: 100, // determines the scroll animation speed
			elementPos: 0, // keeps track of position of carousel when not in loopBack mode
			animateCount: 0, // used for animation purposes
			autoScroll: false, // sets carousel to auto scroll - requires carousel to be running in loopBack mode
			autoScrollDelay: 3000, // sets the interval between each auto scroll
			autoPauseScroll: true, // determines whether auto scrolling should pause when carousel on mouse hover event
			vertical: false, // orientation of carousel
			loopBack: false, // determines whether carousel should wrap around or not (circular effect)
			items: '> *', // references the items of interest in the carousel
			itemsOriginalStyle: '', // used to restore items back to original style settings
			controls: false, // override to force scroll button controls to be rendered out
			scrollLeftBtn: '<input type="button" value="<" />', // code used to generate scroll left/up button
			scrollRightBtn: '<input type="button" value=">" />' // code used to generate scroll right/down button
		},
		
		/**
		 *
		 * Widget Factory Initialization method
		 *
		 * @method _create
		 * @return An instance of oc.carousel
		 * @params none
		 **/
		_create: function(){
			var self = this, o = self.options, el = self.element;
			self.items = $(o.items, el);
			o.numItems = self.items.length;
			o.itemWidth = $(self.items[0]).outerWidth();
			o.itemHeight = $(self.items[0]).outerHeight();
			o.itemsOriginalStyle = $(self.items).attr('style');
			o.minPos = 0;
			if(!o.vertical){
				o.elementWidth = o.itemWidth * o.numItems;
				o.elementHeight = o.itemHeight;
				o.maxPos = -o.elementWidth + (o.visibleItems * o.itemWidth);
				o.scrollProp = 'left';
				o.scrollOffsetProp = o.itemWidth;
				self.items.each(function(i){
					$(this).css({
						float: 'left'
					});					
				});
			}
			else{
				o.elementWidth = o.itemWidth;
				o.elementHeight = o.itemHeight * o.numItems;
				o.maxPos = -o.elementHeight + (o.visibleItems * o.itemHeight);
				o.scrollProp = 'top';
				o.scrollOffsetProp = o.itemHeight;
			}
						
			$(el).wrap('<div class="oc-carousel" />');
			$(el).parent().css({
				width: !o.vertical ? parseInt(o.visibleItems * o.itemWidth, 10) + 'px' : parseInt(o.itemWidth, 10) + 'px',
				height: !o.vertical ? parseInt(o.itemHeight, 10) + 'px' : parseInt(o.visibleItems * o.itemHeight, 10) + 'px',
				overflow: 'hidden',
				float: !o.vertical ? 'left' : 'none',
				position: 'relative'
			});
			$(el).css({
				width: !o.vertical ? parseInt(o.numItems * o.itemWidth, 10) + 'px' : parseInt(o.itemWidth, 10) + 'px',
				height: !o.vertical ? parseInt(o.itemHeight, 10) + 'px' : parseInt(o.numItems * o.itemHeight, 10) + 'px',
				position: 'absolute',
				//left: '-' + parseInt(o.itemWidth) + 'px'
				left: '0px'
			});
			if(o.controls === true || (o.controls === false && o.numItems > o.visibleItems)){
				var $carousel = $(el).parent();
				$carousel.wrap('<div class="oc-carousel-wrapper" style="display:inline-block;" />');
				if(o.autoPauseScroll === true && o.autoScroll === true){
					$carousel.parent().bind({
						'mouseenter':	function(){
							self.stopAutoScroll();
						},
						'mouseleave':	function(){
							self.startAutoScroll();
						}
					});
				}
				o.scrollLeftBtn = !o.vertical ? $(o.scrollLeftBtn).css('float','left') :  $(o.scrollLeftBtn);
				o.scrollLeftBtn.insertBefore($carousel)
					.bind('click', function(){
						if(o.autoScroll)
							self.stopAutoScroll();
						self._scroll('left');
					});
				if(!o.loopBack || o.numItems <= o.visibleItems)
					o.scrollLeftBtn.attr('disabled', 'disabled');				
				o.scrollRightBtn = !o.vertical ? $(o.scrollRightBtn).css('float','left') :  $(o.scrollRightBtn);
				o.scrollRightBtn.insertAfter($carousel)
					.bind('click', function(){
						if(o.autoScroll)
							self.stopAutoScroll();
						self._scroll('right');
					});
				if(o.numItems <= o.visibleItems)
					o.scrollRightBtn.attr('disabled', 'disabled');
			}
			if(o.loopBack === true && o.autoScroll === true)
				self.startAutoScroll();
		},
		
		/**
		 *
		 * Handles carousel scrolling animation
		 *
		 * @method _scroll
		 * @return undefined
		 * @params options [Widget Factory Options Object], element [HTMLElement], scroll direction [String]
		 **/
		_scroll: function(direction){
			var self = this, o = self.options, el = self.element, animateProps;
			if(o.loopBack){
				var slideItem;
				if(direction === 'left'){
					slideItem = $(el).children(':last-child').detach();
					slideItem.insertBefore($(el).children(':first-child'));
					animateProps = !o.vertical ? {'left': '0px'} : {'top': '0px'};
					$(el).css(o.scrollProp, '-' + o.scrollOffsetProp + 'px').animate(animateProps, o.scrollSpeed, 'linear' , function(){
						o.animateCount++;
						if(o.animateCount === o.slideItems){
							self._endScroll();
						}
						else{
							self._scroll('left');
						}
					});
				}
				else{
					animateProps = !o.vertical ? {'left': '-' + o.scrollOffsetProp + 'px'} : {'top': '-' + o.scrollOffsetProp + 'px'};
					$(el).animate(animateProps, o.scrollSpeed, 'linear' , function(){
						slideItem = $(el).children(':first-child').detach();
						slideItem.insertAfter($(el).children(':last-child'));
						$(el).css(o.scrollProp, '0px');
						o.animateCount++;
						if(o.animateCount === o.slideItems){
							self._endScroll();
						}
						else{
							self._scroll('right');
						}
					});
				}
			}
			else{
				var newElPos = -(o.slideItems * o.itemWidth) + o.elementPos;
				animateProps = !o.vertical ? {'left' : newElPos + 'px'} : {'top' : newElPos + 'px'};
				if(direction === 'left'){
					if(o.elementPos === o.minPos){}
					else{
						if(newElPos > o.minPos){
							$(el).animate(animateProps, o.scrollSpeed, 'linear' , function(){
								o.elementPos = newElPos;
								o.animateCount++;
								if(o.animateCount === o.slideItems){
									self._endScroll();
								}
								else{
									self._scroll('left');
								}
							});
						}
						else{
							animateProps = !o.vertical ? {'left' : o.minPos + 'px'} : {'top' : o.minPos + 'px'};
							$(el).animate(animateProps, o.scrollSpeed, 'linear' , function(){
								o.elementPos = o.minPos;
								self._endScroll();
							});
						}						
					}
				}
				else{
					if(o.elementPos === o.maxPos){}
					else{
						if(newElPos > o.maxPos){
							$(el).animate(animateProps, o.scrollSpeed, 'linear' , function(){
								o.elementPos = newElPos;
								o.animateCount++;
								if(o.animateCount === o.slideItems){
									self._endScroll();
								}
								else{
									self._scroll('right');
								}
							});
						}
						else{
							animateProps = !o.vertical ? {'left' : o.maxPos + 'px'} : {'top' : o.maxPos + 'px'}
							$(el).animate(animateProps, o.scrollSpeed, 'linear' , function(){
								o.elementPos = o.maxPos;
								self._endScroll();
							});
						}	
					}
				}
			}
		},
		
		/**
		 *
		 * Prepares carousel for next scroll animation
		 *
		 * @method _endScroll
		 * @return undefined
		 * @params none
		 **/
		_endScroll: function(){
			var self = this, o = self.options, el = self.element;
			o.animateCount = 0;
			if(!o.loopBack)
				self._toggleScrollButtons();
			self._trigger('CarouselScrollEnded', null, el);
		},
		
		/**
		 *
		 * Determines whether the scroll buttons are enabled or disabled in non-loopBack mode
		 *
		 * @method _toggleScrollButtons
		 * @return undefined
		 * @params none
		 **/
		_toggleScrollButtons: function(){
			var self = this, o = self.options, el = self.element;
			o.scrollLeftBtn.attr('disabled', '');
			o.scrollRightBtn.attr('disabled', '');
			
			if(o.elementPos === o.maxPos)
				o.scrollRightBtn.attr('disabled', 'disabled');
			if(o.elementPos === o.minPos)
				o.scrollLeftBtn.attr('disabled', 'disabled');
		},
		
		/**
		 *
		 * Starts auto scrolling of the carousel
		 *
		 * @method _startAutoScroll
		 * @return undefined
		 * @params none
		 **/		
		startAutoScroll: function(){
			var self = this, o = self.options;
			if(o.autoScrollTimer === null || o.autoScrollTimer === undefined)
				o.autoScrollTimer = setInterval(function(){self._scroll('right')}, o.autoScrollDelay);
		},
		
		/**
		 *
		 * Stops/Pauses the auto scrolling of the carousel
		 *
		 * @method _stopAutoScroll
		 * @return undefined
		 * @params none
		 **/
		stopAutoScroll: function(){
			var self = this, o = self.options;
			clearInterval(o.autoScrollTimer);
			if(o.autoScrollTimer !== null || o.autoScrollTimer !== undefined)
				o.autoScrollTimer = null;
		},
		
		/**
		 *
		 * Widget Factory Destroy method
		 *
		 * @method destroy
		 * @return undefined
		 * @params none
		 **/
		destroy: function(){
			var self = this, o = self.options, el = self.element;
			if(o.controls){
				$(el).parent().next().remove().end().prev().remove().end().unwrap().end().unwrap().removeAttr('style');
				self.items.each(function(i){
					$(this).removeAttr('style').attr('style', o.itemsOriginalStyle);				
				});
			}
		}
	});
})(jQuery);