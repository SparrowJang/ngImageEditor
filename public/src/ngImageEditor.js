
app.directive( 'ngImageEditor', ['$q', '$document', function( $q, $document ){

  var getImageSize = function( currentImg ){

    var img = new Image(),
        div = document.createElement('div'),
        deferred = $q.defer(),
        $body = angular.element( document.body );

    img.crossOrigin = "Anonymous";

    div.style.cssText = "width:0px;height:0px;overflow:hidden;";

    img.onload = function(){

      var width, height;

      width = img.width;
      height = img.height;

      div.parentNode.removeChild( div );

      deferred.resolve({width:width,height:height});
    };

    div.appendChild( img );
    img.src = angular.isString( currentImg )? currentImg:currentImg.src;
    $body.append( div );

    return deferred.promise;
  };


  return {

    scope:{
      imgSrc:"=",
      ngImageEditor:"=?",
      onImgChange:"&",
      enabledResizeSelector:"=?",
      selected:"=",
      aspectRatio:"@?"
    },

    template:'<div ng-mouseup="cancel( $event )" unselectable="on">' +
               '<img unselectable="on" style="opacity:0;user-drag: none;width:100%;height:100%;" crossorigin="Anonymous" ng-src="{{imgSrc}}" ng-mousedown="$event.preventDefault()" />' +
               '<canvas width="100%" height="100%" style="position:absolute;top:0px;left:0px;"></canvas>' +
               '<div ng-image-selected></div>' +
             '</div>',

    /**
    * @param {Scope} $scope
    * @param {jqlite|jQuery} $element
    * @param {Attribute} $attrs
    */
    controller:[ '$scope', '$element', '$attrs', function( $scope, $element, $attrs ){

      var canvas, $canvas, overlay, img, imgSize, $body;

      $element.css({
        'position': 'relative',
        'user-drag':'none'
      }).attr('unselectable','on');

      $canvas = $element.find( 'canvas' );
      canvas = $canvas[0];
      overlay = new Overlay( canvas );
      img = $element.find( 'img' )[0];
      //img.crossOrigin = "Anonymous";
      $body = angular.element( document.body );

      var watcher = {

        /**
        * @param {String} src
        */
        imgSrc:function( src ){

          var promise = getImageSize( src );

          promise.then(function( size ){
            imgSize = size;
            overlay.refreshAndRender( img, $scope.selected, imgSize );
            $scope.onImgChange({imgSize:imgSize});
          });

        },

        /**
        * @param {Object} selected
        */
        selected:function( selected ){

          //
          if ( $scope.dragEvent == null && imgSize ) overlay.refreshAndRender( img, selected, imgSize );
        },

        /**
        *
        */
        aspectRatio:function(){
          var selected = $scope.selected;
          $scope.resizeSelected(selected.top, selected.left, selected.width, selected.height);
        }
      };

      $scope.$watch( 'imgSrc', watcher.imgSrc);
      $scope.$watch( 'aspectRatio', watcher.aspectRatio);
      $scope.$watchCollection( 'selected', watcher.selected);

      angular.extend( $scope, {

        /**
        * @param {Event} $event
        */
        move : function( $event ){

          var dragEvent = $scope.dragEvent,
              resizeStartEvent = $scope.resizeStartEvent,
              selected = $scope.selected,
              maxY = $element[0].clientHeight - selected.height,
              maxX = $element[0].clientWidth - selected.width,
              top, left;

          if ( dragEvent ) {

            top = selected.top - ( dragEvent.clientY -  $event.clientY );
            left = selected.left - ( dragEvent.clientX - $event.clientX );

            selected.top = top < 0 ? 0 :
                           top > maxY ? maxY : top;
            selected.left = left < 0 ? 0 :
                            left > maxX ? maxX : left;

            overlay.refreshAndRender( img, $scope.selected, imgSize );

            $scope.dragEvent = $event;

          } else if ( resizeStartEvent ) {

            this.onResizeSelected( $event );
          }
        },

        /**
        * @param {Event} $event
        */
        onResizeSelected:function( $event ){
            var resizeStartEvent = $scope.resizeStartEvent,
                y = resizeStartEvent.clientY - $event.clientY,
                x = resizeStartEvent.clientX - $event.clientX,
                resizeDirection = $scope.resizeDirection,
                selected = $scope.selected,
                lastTop, lastLeft, lastHeight, lastWidth;

            var fixAspect = function(){
                if(angular.isDefined($scope.aspectRatio)){
                    var changeInX = x < 0 ? x * -1 : x;
                    var changeInY = y < 0 ? y * -1 : y;
                    if(changeInX > changeInY){
                        if((x < 0 && y > -1) || (x > -1 && y < 0)){
                            x= y * -1;
                        }else{
                            x=y;
                        }
                    }else{
                        if((x < 0 && y > -1) || (x > -1 && y < 0)){
                            y= x * -1;
                        }else{
                            y=x;
                        }
                    }
                }
            }

            switch ( resizeDirection ) {

              case "nw":
                fixAspect();
                lastTop = selected.top - y;
                lastLeft = selected.left - x;
                lastWidth = selected.width + x;
                lastHeight = selected.height + y;
                break;

              case "ne":
                fixAspect();
                lastTop = selected.top - y;
                lastLeft = selected.left;
                lastWidth = selected.width - x;
                lastHeight = selected.height + y;
                break;

              case "sw":
                fixAspect();
                lastTop = selected.top;
                lastLeft = selected.left - x;
                lastHeight = selected.height - y;
                lastWidth = selected.width + x;
                break;

              case "se":
                fixAspect();
                lastTop = selected.top;
                lastLeft = selected.left;
                lastWidth = selected.width - x;
                lastHeight = selected.height - y;
                break;

              case "tr":
                lastTop = selected.top - y;
                lastHeight = selected.height + y;
                lastLeft = selected.left;
                lastWidth = selected.width;
                break;

              case "br":
                lastTop = selected.top;
                lastHeight = selected.height - y;
                lastLeft = selected.left;
                lastWidth = selected.width;
                break;

              case "lc":
                lastTop = selected.top;
                lastHeight = selected.height;
                lastLeft = selected.left - x;
                lastWidth = selected.width + x;
                break;

              case "rc":
                lastTop = selected.top;
                lastHeight = selected.height;
                lastLeft = selected.left;
                lastWidth = selected.width - x;
                break;

            }

            lastHeight = lastTop < 0 ? lastHeight + lastTop:lastHeight;
            lastWidth = lastLeft < 0 ? lastWidth + lastLeft:lastWidth;

            this.resizeSelected( lastTop, lastLeft, lastWidth, lastHeight );
            $scope.resizeStartEvent = $event;

        },

        /**
        * @param {Number} top
        * @param {Number} left
        * @param {Number} width
        * @param {Number} height
        */
        resizeSelected:function( top, left, width, height ){

          var  selected = $scope.selected,
               maxY = $element[0].clientHeight - selected.top,
               maxX = $element[0].clientWidth - selected.left;

            var newWidth = width <= maxX ? (width < 0 ? 0 : width) : maxX,
                newHeight = height <= maxY ? (height < 0 ? 0 : height) : maxY;

            if (angular.isDefined($scope.aspectRatio)) {

                var aspectRatio = parseInt($scope.aspectRatio.split(':')[0])/
                                  parseInt($scope.aspectRatio.split(':')[1]);

                if(isNaN(aspectRatio))
                  throw 'Invalid aspect-ratio';

                var takeWidth = function () {
                    var aspectHeight = newWidth / aspectRatio;

                    if ( aspectHeight > maxY ) {
                      selected.height = maxY;
                      selected.width = maxY * aspectRatio;
                    } else {
                      selected.height = aspectHeight;
                      selected.width = newWidth;
                    }

                    selected.left = left > 0 ?
                            (left < selected.left + selected.width ? left : selected.left) : 0;
                }

                var takeHeight = function () {
                    var aspectWidth = newHeight * aspectRatio;

                    if ( aspectWidth > maxX ) {
                      selected.width = maxX;
                      selected.height = maxX / aspectRatio;
                    } else {
                      selected.height = newHeight;
                      selected.width = newHeight * aspectRatio;
                    }

                    selected.left = left > 0 ?
                            (left < selected.left + selected.width ? left : selected.left) : 0;
                }

                if (selected.width == newWidth) {
                    takeHeight();
                } else if (selected.height == newHeight) {
                    takeWidth();
                } else if (height - newHeight > width - newWidth) {
                    takeHeight();
                } else {
                    takeWidth();
                }
            } else {
                selected.top = top > 0 ?
                    (top < selected.top + selected.height ? top : selected.top) : 0;
                selected.left = left > 0 ?
                    (left < selected.left + selected.width ? left : selected.left) : 0;
                selected.width = width <= maxX ? (width < 0 ? 0 : width) : maxX;
                selected.height = height <= maxY ? (height < 0 ? 0 : height) : maxY;
            }
        },

        cancel :function(){
          $scope.dragEvent = null;
          $scope.resizeStartEvent = null;
        },

        ngImageEditor:{

          /**
          * @param {String} type
          * @return String
          */
          toDataURL:function( opts ){
            var _opts = {imageType:"image/png", img:img, imgSize:imgSize};

            if ( typeof opts === "string" ) {
              _opts["imageType"] = opts;
            } else {
              _opts = angular.extend(_opts, opts);
            }

            return overlay.toDataURL( $scope.selected, _opts );

          },

          refresh:function(){

            overlay.refreshAndRender( img, $scope.selected, imgSize );
          }
        }
      });

      $document.on('mousemove', function( $event ){
        $scope.move( $event );
        $scope.$apply();
      });

      $document.on( "mouseup", function(){
        $scope.cancel();
      });

    }]
  };


}]);

app.directive( 'ngImageSelected', function(){

  return {
    require:'^ngImageEditor',
    selected:'=',
    template:'<div style="box-sizing:border-box;background:rgba(255, 255, 255, 0.1);border:2px dashed #eaeaea;cursor:all-scroll;position:absolute;" ng-style="{width:selected.width + \'px\' , height:selected.height + \'px\',left:selected.left + \'px\',top:selected.top + \'px\'}" ng-mousedown="dragEvent=$event;$event.preventDefault()">' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'nw\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;left: -4px;position: absolute; cursor: nw-resize;"></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'ne\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;right: -4px;position: absolute; cursor: ne-resize;"></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'sw\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;left: -4px;position: absolute; cursor: sw-resize;"></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'se\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;right: -4px;position: absolute; cursor: se-resize; "></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'tr\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);top: -4px;right: 49%;position: absolute; cursor: row-resize; "></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'br\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: -4px;right: 49%;position: absolute; cursor: row-resize; "></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'lc\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: 49%;left: -4px;position: absolute; cursor: col-resize;; "></div>' +
                '<div ng-style="{display:enabledResizeSelector?\'block\':\'none\'}" ng-mousedown="onResizeBlock( $event, \'rc\' )" style="width: 8px;height: 8px;background: rgba(151, 151, 151, 0.7);bottom: 49%;right: -4px;position: absolute; cursor: col-resize;; "></div>' +
              '</div>',
    replace:true,

    /**
    * @param {Scope} scope
    * @param {jqlite|jQuery} $element
    * @param {Attribute} attrs
    */
    link:function( scope, $element, attrs ){

      angular.extend( scope, {
        /**
        * @param {Event} event
        * @param {String} direction
        */
        onResizeBlock:function( event , direction){

          event.preventDefault();
          event.stopPropagation();

          this.resizeStartEvent = event;
          this.resizeDirection = direction;

        }

      });
    }
  };

});
