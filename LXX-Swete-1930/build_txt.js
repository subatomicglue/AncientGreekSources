#!/usr/bin/env node

const fs = require('fs');

/**
 * Parses a single row of a tab-delimited CSV file, respecting quoted fields.
 * @param {string} row - A single row from the CSV file.
 * @returns {Array} Parsed fields for the row.
 */
function parseRow(row) {
    const fields = [];
    let currentField = '';
    let insideQuotes = false;
    let quoteChar = null; // Tracks whether we're inside single or double quotes

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];

        if ((char === '"' || char === "'") && (!insideQuotes || char === quoteChar)) {
            if (insideQuotes && char === quoteChar && nextChar === char) {
                // Handle escaped quote (' or " repeated inside quoted field)
                currentField += char;
                i++; // Skip the next quote
            } else if (insideQuotes && char === quoteChar) {
                // End of quoted section
                insideQuotes = false;
                quoteChar = null;
            } else if (!insideQuotes) {
                // Start of quoted section
                insideQuotes = true;
                quoteChar = char;
            }
        } else if (char === '\t' && !insideQuotes) {
            // Field delimiter outside quotes
            fields.push(currentField);
            currentField = '';
        } else {
            // Regular character
            currentField += char;
        }
    }

    // Push the last field
    fields.push(currentField);

    return fields;
}

/**
 * Loads and parses a tab-delimited .csv file into an array.
 * @param {string} filename - The path to the .csv file.
 * @param {boolean} hasHeaders - Set to true if the first row contains headers.
 * @returns {Array} Parsed array of rows (as arrays or objects if headers exist).
 */
function loadCSV(filename, hasHeaders = true) {
    try {
        // Read file content
        const fileContent = fs.readFileSync(filename, 'utf-8');

        // Split into rows and trim each row
        const rows = fileContent.trim().split('\n');

        // Parse each row
        const data = rows.map(parseRow);

        if (hasHeaders) {
            const headers = data.shift(); // Remove headers
            // Map rows to objects using headers
            return data.map(row =>
                headers.reduce((obj, header, index) => {
                    obj[header] = row[index];
                    return obj;
                }, {})
            );
        }

        // If no headers, return the array of arrays
        return data;
    } catch (error) {
        console.error('Error loading CSV file:', error);
        return [];
    }
}


// Example usage
const versification = loadCSV('00-Swete_versification.csv', false);
const word_with_punctuations = loadCSV('01-Swete_word_with_punctuations.csv', false);
//const word_with_punctuations = loadCSV('03-Swete_SBL_transliterations.csv');

let section_lookup = {
  "Gen": ["Genesis", "Γένεσις", "Genesis"],
  "Exo": ["Exodus", "Ἔξοδος", "Exodos"],
  "Lev": ["Leviticus", "Λευιτικόν", "Levitikon"],
  "Num": ["Numbers", "Ἀριθμοί", "Arithmoi"],
  "Deu": ["Deuteronomy", "Δευτερονόμιον", "Deuteronomion"],
  "Jos": ["Joshua", "Ἰησοῦς Ναυῆ", "Iesous Naue"],
  "Jdg": ["Judges", "Κριταί", "Kritai"],
  "Rut": ["Ruth", "Ῥούθ", "Ruth"],
  "1Sa": ["1 Samuel", "1 Σαμουήλ", "1 Samouel"],
  "2Sa": ["2 Samuel", "2 Σαμουήλ", "2 Samouel"],
  "1Ki": ["1 Kings", "1 Βασιλειῶν", "1 Basileion"],
  "2Ki": ["2 Kings", "2 Βασιλειῶν", "2 Basileion"],
  "1Ch": ["1 Chronicles", "1 Παραλειπομένων", "1 Paraleipomenon"],
  "2Ch": ["2 Chronicles", "2 Παραλειπομένων", "2 Paraleipomenon"],
  "1Es": ["1 Esdras", "1 Ἔσδρας", "1 Esdras"],
  "Ezr": ["Ezra", "Ἔσδρας", "Esdras"],
  "Neh": ["Nehemiah", "Νεεμίας", "Nehemias"],
  "Psa": ["Psalms", "Ψαλμοί", "Psalmoi"],
  "Pro": ["Proverbs", "Παροιμίαι", "Paroimiai"],
  "Ecc": ["Ecclesiastes", "Ἐκκλησιαστής", "Ekklisiastes"],
  "Sol": ["Song of Solomon", "Ἰάκωβος Σολομώντος", "Iakobos Solomontos"],
  "Job": ["Job", "Ἰώβ", "Iov"],
  "Wis": ["Wisdom of Solomon", "Σοφία Σολομώντος", "Sophia Solomontos"],
  "Sip": ["Sirach", "Σοφία Σιράχ", "Sophia Sirach"],  // The complete Sirach / Ecclesiasticus
  "Sir": ["Sirach (1-51)", "Σοφία Σιράχ (1-51)", "Sophia Sirach (1-51)"], // First 51 chapters, for clarity
  "Est": ["Esther", "Ἐσθήρ", "Esther"],
  "Jdt": ["Judith", "Ἰουδίθ", "Ioudith"],
  "Tob": [ "Tobit", "Τοβίτ", "Tobit" ],
  "Tbs": [ "Tobias", "Τοβίας", "Tobias" ],
  "Hos": ["Hosea", "Ὡσηέ", "Hosea"],
  "Amo": ["Amos", "Ἀμώς", "Amos"],
  "Mic": ["Micah", "Μιχαίας", "Michaia"],
  "Joe": ["Joel", "Ἰωήλ", "Ioel"],
  "Oba": ["Obadiah", "Ὀβαδιού", "Obadiou"],
  "Jon": ["Jonah", "Ἰωνᾶς", "Ionas"],
  "Nah": ["Nahum", "Ναούμ", "Naoum"],
  "Hab": ["Habakkuk", "Ἀμβακοὺκ", "Ambakouk"],
  "Zep": ["Zephaniah", "Σεπφaniaς", "Zephania"],
  "Hag": ["Haggai", "Ἀγγαῖος", "Aggaios"],
  "Zec": ["Zechariah", "Ζαχαρίας", "Zacharias"],
  "Mal": ["Malachi", "Μαλαχίας", "Malachias"],
  "Isa": ["Isaiah", "Ἠσαΐας", "Esaias"],
  "Jer": ["Jeremiah", "Ἰερεμίας", "Ieremias"],
  "Bar": ["Baruch", "Βαρούχ", "Barouch"],
  "Lam": ["Lamentations", "Θρῆνοι", "Threnoi"],
  "Epj": ["Epistle of Jeremiah", "Ἐπιστολὴ Ἰερεμίου", "Epistole Ieremiou"],
  "Eze": ["Ezekiel", "Ἰεζεκιήλ", "Iezekiil"],
  "Dan": ["Daniel", "Δανιήλ", "Daniel"],
  "Dat": ["Daniel (Additions)", "Δανιήλ (Προσαρτήματα)", "Daniel (Prosartimata)"],
  "Sus": ["Susanna", "Σουσάννα", "Sousanna"],
  "Sut": ["Susanna (Additions)", "Σουσάννα (Προσαρτήματα)", "Sousanna (Prosartimata)"],
  "Bel": ["Bel and the Dragon", "Βελ καὶ ὁ Δράκων", "Bel kai ho Drakon"],
  "Bet": ["Bel and the Dragon (Additions)", "Βελ καὶ ὁ Δράκων (Προσαρτήματα)", "Bel kai ho Drakon (Prosartimata)"],
  "1Ma": ["1 Maccabees", "1 Μακκαβαίων", "1 Makkabaion"],
  "2Ma": ["2 Maccabees", "2 Μακκαβαίων", "2 Makkabaion"],
  "3Ma": ["3 Maccabees", "3 Μακκαβαίων", "3 Makkabaion"],
  "4Ma": ["4 Maccabees", "4 Μακκαβαίων", "4 Makkabaion"],
  "Pss": ["Psalms of Solomon", "Ψαλμοί Σολομώντος", "Psalmoi Solomontos"],
  "1En": ["1 Enoch", "1 Ἐνώχ", "1 Henoch"],
  "Ode": ["Odes of Solomon", "ᾎδαι Σολομώντος", "Adai Solomontos"]
}
let current = {
  book: undefined,
  book_base: undefined,
  book_abv: undefined,
}
for (let i = 0; i < versification.length; i++) {
  let r = versification[i];
  let r2 = versification[i+1] ? versification[i+1] : [undefined, undefined];
  let verse = r[1].match( /([^\.]+)\.([0-9]+):([0-9]+)/ )
  //console.log( verse[1], ":", verse[2], ":", verse[3] );
  //process.exit(-1)

  let first_word = r[0]
  let last_word = r2[0] ? r2[0] - 1 : word_with_punctuations.length - 1
  let book_abv = `${verse[1]}` // 3 letter abbreviation
  //let book_base = `${section_lookup[book_abv] ? section_lookup[book_abv][1] : book_abv}`
  let book_base = `${section_lookup[book_abv] ? section_lookup[book_abv][0] : book_abv}`
  let book = `${book_base} ${verse[2]}`

  if (current.book != book) {
    console.log( "" );
    console.log( "====================" );
    console.log( book );
    console.log( "====================" );
  }
  current.book = book;
  current.book_base = book_base;
  current.book_abv = book_abv;

  console.log( word_with_punctuations.slice(first_word, last_word).map( r => r[1] ).join( " " ) );
}


