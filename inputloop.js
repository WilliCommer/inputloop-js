/* 
 * inputloop.js
 * 
 * (c) 2018 Willi Commer (wcs)
 * version 1.1.3
 * 
 */


const readline        = require('readline');
  


class InputLoop {
  
  constructor (arg) {
    this.line           = '';                             // actual user input
    this.status         = '';                             // actual status
    this.statusContext  = null;                           // actual status props
    this.prompt         = '%m\n> ';                       // default prompt, %m = message
    this.context        = {};                             // all status definitions
    this.rl             = null;                           // actual readline interface
    this.isKeyPress     = false;
    if (arg) this.context = arg;
  }
  
  start() {
    // close the readline.Interface
    this.stop();
    
    // create a new readline.Interface
    this.rl = readline.createInterface({
      input:  process.stdin,
      output: process.stdout
    });
    
    // make shure status is set
    this.setStatus();
    this.showPrompt();
    
    // set readline's on event
    this.rl.on( 'line', (line) => {
      this.line = line;
      if (this.statusContext.onLine) {
        this.statusContext.onLine(this);
        this.showPrompt();
      }
    });
    
    this.enableKeyPress();
  }
  
  enableKeyPress () {
    if (this.isKeyPessEnabled) return false;
    this.isKeyPessEnabled = true;
    readline.emitKeypressEvents(process.stdin);
    if (process.stdout.isTTY) {
      process.stdin.setRawMode(true);   // raise exception if not TTY (process.stdout.isTTY)
      process.stdin.on('keypress', this.onKeyPress.bind(this));
    } 
  }
  
  onKeyPress (str, key) {
    if (this.isKeyPress) {
      if (key.ctrl || key.name === 'return') return;      
      this.isKeyPress = false;
      this.writeInput('\n');
    }
  }

  stop() {
    if(this.rl) {
      this.rl.close();
      this.rl  = null;
    }
    return this;
  }
  
  
  showPrompt(arg) {
    if (!this.statusContext) return this;
    if (!this.rl) return this;
    let newPrompt = (arg === undefined) ? this.statusContext.prompt : arg;
    if (newPrompt === undefined) newPrompt = this.prompt;
    newPrompt = getStr(newPrompt, true);
    newPrompt = newPrompt.replace('%m', getStr(this.statusContext.message, true));
    this.rl.setPrompt(newPrompt);
    this.rl.prompt();
    return this;
  }


  addStatus( name, status ) {
    this.context[name] = status;
    return this;
  }
  
  
  setStatus( status = this.status ) {
    var newContext = this.context[status];
    if (!newContext) {                                          //  take first status in context
      status = Object.keys(this.context)[0];
      newContext = this.context[status];
    }
    if (!newContext)                                           //  planet earth is blue. and there's nothing I can do
      throw new Error('status "'+status+'" is not defined');
    if (this.statusContext && this.statusContext.onStatusExit)    // call actual onStatusExit
      this.statusContext.onStatusExit(this);
    this.statusContext = newContext;                           // use the new status props
    this.status = status;
    this.isKeyPress = newContext.isKeyPress ? true : false;
    if (newContext.onStatusEnter)             // call onStatusEnter
      newContext.onStatusEnter(this);
    return this;
  }
  
  
  setContext( value ) {
    this.context = value;
    return this;
  }
  
    
  get lineLo() {
    let s = this.line;
    if (s) return s.trim().toLowerCase();
    return '';
  }
  
  get firstChar() {
    return this.lineLo.substr(0,1);
  }

  writeInput (str, key) {
    if (this.rl) this.rl.write(str,key);
  }
  
}
 
 
function getStr (s, forceStr) {
  if (typeof s === 'function') s = s();
  if (forceStr && !s) s = '';
  return s;
}


module.exports = InputLoop;
