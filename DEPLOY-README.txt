IG Psychologie Halle – portables Website-Deployment

WOHIN MIT DEN DATEIEN?
----------------------
Lege diese drei Dateien direkt in den Root-Ordner des lokal geklonten Git-Repos:

  deploy-website.bat
  deploy-website.sh
  DEPLOY-README.txt

Das Repo darf auf jedem Rechner an einem anderen Ort liegen.
Das Skript erkennt den Git-Root automatisch.

BEISPIEL
--------
Bei Person A:
  C:\Users\Nutzer\Documents\Web\homepage

Bei Person B:
  D:\Uni\Websites\homepage

Beides funktioniert unverändert.

WORKFLOW
--------
1. Repo lokal aktualisieren:
     git pull

2. Änderungen vornehmen und testen.

3. Committen und pushen:
     git status
     git add .
     git commit -m "..."
     git push

4. Uni-Netz oder VPN verbinden.

5. deploy-website.bat doppelklicken.

ERSTER START AUF EINEM NEUEN RECHNER
------------------------------------
Das Skript fragt einmal nach dem Pfad zum privaten SSH-Key.

Beispiele:
  ~/.ssh/igpsych
  C:\Users\Name\.ssh\igpsych

NICHT die .pub-Datei angeben.

Der Key-Pfad wird nur auf diesem Rechner gespeichert unter:
  ~/.igpsych-website-deploy.conf

Die Passphrase des Keys wird NICHT gespeichert.
Sie wird beim Deploy direkt von OpenSSH/ssh-add abgefragt.

SERVER
------
SFTP:
  a6bdf@wp3.itz.uni-halle.de

Document Root:
  /public

WAS DEPLOYT WIRD
----------------
Nur relevante, von Git getrackte Website-Dateien.

Ignoriert werden u. a.:
  README
  LICENSE
  .gitignore
  .gitattributes
  .github/
  .vscode/
  deploy-website.*
  DEPLOY-README.txt
  Noticeboard Client / Importer

Das Skript merkt sich pro lokalem Repo den letzten erfolgreichen Deploy-Commit unter:
  .git/igpsych-deploy-state

Danach werden nur neue/geänderte Dateien hochgeladen und in Git gelöschte Dateien auch auf /public entfernt.

WICHTIG
-------
Git bleibt die Quelle der Wahrheit.
Nicht direkt auf /public Dateien verändern.

SICHERHEIT
----------
Du hast noch keinen Key? Generier dir ein Schlüsselpaar über keygen und wende dich an das ITZ bzw. Herrn Enghardt, damit er deinen public key zusätzlich zu den vorhandenen hinterlegt. Bitte wähle auch zur Sicherheit ein Passwort für deinen private Key, der Deployer wird dich bei hinterlegtem Passwort jederzeit beim Ausführen der .bat fragen
