
var Style = require('sketch/dom').Style;
var Document = require('sketch/dom').Document
var UI = require('sketch/ui');

// TODO: This code won't work until a bug in Sketch is fixed.
// https://github.com/BohemianCoding/SketchAPI/issues/230

export function onMakeBorders() {
	var document = Document.getSelectedDocument();
	
	var style = getStyle(document);

  	var regularBorderColor;
  	regularBorderColor = disableRegularBorders(style);

    var shadows = style.innerShadows;

    var borders = findBorders(shadows);

    var firstShadow = firstActiveInnerShadow(shadows);
    var borderColor;
    if (regularBorderColor != null) {
        borderColor = regularBorderColor;
    }
    else if (firstShadow != null) {
        borderColor = firstShadow.color;
    }
    else {
        borderColor = '#808080';
    }

    // Create borders that aren't already present
    if (borders.left == null) {
        shadows.push(makeInnerShadow(1, 0, borderColor));
    }
    if (borders.bottom == null) {
        shadows.push(makeInnerShadow(0, -1, borderColor));
    }
    if (borders.right == null) {
        shadows.push(makeInnerShadow(-1, 0, borderColor));
    }
    if (borders.top == null) {
       shadows.push(makeInnerShadow(0, 1, borderColor));
    }

    // TODO: Ensure that shadows appear in the order we want them to 

    style.innerShadows = shadows;

    reloadInspector(document);
}

export function onUpdateColors() {
	UI.message("TODO: This function needs to be updated to use the new API.");
	return;

    var style = getStyle(context);
    if (style === null) {
        return;
    }
    var shadows = style.innerShadows;

    var firstShadow = firstActiveInnerShadow(shadows);

    if (firstShadow != null) {
        var borderColor = firstShadow.color;
        var borders = findBorders(shadows);

        if (borders.top != null) {
            borders.top.setColor(borderColor)
        }
        if (borders.right != null) {
            borders.right.setColor(borderColor);
        }
        if (borders.bottom != null) {
            borders.bottom.setColor(borderColor);
        }
        if (borders.left != null) {
            borders.left.setColor(borderColor);
        }

        reloadInspector(document);
    }
    else {
    	UI.message("Selected object doesn't have any inner shadow borders.");
    }
}

function getStyle(document) {
	var selection = document.selectedLayers;

	if (selection.length != 1) {
		UI.message("Select one object");
		return null;
	}

	var item = selection.layers[0];
	if (item.type !== 'Shape') {
		UI.message("Selected object must be a shape");
		return null;
	}

	return item.style;
}

// Turn off any items in the "borders" section
function disableRegularBorders(style) {
    var firstBorderColor = null;

    // TODO: Yes, it's a real array
	// style.borders is not an actual array object, so it can't use .forEach
	for (var idx = 0; idx < style.borders.length; idx++) {
		var currBorder = style.borders[idx];
		if (currBorder.enabled == false) {
			continue;
		}

		currBorder.enabled = false;
		if (firstBorderColor == null) {
			firstBorderColor = currBorder.color;
		}		
	}

	return firstBorderColor;
}

function findBorders(shadows) {
    var borders = {};
    for (var idx = 0; idx < shadows.length; idx++) {
        var currShadow = shadows[idx];

        if (currShadow.blur != 0.0 || currShadow.spread != 0.0 || !currShadow.enabled) {
            continue;
        }

        if (currShadow.x == 0.0 && currShadow.y == 1.0) {
            borders.top = currShadow;
        }
        if (currShadow.x == -1.0 && currShadow.y == 0.0) {
            borders.right = currShadow;
        }
        if (currShadow.x == 0.0 && currShadow.y == -1.0) {
            borders.bottom = currShadow;
        }
        if (currShadow.x == 1.0 && currShadow.y == 0.0) {
            borders.left = currShadow;
        }
    }
    return borders;
}

function makeInnerShadow(x, y, borderColor) {
	return {
		spread: 0,
		blur: 0,
		x: x,
		y: y,
		color: borderColor,
	};
}

function firstActiveInnerShadow(shadows) {
    // First item in the UI is last in the array
    for (var idx = shadows.length - 1; idx >= 0; idx--) {
        var currShadow = shadows[idx];

        if (currShadow.blur != 0.0 || currShadow.spread != 0.0) {
            continue;
        }

        if (currShadow.enabled) {
            return currShadow;
        }
    }

    return null;
}

function reloadInspector(document) {
	var objCDocument = document.sketchObject;

	objCDocument.reloadInspector();
}
