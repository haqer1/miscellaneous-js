var miscellaneous = miscellaneous || {};
if (!miscellaneous.css) miscellaneous.css = {};

/**
 * Adds "nomedia" (for use with :not() selector), & optionally min-w\d+px and/or max-w\d+px width 
 * classes for use in CSS in situations where clients fail to support width-related media queries 
 * properly. 
 * Width is determined using body innerWidth minus left & right padding.
 * Sample usage:<pre> 
 * <body onload="bmqw=new miscellaneous.css.BuggyMediaQueryWorkarounder(null,['#img1','#div2',
 *											'#table3'],[570,590,688,871], [true]);
 *											bmqw.addSpecialMediaQueryClassesIfNeeded();"></body>
 * </pre>.
 *
 * @param	noMediaClients	array of regex patterns to apply against user-agent string (e.g., 
 *													[/calibre/] (used for null or undefined (by default))).
 * @param	selectors				selectors of elements to apply width classes to.
 * @param	minWidths				optional array of applicable min-widths to detect (classes assigned will 
 *													be generated from them).
 * @param	heightsAuto			optional array of booleans to specify whether to set element height to 
 *													auto if no min-widths classes have been added for it.
 * @param	maxWidths				optional array of applicable max-widths to detect.
 */
miscellaneous.css.BuggyMediaQueryWorkarounder = function(noMediaClients, selectors, minWidths, 
																													heightsAuto, maxWidths) {
	var body = document.getElementsByTagName("body")[0];
	const PADDING_LEFT = body.style.paddingLeft >= 10 ? body.style.paddingLeft : 40;
	const PADDING_RIGHT = body.style.paddingRight >= 10 ? body.style.paddingRight : 40;
	const EXTRA_PADDING_ADJUSTMENT = 20;
	const PAGE_HORIZONTAL_MARGIN_ADJUSTMENT = PADDING_LEFT + PADDING_RIGHT; /*+ EXTRA_PADDING_ADJUSTMENT;*/
	const WIDTH_REGEX = /\s?\bmin-w\d+px\b/g;
	const MAX_WIDTH_REGEX = /\s?\bmax-w\d+px\b/g;
	const NO_MEDIA_REGEX = /\s?\bnomedia\b/g;
	const WIDTH_CHANGE_TIMEOUT = 75;
	var noMediaClientsArray = noMediaClients || [/calibre/i];
	var timeoutID;

	/** 
	 * Uses specified settings to perform class assignments once & ongoing dynamically upon window resizing.
	 */
	this.addSpecialMediaQueryClassesIfNeeded = function() {
		var nav = navigator.userAgent;
		for (var i = 0; i < noMediaClientsArray.length; i++)
			if (nav.match(noMediaClientsArray[i]) != null) {
				if (selectors) {
					for (var j = 0; j < selectors.length; j++) {
						var elements = document.querySelectorAll(selectors[j]);
						for (var k = 0; k < elements.length; k++) {
							addClass(elements[k],"nomedia");
						}
					}
					handleWindthChanges();
				}
				break;
			}
	}

	function handleWindthChanges() {
		window.onresize = widthChangeTimeout;
		widthChange();
	}

	function widthChangeTimeout() {
		clearTimeout(timeoutID);
		timeoutID = setTimeout(widthChange, WIDTH_CHANGE_TIMEOUT); 
	}

	function widthChange() {
		for (var j = 0; j < selectors.length; j++) {
			var elements = document.querySelectorAll(selectors[j]);
			for (var k = 0; k < elements.length; k++) {
				assignWidthClasses(elements[k], heightsAuto ? heightsAuto[j] : false);
			}
		}
	}

	function assignWidthClasses(element, heightAutoIfNoMatch) {
		element.className = element.className.replace(WIDTH_REGEX,"");
		element.className = element.className.replace(MAX_WIDTH_REGEX,"");
		if (minWidths)
			for (var i = 0; i < minWidths.length; i++) {
				if (window.innerWidth >= minWidths[i]+PAGE_HORIZONTAL_MARGIN_ADJUSTMENT)
					addClass(element,"min-w" +minWidths[i]+ "px");
			}
		if (maxWidths)
			for (var i = 0; i < maxWidths.length; i++) {
				if (window.innerWidth <= maxWidths[i]+PAGE_HORIZONTAL_MARGIN_ADJUSTMENT)
					addClass(element,"max-w" +maxWidths[i]+ "px");
			}
		if (element.className.match(WIDTH_REGEX) == null) {
			if (heightAutoIfNoMatch)
				element.style.height="auto";
			return false;
		} /*else
			element.className = element.className.replace(NO_MEDIA_REGEX,"");*/

		return true;
	}

	function addClass(element, klass) {
		if (element) {
			if (element.className != null && element.className.length > 0)
				element.className+=' ';
			element.className+=klass;
		}
	}
}
