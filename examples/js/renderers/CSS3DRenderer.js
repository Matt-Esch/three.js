/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = 'absolute';
	this.element.style.WebkitTransformStyle = "preserve-3d";

	this.addEventListener( 'removed', function ( event ) {

		if ( this.element.parentNode !== null ) {

			this.element.parentNode.removeChild( this.element );

			for ( var i = 0, l = this.children.length; i < l; i ++ ) {

				this.children[ i ].dispatchEvent( event );

			}

		}

	} );

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );

//

THREE.CSS3DRenderer = function () {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;

	var matrix = new THREE.Matrix4();

	var domElement = document.createElement( 'div' );
	domElement.style.overflow = 'hidden';
	this.domElement = domElement;

	this.setClearColor = function () {

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';
	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

	};

	var getObjectCSSMatrix = function ( offsetX, offsetY, modelMatrix, viewMatrix ) {

		matrix.identity();
		matrix.elements[12] = offsetX;
		matrix.elements[13] = offsetY;
		matrix.multiply( viewMatrix );
		matrix.multiply( modelMatrix );

		var elements = matrix.elements;

		return 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	};

	var renderObject = function ( object, camera, viewMatrix, order ) {

		if ( object instanceof THREE.CSS3DObject ) {

			var element = object.element;

			var offsetX = -element.clientWidth / 2
			var offsetY = -element.clientHeight / 2
			var style;

			if ( object instanceof THREE.CSS3DSprite ) {

				// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

				matrix.copy( camera.matrixWorldInverse );
				matrix.transpose();
				matrix.copyPosition( object.matrixWorld );
				matrix.scale( object.scale );

				matrix.elements[ 3 ] = 0;
				matrix.elements[ 7 ] = 0;
				matrix.elements[ 11 ] = 0;
				matrix.elements[ 15 ] = 1;

				style = getObjectCSSMatrix( offsetX, offsetY, matrix, viewMatrix );

			} else {

				style = getObjectCSSMatrix( offsetX, offsetY, object.matrixWorld, viewMatrix );

			}

			element.style.WebkitTransform = style;
			element.style.MozTransform = style;
			element.style.oTransform = style;
			element.style.msTransform = style;
			element.style.transform = style;

			/*if (element.parentNode) {
				element.parentNode.removeChild(element)
			}*/

			if (!element.parentNode) {
				domElement.appendChild(element)
			}

			order.push({
				element: element,
				z: matrix.elements[14]
			})

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera, viewMatrix, order );

		}

	};

	var viewMatrix  = new THREE.Matrix4();
	var position = new THREE.Matrix4();

	this.render = function ( scene, camera ) {

		var order = []
		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

		domElement.style.WebkitPerspective = fov + "px";
		domElement.style.MozPerspective = fov + "px";
		domElement.style.oPerspective = fov + "px";
		domElement.style.msPerspective = fov + "px";
		domElement.style.perspective = fov + "px";

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

        viewMatrix.copy( camera.matrixWorldInverse );

        position.identity()

        var e = position.elements;
        e[5] = -1;
        e[12] = _widthHalf;
        e[13] = _heightHalf;
        e[14] = fov;

        viewMatrix.copy( position );
		viewMatrix.multiply( camera.matrixWorldInverse );

		renderObject( scene, camera, viewMatrix, order );

/*
		order.sort(depthSort)

		order.forEach(function (d) {
			domElement.appendChild(d.element)
		}) */

	};

	function depthSort(a, b) {
	    if (a.z < b.z) {
	        return -1;
	    } else if (a.z > b.z) {
	        return 1;
	    } else {
	        return 0;
	    }
	}

};
