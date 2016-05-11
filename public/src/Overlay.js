
/**
* @class
* @param {Canvas} canvas
*/
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
        imgData,
        data,
        dataSize;
      
      if(canvas.width != 0 && canvas.height != 0){
          imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
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
      }
  },

  /**
  * @param {Canvas} canvas
  * @param {Context} ctx
  * @param {Image} img
  * @param {Number} startLeft
  * @param {Number} startTop
  * @param {Number} imageWidth
  * @param {Number} imageHeight
  * @param {Number} blockWidth
  * @param {Number} blockHeight
  */
  drawImageBlock:function( canvas, ctx, img, startLeft, startTop, imageWidth, imageHeight, blockWidth, blockHeight ){
  
    var rateW = blockWidth / canvas.width,
    rateH = blockHeight / canvas.height,
    imgLeft = startLeft / (canvas.width) * imageWidth,
    imgTop = startTop / ( canvas.height ) * imageHeight,
    endImgWidth = imageWidth * rateW,
    endImgHeight = imageHeight * rateH;
    
    
    ctx.drawImage( img, imgLeft, imgTop, endImgWidth, endImgHeight, startLeft, startTop, blockWidth, blockHeight );
  
  },

  /**
  * @param {Image} img
  * @param {Object} selected
  * @param {Object} imageSize
  */
  render:function( img, selected, imageSize ){
      
      if(imageSize){

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
            //ctx.drawImage( img, selected.left * widthRate , selected.top * heightRate, imageSize.width * widthRate, imageSize.height * heightRate , selected.left,            selected.top, selected.width, selected.height );
      }

  },

  /**
  * @param {Image} img
  * @param {Object} selected
  * @param {Object} imageSize
  */
  refreshAndRender:function( img, selected, imageSize ){

     this.refresh();
     this.render( img, selected, imageSize );
  },

  /**
  * @param {String} type
  * @param {Object} selected
  * @return String
  */
  toDataURL:function( selected, opts ){

    var canvas = this.canvas_,
        copyCanvas = document.createElement('canvas'),
        ctx = copyCanvas.getContext('2d');

    if ( !opts.useOriginalImg ) {
      copyCanvas.width = selected.width;
      copyCanvas.height = selected.height;
      ctx.drawImage( canvas, selected.left, selected.top, selected.width, selected.height, 0, 0, selected.width, selected.height );
    } else {
      var img = opts.img;
      var imgSize = opts.imgSize;
	  var ratioWidth = canvas.width / imgSize.width;
      var ratioHeight = canvas.height / imgSize.height;
      var outputWidth = selected.width / ratioWidth;
      var outputHeight = selected.height /ratioHeight;
      var startLeft = selected.left / ratioWidth;
      var startTop  = selected.top / ratioHeight;
      var cropWidth = selected.width / ratioWidth;
      var cropHeight = selected.height / ratioHeight;
      
      copyCanvas.width = outputWidth;
      copyCanvas.height = outputHeight;
      ctx.drawImage( img, startLeft, startTop, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight );
    }

    //this.drawImageBlock( copyCanvas, ctx, canvas, selected.left, selected.top, canvas.width, canvas.height, selected.width, selected.height );

    return copyCanvas.toDataURL( opts.imageType );

  }

});


