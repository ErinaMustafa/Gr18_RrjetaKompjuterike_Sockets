# Gr18_RrjetaKompjuterike_Sockets

TCP Project - Node.js Client & Server

Anëtarët e Grupit:
Erina Mustafa
Erisa Sollova
Uran Gegaj
Yll Cervadiku

Përshkrimi i Aplikacionit:
Ky projekt është një aplikacion TCP Client-Server i zhvilluar me Node.js, që ka për qëllim të demonstrojë funksionalitetin e komunikimit në rrjet ndërmjet klientëve dhe serverit.

Aplikacioni ofron:

- Server që mund të pranojë deri në 4 klientë njëkohësisht
- Klientët mund të dërgojnë mesazhe dhe të marrin përgjigje nga serveri
- Funksionalitet admin me fjalëkalim për komandat e avancuara
- Regjistrim të mesazheve dhe trafikut në skedarë log dhe statistike
- Komanda si: /list, /read, /delete, /upload, /search, /info
- Statistika e lidhjeve aktive, mesazheve për klient dhe trafikut total
- Timeout automatik pas 30 sekondash pa aktivitet

Struktura e Projektit:
TCP_Project/
│
├─ server.js        # Kodi i serverit TCP
├─ client.js        # Kodi i klientit TCP
├─ server_files/    # Dosja ku ruhen skedarët e ngarkuar
├─ server_log.txt   # Log i mesazheve të klientëve
└─ server_stats.txt # Statistikë e trafikut dhe lidhjeve

Si të ekzekutosh projektin:

1. Nisja e Serverit:
   - Hap terminalin në dosjen e projektit
   - Shkruaj: node server.js

2. Nisja e Klientit:
   - Hap një terminal tjetër në të njëjtën dosje
   - Shkruaj: node client.js
   - Nëse lidhja është e suksesshme, shfaqet mesazhi:
     Lidhja me server u kry me sukses!

3. Përdorimi i Komandave:
   - Mesazhe normale: thjesht shkruani tekst dhe serveri përgjigjet
   - Për admin:
     1. Shkruani ADMIN
     2. Futni fjalëkalimin: letmein
     3. Përdorni komandat e avancuara: /list, /read, /delete, /upload, /search, /info
   - Për të parë statistikat: shkruani STATS

4. Timeout:
   - Nëse klienti nuk dërgon mesazh për 30 sekonda, lidhja do të mbyllet automatikisht

Licenca:
Ky projekt është i lirë për përdorim vetëm për qëllime mësimore dhe zhvillimore.
