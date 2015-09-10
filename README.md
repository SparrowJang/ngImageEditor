ngImageEditor
=============

![demo image](/public/images/screenprint.png)

This is a image editor for angular.It can cut image.

##Dependency

* angularjs

##Demo

[demo](http://www.sparrowjang.com/example/bower_components/ngImageEditor/public/index.html)

##Install

```
bower install ngImageEditor
```

or

```
npm install ng-image-editor
```

##Support

* IE9+
* chrome
* firefox

The input image is not cross domain.It is browser limit.

You can add this header to your server to resolve cross domain.

```
Access-Control-Allow-Origin: http://your.domain.com
```

##Usage

Set some attrs of element.

```html
<div img-src="imgSrc" ng-image-editor="imageEditor" selected="selected"></div>
```

Load a image for cut.

```js
$scope.imgSrc='/images/head.jpeg';
```

Set a selected block size.

```js
$scope.selected = {width:150,height:150,top:0,left:0};
```

Get a image data of selected block.

```js
$scope.imageEditor.toDataURL();
```

##Method

###refresh
>Resize and render canvas

##Parameter

###enabledResizeSelector(optonal:default false)
>Set a resize selector to be enabled.

Create a attribute to tag.
```html
enabled-resize-selector="enableResizeSelector"
```

The enabled is true by set.
```js
$scope.enabledResizeSelector = true;
```

###imgSrc
>Set a editor image.

###Selected
>Set top、left、width and height for selector.

###toDataURL
>output a base64 string

##Event

###on-image-change( imgSize ) `Event`
>The image is loaded and rendered.

##Run
 
Clone this project.
 
```bash
git clone https://github.com/SparrowJang/ngImageEditor
 
cd ngImageEditor
```
 
Install the express framework and grunt modules.
```
npm install
```
 
run a server:
```
grunt server
```
 
Finally,open your brower,enter [http://localhost:3000/index.html](http://localhost/index.html).


