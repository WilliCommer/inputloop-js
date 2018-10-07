# inputloop

__InputLoop()__ is a light and easy to use javascript class to implement a input loop for console application.
It implemets a dispatcher for sending console input events to differnt handlers, that are defined in a JSON. 
It is less then 200 lines of code and require only the _readline_ module.

## Table of Contents

1.   [Motivation](#motivation)
2.   [Description](#description)
   1.   [Basic Usage](#basicuUsage)
   2.   [Example 2](#example2)
   3.   [Example using generators](#example3)
3.   [API](#api)
   1.   [Class Properties](#classproperties)
        1.   [context](#classcontext)
        2.   [line](#classline)
        3.   [loneLo](#classlinelo)
        4.   [firstChar](#classfirstchar)
        5.   [status](#classstatus)
        6.   [statusContext](#classstatuscontext)
        7.   [prompt](#classprompt)
   2.   [Class Methodes](#classmethodes)
        1.   [setContext()](#setcontext)
        2.   [addStatus()](#addstatus)
        3.   [start()](#classstart)
        4.   [stop()](#classstop)
        5.   [showPrompt()](#classshowprompt)
        6.   [setStatus()](#classssetstatus)
        7.   [writeInput()](#classswrite)
   3.   [Context Object](#contextobject)
        1.  [message](#contextmessage)
        2.  [prompt](#contextprompt)
        3.  [onLine()](#contextonline)
        4.  [onStatusEnter()](#contextenter)
        5.  [onStatusExit()](#contextexit)
        6.  [isKeyPress](#contextiskeypress)
   4.   [Context Generator](#contextgenerator)
        1.  [class StatusContext](#classstatuscontext)
        2.  [class StatusContext_Input](#classstatusContextinput)
        3.  [class StatusContext_Menu](#classstatusContextmenu)
4.   [Installation](#installation)	  
5.   [License](#license)	  
   


<a name="motivation"></a>
## Motivation

I needed somethig to controll a game via node.js console. 
So I started with the "[Tiny CLI][tinycli]" example in node.js readline documetation.
It is verry handy, bad it would not be a good idea to call my game out of the "on line" callback.
I also found a verry good package [Inquirer.js](https://www.npmjs.com/package/inquirer) to do this. It's feature is to make a linear list of questions with a lot of validating options.
But I found it to heavy for my little app that is not to ask a list of questions.


When I imagine my app as a "Finite-state machine" ([FSM][finalstatemachine]) then I need
+ some like the "Tiny CLI" example to start the __line input loop__
+ a __status__ to decide for what the readline event is used for
+ for each status a __function__ that handles the input and changes the status
+ a __table__ of functions for each status

![dispatcher][pic1]

The result is a tiny javascript class __InputLoop()__



<a name="description"></a>
## Description

<a name="basicusage"></a>
### Basic Usage

+ Import module _inputloop_
+ create a new _InputLoop_ object
+ add a _status_ with name and properties
+ call _start()_ 


```javascript

  const InputLoop = require('inputloop');
  var loop = new InputLoop();
  loop
    .addStatus('simple', {onLine: simpleFunc})
    .start();

  function simpleFunc( loop ) {
    console.log('you entered "%s" in simpleFunc', loop.line);
    process.exit(0);
  };
	
```
When you run this, console waits for input. 
Type for example "ddd" and your session will looks like this

![console1][console1]

When you call _loop.start()_, _loop_ will look in it's _context_ and set it's _status_ to the first status in the list.
In this case it is only the one status 'simple', which was inserted with _addStatus()_.
Then it checks the status properties. Most important is property _onLine_, it is the funtion to handle the input line event.
Other properties can be a _message_ or a special _prompt_.

The _loop_ will show a optional message and a prompt on console and wait for user input.
When the user press _Enter_ key, it will call function _onLoop( this )_ and gives a reference to it's self as parameter. 
So you have full access to the object in your handling function.
As you can see in the example, you can retrieve _loop.line_.
This is what the user typed into console.
The other interesting property is _loop.firstChar_, it is the first char of the input text in lower case.

In this example we will kill the process after the first line.
If we did not, then we have a endless input loop.
Usually we use the handling function to change the status in term of the user input.
That can be done with:
```
  loop.setStatus'other status');
```

Ok it's easy, but not very useful. Let's take a more complex example.

<a name="example2"></a>
### Example 2

There is an app that can change two variables _value_a_ and _value_b_.
The app starts with status _main_. 
This status will display a message and have a function to handle the _line input event_.
That function checks the user input and knows four options.
1. input is 'a' => change status to 'sub a'
2. input is 'b' => change status to 'sub b'
3. input is 'e' => change status to 'exit'
4. all other input will display a error message. _status_ will not be changed.

In javascript it is:
```javascript
{
  message: 'enter a,b or e to exit',
  onLine: function(loop) {
    switch (loop.firstChar) {
      case 'a': loop.setStatus('sub a'); break;
      case 'b': loop.setStatus('sub b'); break;
      case 'e': loop.setStatus('exit');  break;
      default:  console.log('"%s" is not a valid command', loop.line);
    }
  }
}
```



The complete app context can be defined in one object and assigned with _InputLoop.set(Context)_.

![console2][console2]

Here is the code for this example, you find it in _test.js_

---

```javascript
  const InputLoop = require('inputloop');

  // variables for the app
  var value_a = '';
  var value_b = '';


  // define a app1
  const app1 = {

    "main": {
      message: 'enter a,b or e to exit',
      onLine: function(loop) {
        switch (loop.firstChar) {
          case 'a': loop.setStatus('sub a'); break;
          case 'b': loop.setStatus('sub b'); break;
          case 'e': loop.setStatus('exit');  break;
          default:  console.log('"%s" is not a valid command', loop.line);
        }
      }
    },
	  
    "sub a": {
      message: 'enter a value for A',
      prompt:  ' A ? ',
      onLine:  (loop) => { 
        if (loop.line) {
          value_a = loop.line; 
          loop.setStatus('main'); 
        }  
      },
      onStatusEnter: (loop) => { console.log('actual value for A is "%s"', value_a); },
      onStatusExit:  (loop) => { console.log('new value for A is "%s"', value_a); }
    },
	  
    "sub b": {
      message: 'enter a value for B',
      prompt:  ' B ? ',
      onLine:  (loop) => { 
        if (loop.line) value_b = loop.line; 
        loop.setStatus('main'); 
      }
    },
	  
    "exit": {
      message: '',
      onStatusEnter: function( loop ) {
        console.log('good by');
        console.log('value A="%s",  value B="%s"', value_a, value_b);
        loop.stop();
        process.exit(0);
      }
    }
  };
  
  
  var loop = new InputLoop();
  loop
    .setContext(app1)
    .start();

```
---


<a name="example3"></a>
### Example using generators

```javascript

/* 
 * console-game.js
 * 
 */

const {InputLoop, StatusContext_Input, StatusContext_Menu, SelectItems} = require('./index.js');

module.exports = function () {
  
  var size   = {x:4,y:4};
  var level  = 1;
  var game   = new Game(size,level);

  // create menues
  // Main 
  var mainMenu = new StatusContext_Menu({
    message:    'Whats up',
    isMenu:     true,
    isKeyPress: true,
    items: [
      {key: 'N',  text: 'New game',     value: 'userplaystart', isDefault: true},
      {key: 'S',  text: 'Change size',  value: 'setsize'},
      {key: 'L',  text: 'Change level', value: 'setlevel'},
      {key: 'E',  text: 'Exit',         value: 'exit'}
    ]
  });
  

  // Set Size
  var setSize = new StatusContext_Input({
    message: 'Enter new size',
    checkInput: (loop) => {
      if (loop.line === '') return true;
      var s = parseInt(loop.firstChar);
      return Number.isInteger(s);
    },
    onDone: (loop) => {
      if (loop.line !== '') {
        var s = parseInt(loop.firstChar);
        if (Number.isInteger(s)) size = {x:s,y:s};
      }
      loop.setStatus('main');
    }
    //    onStatusEnter: (loop) => {console.log(loop.context['setsize']);}
  });  

  // Set Level
  var setLevel = new StatusContext_Menu({
    message: 'Select Level',
    isMenu: false,
    isKeyPress: true,
    items: [
      {key: '0', text: 'Dummy'},
      {key: '1', text: 'Normal'},
      {key: '2', text: 'Good'}
    ],
    onStatusEnter: () => { setLevel.setDefault('' + level);  },
    onDone: (loop) => {
      var s = parseInt(loop.firstChar);
      if (Number.isInteger(s)) {
        if ((s >= 0) && (s <= 2)) level = s;
      }
      loop.setStatus('main');
    }
  });

  
  var playMenu  = new StatusContext_Menu({
    message: "It's your turn",
    isMenu: true,
    isKeyPress: true,
    items: [
      {key: 'P', text: 'Play', value: 'userplay'},
      {key: 'U', text: 'Undo', value: 'undo'},
      {key: 'E', text: 'Exit', value: 'exitgame'}
    ],
    onStatusEnter: showBoard,
    onDone: (loop) => { playMenu.isShortPrompt = true; loop.setStatus(loop.line); },
    onFail: () => { playMenu.isShortPrompt = false; }
  });

  // define app
  var app = {
    'main':         mainMenu.context,
    'setsize':      setSize.context,
    'setlevel':     setLevel.context,
    'exit':         {
      onStatusEnter: (loop) => { 
        console.log('goodbye'); 
        process.exit(0); 
      }
    },
    'userplaystart': {
      isKeyPress: true,
      onStatusEnter: (loop) => { 
        console.log();
        console.log('- - - - - - - -');
        console.log();
        game = new Game(size,level);
        loop.setStatus('userplay');
      }},
    'userplay': playMenu.context,
    'showboard': {
       onStatusEnter: (loop) => {showBoard(); loop.setStatus('userplay'); }
    },
    'undo': {
       onStatusEnter: (loop) => { restoreGame(); loop.setStatus('userplay'); }
    },
    'exitgame': {
      onStatusEnter: (loop) => { console.log(); loop.setStatus('main'); }
    }
  };

  // create app loop
  var loop = new InputLoop();
  loop.setContext(app).start();

  
  
  // ===========================================
  // dummy functions
  
  function Game (size,level) {}
  function userPlay( loop ) {} // do some thing
  function restoreGame() {}
  function showBoard() {}
  
  
};

```
Sample session:

![console5][console5]

---
  















<a name="api"></a>
## API
### class InputLoop
Class implementation of the input loop.
```javascript
  var loop = new InputLoop();
```

<a name="classproperties"></a>
### Class Properties

<a name="classcontext"></a>
#### context
All status definitions. This will define the whole app flow. 
```javascript
loop.context = {
  "main": {
    message: 'Welcome',
    onLine: onLineMain
  },
  "sub a": {
    message: 'enter a value for A',
    prompt:  ' A ? ',
    onLine:  (loop) => { 
      if (loop.line) {
        value_a = loop.line; 
        loop.setStatus('main'); 
      }  
    },
  },
  "sub b": {
    message: 'enter a value for B',
    prompt:  ' B ? ',
    onLine:  onLineSubB
  },
};

```
You can also use function _setContext(myApp)_ if you like to chain function calls.
```
loop.setContext(myApp).setStatus('main').start();
```

<a name="classline"></a>
#### line
Actual user input. When the user type text and press enter, the _line_ event is fiered and the typed text will be stored here.
```javascript
if (loop.line === 'hello') console.log('world');
```
 
<a name="classlinelo"></a>
#### lineLo
A helper to get the user input in lower case. It is a class getter, so do not use brackets.
```javascript
if (loop.lineLo === 'hello') console.log('world');
```

<a name="classfirstchar"></a>
#### firstChar
A helper to get the first char of user input in lower case. It is a class getter, so do not use brackets.
```javascript
if (loop.firstChar === 'h') console.log('world');
```

<a name="classstatus"></a>
#### status
The name of the actual _status_. Use function _setStatus(newStatus) to change _status_.
```javascript
if (loop.status === 'menu1') setStatus('main');
```


<a name="classstatuscontext"></a>
#### statusContext
Object of the actual _status_. This is mainly used internally.

<a name="classprompt"></a>
#### prompt
The prompt will be displayed before user input. Default is __'%m\n> '__.
Place holder __%m__ inserts _message_. The prompt will be overwritten by the [prompt](contextprompt) in _status context_, if exists.




<a name="classmethodes"></a>
### Class Methodes
Class methodes are used to controll the _InputLoop_. All methodes returns _this_ and can be chained.
```
loop.setContext(myApp).setStatus('main').start();
```

<a name="setcontext"></a>
#### setContext( value )
Where _value_ is a object, it will set the application flow. You can also use property [context](#classcontext).

<a name="addstatus"></a>
#### addStatus( name, status )
Add a status definition into context. parameters are the name of this status and a _status context_ [property](classcontext).
```javascript
loop.addStatus('sub c', {
  message: 'enter a value for C',
    onLine:  (loop) => { 
      if (loop.line) value_b = loop.line; 
      loop.setStatus('main'); 
    }
});
```
  

<a name="classstart"></a>
#### start()
Starts the input loop. No parameter needed.

![fc_start][fc_start]

<a name="classstop"></a>
#### stop()
Stops the input loop.

![fc_stop][fc_stop]

<a name="classshowprompt"></a>
#### showPrompt()
showPrompt() can be called to display the prompt on console.

<a name="classssetstatus"></a>
#### setStatus( status = this.status )
Call `setStatus('new status')` to change the app status to 'new status'. 
A call without parameter will refresh the actual status.

![fc_setstatus][fc_setstatus]

<a name="classswrite"></a>
#### writeInput (str, key)
This function simulates user input. It uses note.js [readline](writedata) write(data,key).
_str_ is the text to write. _key_ is a alternative paramter for a  key sequence.


<a name="contextobject"></a>
### Context Object
Each status contect is a object. Here is an example where all properties are set.

```javascript
 var test_status = {
    message:       'Hello',
    prompt:        '%m world >',
    onLine:        (loop) => {console.log('input: %s', loop.line); loop.stop();},
    onStatusEnter: (loop) => {console.log('enter status: %s', loop.status);},
    onStatusExit:  (loop) => {console.log('exit status: %s', loop.status);},
    isKeyPress:    false
  };

  var loop = new InputLoop({test: test_status}).start();

```
![console3][console3]

<a name="contextmessage"></a>
#### message
This message will be displayed together with _prompt_. 
It can be a string or a function to suport internationalisation.

<a name="contextprompt"></a>
#### prompt
_prompt_ will override the default [prompt](classprompt). You can use place holder __%m__ to insert the context _message_.
It can be a string or a function to suport internationalisation.

<a name="contextonline"></a>
#### onLine()
_onLine_ will be fiered when user type return key. It has one parameter with a reference to the calling _InputLoop_ and do not expect a return value.

```javascript
onLine: function(loop) {
  if (loop.firstChar === 'b')
    loop.setStatus('sub b');
  else
    loop.setStatus('main');
}
```

<a name="contextenter"></a>
#### onStatusEnter()
_onStatusEnter(loop)_ will be fiered by _setStatus()_ after _status_ is set.

<a name="contextenter"></a>
#### onStatusExit()
_onStatusExit(loop)_ will be fiered by _setStatus()_ before _status_ is set.

<a name="contextiskeypress"></a>
#### isKeyPress
Set `isKeyPress = true` to return user input after the first charackter was typed. 
User do not have to type _Return_. _isKeypress_ works only when stdin is a TTY.

<a name="contextgenerator"></a>
### Context Generator
Most input issues are always the same coding. 

![fc_statusitem][fc_statusitem]

There are two classes to implement a __line input__ with validation (StatusContext_Input) 
and a __select list__ or __menue__ (StatusContext_Menu).
Both of them can be configured to return a status context to be used in app context.

Here is a example of a selection list with fruits

```javascript

// select a fruit example

  var menu = new StatusContext_Menu({
    message: 'Select a fruit',  
    isMenu: false,
    items: ['apple','pear','banana','cherry'],
    isKeyPress: true,
    onDone: loop => {
      console.log('EXIT: %s', loop.line);
      loop.stop();
      process.exit(0);
    }
  });
  
  loop = new InputLoop()
    .addStatus('start', menu.context)
    .start();
```

![console4][console4]

<a name="classstatuscontext"></a>
#### class StatusContext
This is an abstract class, not for usage. It is the base class for context generators.

__Properties__

+ __message__  
string or function for context [message](#contextmessage)
+ __prompt__  
optional string or function for context [message](#contextmessage)
+ __isKeyPress__  
optional boolean for context [isKeyPress](#contextiskeypress)
+ __onLine()__  
implementation of context [onLine()](#contextonline)
+ __onStatusEnter()__  
implementation of context [onStatusEnter()](#contextenter)
+ __onStatusExit()__  
implementation of context [onStatusExit()](#contextexit)
+ __onDone()__  
will be called when input is OK
+ __onFail()__  
will be called on wrong input
+ __checkInput()__  
optional implementation of input validation




<a name="contextgenerator"></a>
#### class StatusContext_Input
Generate a contetex for any text input.

```javascript
  loop.addStatus( 
    'enter_size', 
    new StatusContext_Input({
      message: 'Enter new size',
      onDone:     (loop) => { setSize(loop.line); },
      checkInput: (loop) => {
        if (loop.line === '') return false;
        return Number.isInteger(parseInt(loop.line));
      }
    })
  );  
```


<a name="classstatusContextmenu"></a>
#### class StatusContext_Menu
Generate a context for a selection list.
Most important property is __items__ a array of select options.
Each _item_ has the properties
+ __key__  
this is what user have to type to select the item.
+ __text__  
item description.
+ __value__  
this will be returned in _line_ after item is selected. 
It is optional, if not defined _key_ will be the result.
You can overwrite _getDoneValue()_
+ __isDefault__  
__onFail()__ will return the item that has _isDefault=true_. (optional)


Other properties of _StatusContext Menu_ are

+ __isMenu__  
when _true_ then _loop.status_ will be set to _value_ in _onDone()_
+ __isShortPrompt__  
select alternative prompt
+ __getDoneValue__  
optional function to handle return value


```javascript

  var mainMenu = new StatusContext_Menu({
    message:    'Whats up',
    isMenu:     true,
    isKeyPress: true,
    items: [
      {key: 'N',  text: 'New game',     value: 'userplaystart', isDefault: true},
      {key: 'S',  text: 'Change size',  value: 'setsize'},
      {key: 'L',  text: 'Change level', value: 'setlevel'},
      {key: 'E',  text: 'Exit',         value: 'exit'}
    ]
  });

  // if a array of string is used then strings will used as text and key will be set automatically

  var selectFruit = new StatusContext_Menu({
    message: 'Select a fruit',  
    items: ['apple','pear','banana','cherry'],
  });

```




<a name="installation"></a>
## Installation
```
npm install inputloop
```

```
const {InputLoop, StatusContext_Input, StatusContext_Menu, SelectItems} = require('inputloop');
```


<a name="license"></a>
## License
(c) 2018 by Willi Commer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 



---






[picx]: file://data/dispatcher.jpg
[pic1]: http://familiecommer.de/files/inputloop/dispatcher.jpg
[console1]: http://familiecommer.de/files/inputloop/console1.png
[console2]: http://familiecommer.de/files/inputloop/console2.png
[console3]: http://familiecommer.de/files/inputloop/console3.png
[console4]: http://familiecommer.de/files/inputloop/console4.png
[console5]: http://familiecommer.de/files/inputloop/console5.png
[fc_start]: http://familiecommer.de/files/inputloop/fc_start.png
[fc_stop]: http://familiecommer.de/files/inputloop/fc_stop.png
[fc_setstatus]: http://familiecommer.de/files/inputloop/fc_setstatus.png
[fc_statusitem]: http://familiecommer.de/files/inputloop/fc_statusitem.png

[finalstatemachine]: https://en.wikipedia.org/wiki/Finite-state_machine
[tinycli]: https://nodejs.org/dist/latest-v8.x/docs/api/readline.html#readline_example_tiny_cli
[writedata]: https://nodejs.org/dist/latest-v8.x/docs/api/readline.html#readline_rl_write_data_key

