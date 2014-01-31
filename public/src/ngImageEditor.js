
(function( angular ){

  'use strict';

  var app = angular.module( 'ngImageEditor', [] );

  var Overlay = function( canvas ){

    this.canvas_ = canvas;
    this.ctx_ = canvas.getContext("2d");
  };

  angular.extend( Overlay.prototype, {

    refresh:function(){

      var canvas = this.canvas_,
          parent = canvas.parentNode;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

    },

    converterToGray_:function(){

      var ctx = this.ctx_,
          canvas = this.canvas_,
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
          data = imgData.data,
          dataSize = data.length;

          for (var i = 0; i < dataSize ; i=i+4) {
            var r = data[i] ;
            var g = data[i + 1];
            var b = data[i + 2];
            var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];

            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
          }
          ctx.putImageData(imgData, 0, 0);
    },

    drawImageBlock:function( canvas, ctx, img, startLeft, startTop, imageWidth, imageHeight, blockWidth, blockHeight ){
    
      var rateW = blockWidth / canvas.width,
      rateH = blockHeight / canvas.height,
      imgLeft = startLeft / (canvas.width) * imageWidth,
      imgTop = startTop / ( canvas.height ) * imageHeight,
      endImgWidth = imageWidth * rateW,
      endImgHeight = imageHeight * rateH;
      
      
      ctx.drawImage( img, imgLeft, imgTop, endImgWidth, endImgHeight, startLeft, startTop, blockWidth, blockHeight );
    
    },

    render:function( img, selected, imageSize ){

      var ctx = this.ctx_,
          canvas = this.canvas_,
          width = canvas.width,
          height = canvas.height,
          widthRate = imageSize.width / width,
          heightRate = imageSize.height / height;

      //console.log( img.clientWidth );

      ctx.drawImage( img, 0, 0, width, height );

      this.converterToGray_();

      //console.log( selected, widthRate, widthRate * selected.width, imageSize.width, imageSize.height );

      this.drawImageBlock( canvas, ctx, img, selected.left, selected.top, imageSize.width, imageSize.height, selected.width, selected.height );
      //ctx.drawImage( img, selected.left * widthRate , selected.top * heightRate, imageSize.width * widthRate, imageSize.height * heightRate , selected.left, selected.top, selected.width, selected.height );

    },

    toDataURL:function( type, selected ){

      var canvas = this.canvas_,
          copyCanvas = document.createElement('canvas'),
          ctx = copyCanvas.getContext('2d');

      copyCanvas.width = selected.width;
      copyCanvas.height = selected.height;

      //this.drawImageBlock( copyCanvas, ctx, canvas, selected.left, selected.top, canvas.width, canvas.height, selected.width, selected.height );
      ctx.drawImage( canvas, selected.left, selected.top, selected.width, selected.height, 0, 0, selected.width, selected.height );

      return copyCanvas.toDataURL( type );

    }

  });

  app.directive( 'ngImageEditor', ['$q', function( $q ){

    var getImageSize = function( currentImg ){

      var img = new Image(),
          div = document.createElement('div'),
          deferred = $q.defer(),
          $body = angular.element( document.body );

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
        ngImageEditor:"=",
        selected:"="
      },

      template:'<div ng-mousemove="move( $event )" ng-mouseup="cancel( $event )" unselectable="on">' +
                 '<img unselectable="on" style="opacity:0;user-drag: none;width:100%;height:100%;" ng-src="{{imgSrc}}" ng-mousedown="$event.preventDefault()" />' +
                 '<canvas width="100%" height="100%" style="position:absolute;top:0px;left:0px;"></canvas>' +
                 '<div ng-image-selected></div>' +
               '</div>',
      controller:[ '$scope', '$element', '$attrs', function( $scope, $element, $attrs ){

        var canvas, $canvas, overlay, img, imgSize, SELECTED_BORDER_WIDTH = 2;

        $element.css({
          'position': 'relative',
          'user-drag':'none'
        }).attr('unselectable','on');

        $canvas = $element.find( 'canvas' );
        canvas = $canvas[0];
        overlay = new Overlay( canvas );
        img = $element.find( 'img' )[0];

        $scope.$watch( 'imgSrc', function( src ){

          var promise = getImageSize( src );

          promise.then(function( size ){
            imgSize = size;
            overlay.refresh();
            overlay.render( img, $scope.selected, imgSize );
            //console.log( overlay.toDataURL( "image/png" , $scope.selected ) );
          });
        });


        angular.extend( $scope, {

          move : function( $event ){

            var dragEvent = $scope.dragEvent,
                selected = $scope.selected,
                maxY = $element[0].clientHeight - selected.height - SELECTED_BORDER_WIDTH,
                maxX = $element[0].clientWidth - selected.width - SELECTED_BORDER_WIDTH,
                top, left;

            if ( dragEvent ) {

              //console.log( $event );
              top = selected.top - ( dragEvent.clientY -  $event.clientY );
              left = selected.left - ( dragEvent.clientX - $event.clientX );

              selected.top = top < -SELECTED_BORDER_WIDTH ? -SELECTED_BORDER_WIDTH :
                             top > maxY ? maxY : top;
              selected.left = left < -SELECTED_BORDER_WIDTH ? -SELECTED_BORDER_WIDTH :
                              left > maxX ? maxX : left;

              overlay.refresh();
              overlay.render( img, selected, imgSize );

              $scope.dragEvent = $event;

            }
          },

          cancel :function(){
            $scope.dragEvent = null;
          },

          ngImageEditor:{

            toDataURL:function( type ){

              var imageType = type ? type : "image/png";

              return overlay.toDataURL( imageType , $scope.selected );

            }
          }
        });


      }]
    };


  }]);

  app.directive( 'ngImageSelected', function(){

    return {
      require:'^ngImageEditor',
      selected:'=',
      template:'<div style="background:rgba(255, 255, 255, 0.1);border:2px dashed #eaeaea;cursor:pointer;position:absolute;" ng-style="{width:selected.width + \'px\' , height:selected.height + \'px\',left:selected.left + \'px\',top:selected.top + \'px\'}" ng-mousedown="dragEvent=$event;$event.preventDefault()"></div>',
      replace:true,
      link:function( scope, $element, attrs ){

      }
    };

  });

})( angular );

