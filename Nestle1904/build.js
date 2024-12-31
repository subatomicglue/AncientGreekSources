#!/usr/bin/env node
"use strict";

//global parseXml;
require( "./global.min.js" ); // https://github.com/rgrove/parse-xml
let fs = require( "fs" );

let toc = fs.readFileSync( "./xml/nestle1904.xml", { encoding: 'utf8', flag: 'r' } );
//console.log( toc );
toc = parseXml( toc );

toc = toc.children[0].children.map( (r,i) => r.name == "xi:include" ? r.attributes.href : "" ).filter( r => r == "" ? false : true );


function parseBook( xmlFileName, bookName ) {
  let txt = ""
  let title = ""

  function parseNode( n ) {
    if (n.name == "title" && n.attributes.type == "main") {
      txt += "\n\n\n\n" + "-=[ " + n.text + ` (${bookName}) ` + " ]=-" + "\n";
    }
    else if (n.name == "title" && n.attributes.type == undefined) {
      txt += "\n\n" + n.text + "\n";
    }
    else if (n.name == "milestone" && n.attributes.unit=="tc" && (n.attributes.type=="start" || n.attributes.type=="end"))
      txt += n.attributes.display
    else if (n.name == "milestone" && n.attributes.id)
      txt += n.attributes.id ? n.attributes.id.match( /[0-9]+$/ )[0]  + "." : ""
    else if (n.name == "w")
      txt += " " + n.text
  }

  function parseTraverse( n ) {
    if (n)
      parseNode( n )

    if (n && n.children)
      for (let child of n.children)
        parseTraverse( child )
  }

  let bookXml = fs.readFileSync( xmlFileName, { encoding: 'utf8', flag: 'r' } );
  let book = parseXml( bookXml );
  parseTraverse( book );
  return txt
}


let fulltext = "";
fulltext += "Table Of Contents\n"
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  fulltext += "  " + bookFileName.match( /^[^.]+/ )[0] + "\n";
}
fulltext += "\n"
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  fulltext += parseBook( xmlFileName, bookFileName.match( /^[^.]+/ )[0] );
}

console.log( fulltext );

