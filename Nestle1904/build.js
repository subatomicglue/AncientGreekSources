#!/usr/bin/env node
"use strict";

//global parseXml;
require( "./global.min.js" ); // https://github.com/rgrove/parse-xml
let fs = require( "fs" );

let toc = fs.readFileSync( "./xml/nestle1904.xml", { encoding: 'utf8', flag: 'r' } );
//console.log( toc );
toc = parseXml( toc );

toc = toc.children[0].children.map( (r,i) => r.name == "xi:include" ? r.attributes.href : "" ).filter( r => r == "" ? false : true );

// output the text for one book (e.g. matthew)
function parseBook( xmlFileName, bookName ) {
  let txt = ""
  let title = ""

  // each type of XML node outputs adds different text to the 'txt' output:
  function parseNode( n ) {
    if (n.name == "title" && n.attributes.type == "main") {
      txt += "\n\n\n\n" + "-=[ " + n.text + ` (${bookName}) ` + " ]=-" + "\n";
    }
    else if (n.name == "title" && n.attributes.type == undefined) {
      txt += "\n\n" + n.text + "\n";
    }
    else if (n.name == "milestone" && n.attributes.unit=="tc" && (n.attributes.type=="start" || n.attributes.type=="end"))
      txt += n.attributes.display
    else if (n.name == "milestone" && n.attributes.id) {
      let number = n.attributes.id.match( /[0-9]+$/ )[0];
      txt += `${number != '1' ? ".  " : ""}${number}.`
    }
    else if (n.name == "w")
      txt += " " + n.text
  }

  // in-order node traversal of given xml tree (obtained from parseXml( xmlData ))
  function parseTraverse( n ) {
    if (n)
      parseNode( n )

    if (n && n.children)
      for (let child of n.children)
        parseTraverse( child )
  }

  // read the xml file
  let bookXml = fs.readFileSync( xmlFileName, { encoding: 'utf8', flag: 'r' } );

  // parse it into xml tree
  let book = parseXml( bookXml );

  // do a in-order node traversal on that xml tree
  parseTraverse( book );
  return txt
}

// output the TOC
let fulltext = "";
fulltext += "Table Of Contents\n"
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  let bookname = bookFileName.match( /^[^.]+/ )[0].split("-")[1]
  fulltext += "  " + bookname + "\n";
}
fulltext += "\n"
// output the books
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  let bookname = bookFileName.match( /^[^.]+/ )[0].split("-")[1]
  fulltext += parseBook( xmlFileName, bookname );
}

console.log( fulltext );

