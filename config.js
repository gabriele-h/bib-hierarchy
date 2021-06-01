// bib-id specifics
// NOTE: create_table.js assumes upper-case characters
// in the bib-id for the match within 773$$w and 830$$w.
// Search for toUpperCase if you need to change that.
bibIdPrefix = 'AC';

// List of Institution Codes to use for the holdings-match
const instCodes = {
    "43ACC_UBW": "Universitätsbibliothek Wien",
    "43ACC_ABP": "Anton Bruckner Privatuniversität",
    "43ACC_AKW": "Arbeiterkammerbibliothek Wien",
    "43ACC_BMA": "Bundesministerium für europäische und internationale Angelegenheiten",
    "43ACC_GDFS": "Campusbibliotheken St. Pölten",
    "43ACC_DLI": "Diözesanbibliothek Linz",
    "43ACC_DBSBG": "Diözesanbibliothek Salzburg im Archiv der Erzdiözese Salzburg",
    "43ACC_DBGK": "Diözese Gurk-Klagenfurt, Diözesanbibliothek",
    "43ACC_DSP": "Diözese St. Pölten",
    "43ACC_FHB": "Fachhochschule Burgenland",
    "43ACC_BFI": "Fachhochschule des BFI Wien",
    "43ACC_FTW": "Fachhochschule Technikum Wien",
    "43ACC_C02": "FH Campus 02",
    "43ACC_FHJ": "FH Joanneum",
    "43ACC_FHW": "FHWien der WKW",
    "43ACC_KLK": "Kärntner Landesbibliothek",
    "43ACC_UGL": "Kunstuniversität Linz",
    "43ACC_OOELB": "Landesbibliotheken Oberösterreich",
    "43ACC_MUV": "MODUL University Vienna",
    "43ACC_NDU": "New Design University",
    "43ACC_OEAW": "Österreichische Akademie der Wissenschaften",
    "43ACC_ONB": "Österreichische Nationalbibliothek",
    "43ACC_SLA": "Salzburger Landesarchiv",
    "43ACC_SFP": "Sigmund-Freud-Privatstiftung",
    "43ACC_STFTHLGKR_BIB": "Stiftsbibliothek Heiligenkreuz",
    "43ACC_TUG": "Technische Universität Graz",
    "43ACC_TUW": "TU Wien",
    "43ACC_UBBW": "Universitätsbibliothek Bodenkultur Wien",
    "43ACC_UBG": "Universitätsbibliothek Graz",
    "43ACC_UBI": "Universitätsbibliothek Innsbruck",
    "43ACC_UBK": "Universitätsbibliothek Klagenfurt",
    "43ACC_UBL": "Universitätsbibliothek Linz",
    "43ACC_UBMS": "Universitätsbibliothek Mozarteum Salzburg",
    "43ACC_UBS": "Universitätsbibliothek Salzburg",
    "43ACC_VBK": "Verbund für Bildung und Kultur",
    "43ACC_VUW": "Veterinärmedizinische Universität Wien",
    "43ACC_WIENB": "Wienbibliothek im Rathaus",
    "43ACC_WUW": "Wirtschaftsuniversität Wien"
};

// Text of this is matched with the instId to determine
// whether or not the Bib has holdings in the given Institution
const marcPartTag = "852";
const marcPartSf = "a";

// Used as table heading for the Network-ID, e.g. OBV AC-number
const networkIdName = "Netzwerk-ID";
