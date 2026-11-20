#!/usr/bin/env node
"use strict";

// pass 1 arg "html" or "txt" to this script
if (process.argv.length != 3) process.exit(-1)
const [html_or_txt] = process.argv.slice(2);

//global parseXml;
require( "./global.min.js" ); // https://github.com/rgrove/parse-xml
let fs = require( "fs" );

let toc = fs.readFileSync( "./xml/nestle1904.xml", { encoding: 'utf8', flag: 'r' } );
//console.log( toc );
toc = parseXml( toc );

toc = toc.children[0].children.map( (r,i) => r.name == "xi:include" ? r.attributes.href : "" ).filter( r => r == "" ? false : true );


function transliterateGreek(text) {
  const map = {
    α:'a', β:'b', γ:'g', δ:'d', ε:'e', ζ:'z', η:'ē',
    θ:'th', ι:'i', κ:'k', λ:'l', μ:'m', ν:'n', ξ:'x',
    ο:'o', π:'p', ρ:'r', σ:'s', ς:'s', τ:'t', υ:'u',
    φ:'ph', χ:'ch', ψ:'ps', ω:'ō'
  };

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents/breathings
    .replace(/[Α-Ωα-ωϲς]/g, c => {
      const lower = c.toLowerCase();
      const result = map[lower] ?? (lower === 'ϲ' ? 's' : c);
      return c === lower ? result : result.toUpperCase();
    });
}

function parseTocEntry( xmlFileName, bookName ) {
  let txt = ""
  function parseNode( n ) {
    if (n.name == "title" && n.attributes.type == "main")
      txt += `${n.text} - ${bookName}`
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

// output the text for one book (e.g. matthew)
function parseBook( xmlFileName, bookName ) {
  let html = ""
  let txt = ""
  let title = ""
  let closing_tag="</p>\n";

  // each type of XML node outputs adds different text to the 'txt' output:
  function parseNode( n ) {
    if (n.name == "title" && n.attributes.type == "main") {
      txt += "\n\n\n\n" + "-=[ " + n.text + ` (${bookName}) ` + " ]=-" + "\n";
      html += "<h2>" + n.text + ` - ${bookName}` + "</h2>\n";
      closing_tag = ""
    }
    else if (n.name == "title" && n.attributes.type == undefined) {
      txt += "\n\n" + n.text + "\n";
      html += `${closing_tag}` + "<h3>" + n.text + "</h3>\n<p>";
      closing_tag="</p>\n";
    }
    else if (n.name == "milestone" && n.attributes.unit=="tc" && (n.attributes.type=="start" || n.attributes.type=="end")) {
      txt += n.attributes.display
      html += `<strong>${n.attributes.display}</strong>`
    }
    else if (n.name == "milestone" && n.attributes.id) {
      let number = n.attributes.id.match( /[0-9]+$/ )[0];
      txt += `${number != '1' ? ".  " : ""}${number}.`
      html += `${number != '1' ? ".  <strong>" : "<strong>"}${number}.</strong>`
    }
    else if (n.name == "w") {
      txt += " " + n.text
      html += " " + n.text
    }
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
  return [txt, html]
}

// output the TOC
let fulltext_txt = "";
let fulltext_html = "";
fulltext_txt += "Greek New Testament (Nestle1904)\n\n"
fulltext_txt += "Table Of Contents\n"
fulltext_html += `<style>
@media print {
  @page {
    size: letter;
    margin: 0.75in;
  }

  body {
    font-family: Georgia, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: black;
    background: white;
  }

  h1, h2 {
    break-before: page;
    page-break-before: always;
    break-after: avoid;
  }

  h1:first-child {
    break-before: auto;
    page-break-before: auto;
  }

  p {
    orphans: 3;
    widows: 3;
  }

  img, table, blockquote, pre {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  h1, h2 {
    text-align: center;
  }
  h1 {
    height: 9.5in; /* Letter page height minus 0.75in margins */
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;

    break-after: page;
    page-break-after: always;
  }
}
</style>
`;
fulltext_html += "<h1>Greek New Testament (Nestle1904)</h1>\n\n"
fulltext_html += "<h2>Table Of Contents</h2>\n<ul>\n"
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  let bookname = bookFileName.match( /^[^.]+/ )[0].split("-")[1]
  fulltext_txt += "  " + parseTocEntry( xmlFileName, bookname ) + "\n";
  fulltext_html += "  <li>" + parseTocEntry( xmlFileName, bookname ) + "\n";
}
fulltext_txt += "\n"
fulltext_html += "</ul>\n\n"
// output the books
for (let bookFileName of toc) {
  let xmlFileName = `xml/${bookFileName}`;
  let bookname = bookFileName.match( /^[^.]+/ )[0].split("-")[1]
  let [parseBook_txt, parseBook_html] = parseBook( xmlFileName, bookname );
  fulltext_txt += parseBook_txt
  fulltext_html += parseBook_html
}

console.log( html_or_txt == "html" ? fulltext_html : fulltext_txt );

