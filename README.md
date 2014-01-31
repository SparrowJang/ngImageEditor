ngImageEditor
=============

This is a image editor for angular.It can cut image.

##Dependency

* angularjs


##Install

```
bower install ngImageEditor
```

##Support

* IE9+
* chrome
* firefox

The input image is not cross domain.It is browser limit.

##Usage

Set some attrs of element.
```
<div img-src="imgSrc" ng-image-editor="imageEditor" selected="selected"></div>
```

Load a image for cut.
```
$scope.imgSrc='/images/head.jpeg';
```

Set a selected block size.
```
$scope.selected = {width:150,height:150,top:0,left:0};
```

Get a image data of selected block.
```
$scope.imageEditor.toDataURL();
```

##Demo
 
Clone this project.
 
```
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


