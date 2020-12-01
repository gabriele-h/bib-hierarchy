# BIB HIERARCHY
Anzeige von bibliografischen Hierarchien aus Alma

# Allgemeines

Die Anzeige von bibliografischen Hierarchien ist in Alma nicht gut möglich. Nachdem die Daten aber da sind, kann man diese Anzeige selbst erstellen, indem man sich die MARC-Records über die SRU-Schnittstelle von Alma holt.

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
