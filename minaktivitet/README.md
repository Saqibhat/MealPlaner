<<<<<<< HEAD


Dette  prosjektet er en webapplikasjon for å plannlegge og organisere måltider i løpet av en uke,: Bruker kan registrer seg , logge inn, legge til måltider, igredienser og plannlegge hva skal spise hver dag. Frontend er bygget med Vue.js og backende med Flask og SQLite.
Systemet støtter innlogging, AJAX, REST API, validering og lagring av preferanser.


### Backend
Flask- webserver
SQLite - Database
Werkzeug- Hashing av passord

#### Frontend
Vue.js - brukt med <script> direkt i HTML
Js - bruktes sammen med vue for  logikk og AJAX
Fetch API - for AJAX-kall til REST endpunkter
Lokal lagring - For å lagre brukeren preferanser 

### Layout og stil 
CSS- Bruk av Flexbos og noe absolutt posisjonering for layout


##### Funksjonalitet
Brukerregistrering og innloging
lagring av bruker med passordhash
operasjoner på måltider (legg til , oppdater, slett)
Ukeplan for måltider - per dag og type (frokost, lunsj, middag)

AJax-basert  fronted med vue
REST API
Lokalt lagrede brukerpreferanser ( eks, valgt sortering)



## slik kjører du oppgaven

python setup_db.py: kjør kun en gang databesen
python app.py : start Flask serveren
åpen i nettleser: du kan velge om du vil regisrerer deg som ny bruker , eller login 
eksampla brukerene: 
sara= Test123
ola= Passord123




=======
Måltidsplanlegger:

1. Introduksjon:

Dette er en webapplikasjon for planlegging av måltider og ukeplaner, utviklet med Flask som backend og moderne CSS/JavaScript for frontend. Brukere kan opprette, redigere og slette måltider, legge dem til i ukentlige planer og administrere brukerprofiler med innlogging og utlogging.


2. Funksjonalitet:

    Brukerhåndtering:

Registrering: Ny bruker kan registrere seg med brukernavn og passord.
Logging inn og ut: Sikker innlogging med passordhashing, og utlogging som rydder sesjonen.
Profilvisning: Viser innlogget brukernavn øverst, med mulighet for å logge ut.

    Måltidsadministrasjon:
Opprette, redigere og slette måltider: CRUD-funksjoner via modaler.
Filter på måltidstyper: Alle, Frokost, Lunsj, Middag.
Liste over måltider: Når lastet, vises måltider i kortformat, med mulighet for redigering, sletting og å legge til i ukeplan.

    Ukeplan:
Se ukeplan: Visning av planlagte måltider for hver dag.
Legge til måltid i plan: Velg dag og måltidstype, og legg til måltid.
Fjerne måltid fra plan: Slett fra ukesplanen.

    Styling og Design:
Responsivt design med tema-velger (lys/dark modus).
Bruk av CSS variabler, grid og flexbox for layout.
Modale vinduer for input og redigering, med animasjoner og tilpasninger for ulike skjermstørrelser.
Passende meldinger for suksess, feil og informasjon, med animasjoner og automatisk bortvisning.

    Frontend-Logikk (mealplanner.js):
Dynamisk lasting av måltider og ukeplan via API-kall.
Håndtering av modaler, skjemaer og brukerinteraksjoner.
Tema-velger for lys/dark modus med lagret preferanse i localStorage.
Eksport av ukeplan til tekstfil.

    Backend (app.py, setup_db.py, auto.py):
Flask-basert API for håndtering av brukere, måltider, ingredienser og ukeplaner.
SQLite database med relasjoner og foreign keys, satt opp med setup_db.py.
Innlasting av testdata med eksempler på brukere og måltider.
Sikker lagring av passord med hashing.
API-endepunkter for CRUD-operasjoner, filtrering, og planlegging.


3. Teknologier:
Backend: Flask (Python)
Frontend: HTML, CSS, JavaScript
CSS-Framework: Egenstilte stiler (style.css) med responsiv design og dark mode
Fonts: Google Fonts (Sour Gummy)
Database: SQLite3


4. Oppsett og kjøring:
    Forutsetninger:
Python 3.8+
pip installert

    Installasjon:
Klon repoet
Opprett virtuelt miljø (valgfritt)
Installer nødvendige pakker:
'pip install flask werkzeug'
Opprett og initialiser databasen
'python setup_db.py'
Dette oppretter alle tabeller og setter inn testdata.
Start applikasjonen
'python app.py'
Applikasjonen kjører på http://localhost:5000.

5. Brukerveiledning:
    Hjemmeside.
Ved innlogging får du opp en oversikt over dine måltider og ukesplan.
Bruk fanene til å filtrere måltider etter type.
Klikk på "Legg til nytt måltid" for å opprette flere.
Rediger eller slett eksisterende måltider via kortene.
Planlegg måltider ved å legge dem til i ukens ulike dager.
Eksportér ukesplanen til en tekstfil.
Innlogging og registrering
Hvis du har bruker, logg inn via innloggingsskjema.
Ny bruker kan registrere seg med brukernavn og passord.
>>>>>>> 7c4c8efc8e4f450bd12c47b72413cb24de3d049c
