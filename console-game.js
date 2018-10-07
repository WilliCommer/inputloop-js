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

  

