node-classes
============

A collection of classes to be included in various NodeJS projects.  All classes are built on top of `class.extend` which can be installed via:
```
npm install class.extend
```

Events.js
---------

Description: A base class, allows for children to have events.
```javascript
var Events = require("./Events");
var blargh = new Events();

blargh.on("data", function(data) { console.log(data); }); // "{ honk: true }"

blargh.emit("data", { honk: true });
```

