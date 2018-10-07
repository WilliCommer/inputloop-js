/* 
 * 
 * inputloop test functions
 * 
 */


const {InputLoop, StatusContext_Input, StatusContext_Menu, SelectItems} = require('./index.js');

// variables for the app
var value_a = '';
var value_b = '';
var loop = new InputLoop;

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
        

// -----------------------------


function testcase1 () {
  loop.context = app1;
  loop.start();
}

function example_2 () {
  loop.setContext(app1).start();
}

function testcase3 () {
  loop.setContext(app1).setStatus('sub b').start();
}

function testcase4 () {
  loop
   .addStatus('main',  app1["main"])
   .addStatus('sub a', app1["sub a"])
   .addStatus('sub b', app1["sub b"])
   .addStatus('exit',  app1["exit"])
   .start();
}

function testcase5 () {
  loop
   .addStatus('simple', {
     onLine: simpleFunc
    })
   .start();
}


// -----------------------------


function simpleFunc( loop ) {
  console.log('you entered "%s" in simpleFunc', loop.line);
  process.exit(0);
}

// -----------------------------

function testcase6() {
  
  var menu = new StatusContext_Menu({
    message: 'Select a fruit',  
    isMenu: false,
    items: ['apple','pear','banana','cherry'],
    isKeyPress: true,
//    getDoneValue: item => { return item.text; },
    onDone: loop => {
      console.log('EXIT: %s', loop.line);
      loop.stop();
      process.exit(0);
    }
  });
  
  loop = new InputLoop()
    .addStatus('start', menu.context)
    .start();
 
}



// -------------------------------

function test_context_example() {

  var test_status = {
    message:       'Hello',
    prompt:        '%m world >',
    onLine:        (loop) => {console.log('input: %s', loop.line); loop.stop();},
    onStatusEnter: (loop) => {console.log('enter status: %s', loop.status);},
    onStatusExit:  (loop) => {console.log('exit status: %s', loop.status);},
    isKeyPress:    false
  };

  var loop = new InputLoop({test: test_status}).start();

};


// -------------------------------

function guess_a_number_example () {
  
  var game = require('./guess-a-number.js');
  game.game();
  
}


// -------------------------------
function test_consolegame()  {
  require('./console-game.js')();
}
 
// -------------------------------





function run_function_list() {

  
  function test_list_menu() {
    var a = [];
    for (let i in test_list) {
      let o = test_list[i];
      a.push({value: o, text: o.text}); 
    }
    return a;
  }
    
  var menu = new StatusContext_Menu({
    message: 'Select a test',  
    isMenu: false,
    isKeyPress: true,
    items: test_list_menu(),
    onDone: loop => {loop.stop();  handelFunc(loop.line); }
  });
  
  var loop = new InputLoop();
  loop.addStatus('menu', menu.context).start();

  function handelFunc (func) {
    console.log( '----- Source -----' );
    displaySource(func.func);
    console.log( '----- Start -----' );
    let f = func.func;
    if (Array.isArray(f)) 
      f = f[0];
    f();
//    console.log( '----- end -----' );
//    process.exit(0);
  };


}


// -----------------------------





const test_list = {
  'mini app 1': {func: [testcase1,'app1',app1], text: 'Mini app with two inputs. Set context and start.' },
  'mini app 2': {func: example_2, name: 'Example 2', text: 'Mini app with two inputs. Use setContext() and start.' },
  'mini app 3': {func: testcase3, name: ' Mini app 3', text: 'Mini app with two inputs. Test chaned calls.' },
  'mini app 4': {func: testcase4, name: ' Mini app 4', text: 'Mini app with two inputs. Use addStatus.' },
  'SimpleFunc': {func: [testcase5,simpleFunc], text: 'Add a simple function' },
  'simpe select': {func: testcase6, text: 'Simple fuit select using StatusContext_Menu' },
  'context example': {func: test_context_example, text: 'readme context example' },
  'console game': {func: test_consolegame, text: 'console game example' }
};


function displaySource (value) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((f) => {displaySource(f);});
    return;
  }
  if (typeof value === 'function') {
    console.log(value.toString());
    return;
  }
  if (typeof value === 'string') {
    console.log(value);
    return;
  }
  console.log(JSON.stringify(value,null,2));
}


/*
var testcase = process.argv[2] || 0;
var loop = new InputLoop();

if (typeof testcase === 'string') testcase = parseInt(testcase);

//console.log('test case %s', testcase);
//console.log('%s',testcase1);
//console.log(testcase1.toString());

//testcase1();
//guess_a_number_example();
//test_context_example();

*/

test_consolegame();
//run_function_list();

