/* 
 * inputloop-util.js
 * 
 * (c) 2018 Willi Commer (wcs)
 * version 1.1.3
 * 
 */



class StatusContext {
 
  constructor (arg) {
    this.message = '';
    this.isKeyPress = false;
    this.config(arg);
  }
  
 config (arg) {
    if (!arg) return;
    getProp(this, arg, 'message');
    getProp(this, arg, 'prompt');
    getProp(this, arg, 'onLine');
    getProp(this, arg, 'onStatusEnter');
    getProp(this, arg, 'onStatusExit');
    getProp(this, arg, 'isKeyPress');
  }

  createContext () {
    let me = this;
    return new Object({
      message:          me.getMessage.bind(me),
      prompt:           me.getPrompt.bind(me),
      onLine:           me.onLine.bind(me),
      onStatusEnter:    me.onStatusEnter.bind(me),
      onStatusExit:     me.onStatusExit.bind(me),
      isKeyPress:       me.isKeyPress
    });
  }
  
  get context()     { return this.createContext(); }
  getMessage ()     { return this.message; }
  getPrompt ()      { return '%m > '; }
  onLine ()         { }
  onStatusEnter ()  { }
  onStatusExit ()   { }
  
}  



class StatusContext_Input extends StatusContext {
 
  constructor (arg) {
    super(arg);
  }

  config (arg) {
    if (!arg) return;
    super.config(arg);
    getProp(this, arg, 'checkInput');
    getProp(this, arg, 'onDone');
    getProp(this, arg, 'onFail');
  }
  
  onLine (loop) { 
    if (this.checkInput(loop))
      this.onDone(loop);
    else
      this.onFail(loop);
  }
  
  checkInput (loop) { 
    return loop.line !== ''; 
  }
  
  onDone (loop) { //    console.log('onDone');  
  }; 
  
  onFail (loop) { //    console.log('onFail');  
  };
  
}   



class StatusContext_Menu extends StatusContext_Input {
 
  constructor (arg) {
    super(arg);
  }

  config (arg) {
    if (!arg) return;
    super.config(arg);
    if (arg instanceof SelectItems) {
      this.items = arg;
      return;
    } 
    if (getProp(this, arg, 'items', null)) {
      if (!(this.items instanceof SelectItems)) 
        this.items = new SelectItems(this.items);
    };
    getProp(this, arg, 'isMenu',        true);
    getProp(this, arg, 'isShortPrompt', false);
    getProp(this, arg, 'isKeyPress',    false);
    getProp(this, arg, 'getDoneValue');
  }

  checkInput (loop) { 
    var i = this.items.indexOfKey(loop.firstChar);
    if (i === -1) i = this.items.indexOfDefault();
    if (i !== -1) 
      loop.line = this.getDoneValue(this.items[i]);
    return (i !== -1);
  }
  
  onDone (loop) {
    if (this.isMenu) this.setStatusToInput(loop);
  }

  getPrompt () { 
    if (this.isShortPrompt)
      return this.getPromptShort() ;
    else
      return this.getPromptLong() ;
  }  
  
  getPromptLong () { 
    var s = this.items.toMenuText();
    s = this.getMessage() + '\n' + s + '\n> ';
    return s;
  }
  getPromptShort () { 
    var s = this.items.toShortText();
    s = this.getMessage() + ' ' + s + ' > ';
    return s;
  }

  getDoneValue (item) {
    if(typeof item.value !== 'undefined') return item.value;
    return item.key;
  }
  
  setDefault (key) { this.items.setDefault(key); }

  setStatusToInput (loop) {
    loop.setStatus(loop.line);
  }
}   



class SelectItems  extends Array {
  
  constructor (arg) {
    super();
    if (!arg) return;
    if ((arg instanceof Array) || (typeof arg === 'array')) {
      var me = this;
      arg.forEach(i => {
        if (typeof i === 'string') i = {text: i, value: i};
        me.push(i);
        if(i.key === undefined) i.key = me.length.toString(30);
      });
    }  
  }
  
  indexOfDefault () {
    if (!this.checkThis()) return -1;
    return this.findIndex(item => {return item.isDefault; });
  }
  
  indexOfKey (key) {
    if (!this.checkThis()) return -1;
    key = key.toLowerCase();
    return this.findIndex( (item) => {
      return (item.key && item.key.toLowerCase() === key); 
    });
  }
  
  itemOfKey (key) {
    let i = this.indexOfKey(key);
    if (i === -1) return null;
    return this[i];
  }
  
  setDefault (key) {
    if (key) key = key.toLowerCase();
    this.forEach( item => {
      item.isDefault = (key && item.key && (item.key.toLowerCase() === key));
    });
  }
  
  setDefaultValue (value) {
    this.forEach( item => {
      item.isDefault = (value && (item.value === value));
    });
  }
  
  setAutoKey () {
    for (let i=0; i < this.length; i++)
      this[i].key = (i+1).toString(30);
  }

  toMenuText () {
    var a = [];
    for (var i=0; i < this.length; i++) {
      let item = this[i];
      let s = item.key + ') ' + item.text;
      if(item.isDefault) s += ' *';
      a.push(s);
    }
    return a.join('\n');
  }

  toShortText () {
    var result = '';
    for (var i=0; i < this.length; i++) {
      let item = this[i];
      let s = item.key;
      if(item.isDefault) s = s.toUpperCase(); else s = s.toLowerCase();
      result += s;
    }
    if(result) result = '[' + result + ']';
    return result;
  }
  
  checkThis () {
    return (this.length > 0);
  }
  
};




function getProp (dst,src,name,deflt) {
  if (!src || !dst || !name) return false;
  if (src[name] === undefined) {
    if (deflt !== undefined) dst[name] = deflt;
    return false;
  }
  dst[name] = src[name];
  return true;
}

function checkProp (dst,name,deflt) {
  if (!dst || !name || !deflt || (dst[name] !== undefined)) return false;
  dst[name] = deflt;
  return true;
}




module.exports = {
  StatusContext:        StatusContext,
  StatusContext_Input:  StatusContext_Input,
  StatusContext_Menu:   StatusContext_Menu,
  SelectItems:          SelectItems
};
