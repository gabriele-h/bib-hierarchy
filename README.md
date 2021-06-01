# BIB HIERARCHY
Anzeige von bibliografischen Hierarchien aus Alma

# Allgemeines

Die Anzeige von bibliografischen Hierarchien ist in Alma nicht gut möglich. Nachdem die Daten aber da sind, kann man diese Anzeige selbst erstellen, indem man sich die MARC-Records über die SRU-Schnittstelle von Alma holt.

# Wiederverwendbarkeit

Ab dem Minor-Release v1.1.0 sind alle möglichen Variablen, die für die Situation im OBV spezifisch sind in zwei Dateien übersiedelt: `config.js` und `config.php`. Diese beiden Dateien sind der zentrale Anlaufpunkt, für Anpassungen.

## `config.js`
Hier werden folgende Einstellungen vorgenommen:
   * Das Präfix der Netzwerk-ID (z. B. "AC" für die AC-Nummern des OBV)
   * Eine Liste der Institution-Codes
   * Die MARC-Kategorie und das zugehörige Subfeld, das abgefragt wird, um das Vorhandensein von Holdings zu prüfen.
   * Die Bezeichnung der Netzwerk-ID in der Tabellenansicht

## `config.php`
Hier werden folgende Einstellungen vorgenommen:
   * Variablen, die für die SRU-Calls notwendig sind
   * Die Bezeichnung der Netzwerk-ID für Fehlermeldungen der SRU-Calls
   * Ein regulärer Ausdruck, um die SRU-Calls auf das Schema der Netzwerk-ID zu beschränken und einen nicht intendierten Gebrauch des Scripts `fetchsru.php` zu verunmöglichen

## `index.html`
Neben den Anpassungen in den Konfigurationsdateien müssen auch einige Spezifika im HTML bereinigt werden. Auch hier gibt es einen regulären Ausdruck, der die Eingabe ins Formular auf Validät prüft. Im Hilfetext ist zum Teil von "AC-Nummern" die Rede.

## Kann ich statt NZ/IZ auch IZ/Library abfragen?
Grundsätzlich sollte das möglich sein. Folgende Schritte sind dafür notwendig:
   * In `config.php` müsste als `$almazoneid` die entsprechende Alma-Institution-ID angegeben werden
   * In `config.js` müsste statt der InstCodes die LibraryCodes angegeben werden
   * In `config.js` müsste unter `marcPartTag` der Wert `AVA` angegeben werden und unter `marcPartSf` der Wert `b`

# Technisches
Diese Implementierung basiert sehr stark auf jener von [Stefan Schuh](https://github.com/schuach/bib-hierarchy).

Sie ist in PHP und javaScript umgesetzt. Warum? Weil die technischen Gegebenheiten dafür am optimalsten waren und bei dieser Komplexität die Sprache in den Augen der Autorin sekundär ist. Der PHP Teil macht die SRU-Calls (notwendig wegen Same Origin) und das javaScript erledigt das XML-Parsing sowie die Erstellung des HTML für die Darstellung.

# Beschränkungen

* Die SRU-Abfragen sind nicht parallelisiert und SRU ist generell nicht besonders flott, also dauert es eine Zeit, bis die Informationen geladen sind.
* Die ISBD-Darstellung ist ein bisschen weniger verfeinert als in Stefan Schuhs Implementierung. Es wird nicht nach Anzahl der Vorkommen differenziert, sondern stur nach Subfeld ein Delimiter präfigiert.

# Lizenzhinweis
Wo nichts anderes angegeben ist, unterliegt der Code der Lizenz GPL-3.0

Code-Teile, die anderen Lizenzen unterliegen, werden mit einem entsprechenden
Kommentar eingeleitet, der sowohl die Autor\*innen als auch Kürzel der und Link
zur Lizenz beinhaltet.

# Autor\*innen
* Gabriele Höfler, die die vorliegende Version umgesetzt hat
* [Stefan Schuh](https://github.com/schuach/bib-hierarchy/), von dem die komplette Konzeption abgeschaut ist (GPL-3.0)
* [Callumah](https://stackoverflow.com/users/1079254/calumah) für den Tabellenexport (CC BY-SA 4.0)
* [jedwards](https://stackoverflow.com/users/736937/jedwards) für Teile der Tabellensortierung (CC BY-SA 4.0)
* [Nick Grealy](https://stackoverflow.com/users/782034/nick-grealy) für Teile der Tabellensortierung (CC BY-SA 3.0)
