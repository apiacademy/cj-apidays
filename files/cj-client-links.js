/*
  Collection+JSON client 
  minimal stand-alone client code
  cj-client.js 
  @mamund
 */

function cj() {

  var d = domHelp();  
  var g = {};
  
  g.url = '';
  g.cj = null;
  g.ctype = "application/vnd.collection+json";

  // init library and start
  function init(url) {
    if(!url || url==='') {
      alert('*** ERROR:\n\nMUST pass starting URL to the Cj library');
    }
    else {
      g.url = url;
      req(g.url,"get");
    }
  }

  // primary loop
  function parseCj() {
    dump();    

    title();    
    links();
  }

  // handle response dump
  function dump() {
    var elm;

    elm = d.find("dump");
    if(elm) {
      elm.innerHTML = JSON.stringify(g.cj.collection, null, 2);
    }
  }
  
  // handle title
  function title() {
    var elm;

    elm = d.find("title");
    if(elm && g.cj.collection.title) {
      elm.innerHTML = g.cj.collection.title;
    }
  }
  
  // handle link collection
  function links() {
    var elm, coll;
    var ul, li, a;

    elm = d.find("links");
    if(elm) {
      d.clear(elm);
      ul = d.node("ul");
      coll = g.cj.collection.links||[];
      for(var link of coll) {
        li = d.node("li");
        a = d.anchor({rel:link.rel, href:link.href,text:link.prompt});
        a.onclick = httpGet;
        d.push(a,li);
        d.push(li,ul);
      }
      d.push(ul,elm);
    }
  }

  // handle item collection
  function items() {
    var elm, coll;
    var ul, li;
    var dl, dt, dd;
    var p, a;

  }
  
  // handle query collection
  function queries() {
    var elm, coll;
    var ul, li;
    var form, fs, lg, p, inp;

  }
  
  // handle template object
  function template() {
    var elm, coll;
    var form, fs, lg, p, inp;

  }
  
  // handle error object
  function error() {
    var elm, obj;

    elm = d.find("error");
    if(elm) {
      d.clear(elm);
      if(g.cj.collection.error) {
        obj = g.cj.collection.error;

        p = d.para({className:"code",text:obj.code||""});
        d.push(p,elm);
        p = d.para({className:"message",text:obj.message||""});
        d.push(p,elm);
        p = d.para({className:"title",text:obj.title||""});
        d.push(p,elm);
        p = d.para({className:"url",text:obj.url||""});
        d.push(p,elm);
      }
    }
  }

  // ***************************
  // cj helpers
  // ***************************
  
  // render editable form for an item
  function cjEdit(e) {
    var elm, coll;
    var form, fs, lg, p, lbl, inp;
    var data, item, dv, tx;
    
    elm = d.find("edit");
    d.clear(elm);
    
    // get data from selected item
    item = cjItem(e.target.href);
    if(item!==null) {
      form = d.node("form");
      form.action = item.href;
      form.method = "put";
      form.className = "edit";
      form.onsubmit = httpPut;
      fs = d.node("fieldset");
      lg = d.node("legend");
      lg.innerHTML = "Edit";
      d.push(lg,fs);
      
      // get template for editing
      coll = g.cj.collection.template.data;
      for(var data of coll) {
        dv = cjData(item, data.name);
        tx=(dv!==null?dv.value+"":"");
        p = d.input({prompt:data.prompt,name:data.name,value:tx});
        d.push(p,fs);
      }
      p = d.node("p");
      inp = d.node("input");
      inp.type = "submit";
      d.push(inp,p);
      d.push(p,fs);
      d.push(fs,form);
      d.push(form, elm);
      elm.style.display = "block";
    }
    return false;
  }
  function cjClearEdit() {
    var elm;
    elm = d.find("edit");
    d.clear(elm);
    elm.style.display = "none";
    return;
  }
  function hasTitle(collection) {
    return (collection.title && collection.title.length!==-1);
  }
  function hasTemplate(collection) {
    return (collection.template && 
      Array.isArray(collection.template.data)===true &&
      collection.template.data.length!==0);
  }
  function isHiddenLink(link) {
    var rtn = false;
    if(link.render && (link.render==="none" || link.render==="hidden" || link.rel==="stylesheet")) {
      rtn = true;
    }
    return rtn;
  }
  function isReadOnly(item) {
    var rtn = false;
    if(item.readOnly && (item.readOnly==="true" || item.readOnly===true)) {
      rtn = true;
    }
    return rtn;
  }
  function isImage(link) {
    var rtn = false;
    if(link.render && (link.render==="image" || link.render==="embed")) {
      rtn = true;
    }
    return rtn;
  }
  function cjItem(url) {
    var coll, rtn;
    
    rtn = null;
    coll = g.cj.collection.items;
    for(var item of coll) {
      if(item.href.replace('http:','').replace('https:','')===url.replace('http:','').replace('https:','')) {
        rtn = item;
        break;
      }
    }
    return rtn;
  }
  function cjData(item,name) {
    var coll, rtn;
    
    rtn = null;
    coll = item.data;
    for(var data of coll) {
      if(data.name === name) {
        rtn = data;
        break;
      }
    }
    return rtn;
  }
  
  // ********************************
  // ajax helpers
  // ********************************
  
  // mid-level HTTP handlers
  function httpGet(e) {
    req(e.target.href, "get", null);
    return false;
  }
  function httpQuery(e) {
    var form, coll, query, i, x, q;

    q=0;
    form = e.target;
    query = form.action+"/?";
    nodes = d.tags("input", form);
    for(i=0, x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        if(q++!==0) {
          query += "&";
        }
        query += nodes[i].name+"="+escape(nodes[i].value);
      }
    }
    req(query,"get",null);
    return false;
  }
  function httpPost(e) {
    var form, nodes, data;

    data = [];
    form = e.target;
    nodes = d.tags("input",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    req(form.action,'post',JSON.stringify({template:{data:data}}));
    return false;
  }
  function httpPut(e) {
    var form, nodes, data;

    data = [];
    form = e.target;
    nodes = d.tags("input",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    req(form.action,'put',JSON.stringify({template:{data:data}}));
    return false;
  }
  function httpDelete(e) {
    if(confirm("Ready to delete?")===true) {
      req(e.target.href, "delete", null);
    }
    return false;
  }
  // low-level HTTP stuff
  function req(url, method, body) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){rsp(ajax)};
    ajax.open(method, url);
    ajax.setRequestHeader("accept",g.ctype);
    if(body && body!==null) {
      ajax.setRequestHeader("content-type", g.ctype);
    }
    ajax.send(body);
  }
  function rsp(ajax) {
    if(ajax.readyState===4) {
      g.cj = JSON.parse(ajax.responseText);
      parseCj();
    }
  }

  // export function
  var that = {};
  that.init = init;
  return that;
}

// *** EOD ***
