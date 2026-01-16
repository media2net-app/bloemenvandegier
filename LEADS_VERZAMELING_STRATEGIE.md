# Strategie: E-mailadressen Verzamelen van Middelbare Scholen

## 🎯 Doel
Alle middelbare scholen in Nederland benaderen voor Valentijn aanbod via e-mail.

---

## 📊 Data Bronnen & Methoden

### 1. **Openbare Overheidsdatabases** ⭐⭐⭐ (Aanbevolen)

#### DUO (Dienst Uitvoering Onderwijs)
- **Bron**: https://duo.nl/open_onderwijsdata/
- **Data**: Alle scholen in Nederland met adres, contactgegevens
- **Format**: CSV/Excel downloads beschikbaar
- **Voordelen**: 
  - Gratis en legaal
  - Compleet en up-to-date
  - Officiële data
- **Nadelen**: 
  - Mogelijk niet alle e-mailadressen direct beschikbaar
  - Moet handmatig aangevuld worden

#### Scholen op de Kaart
- **Bron**: https://www.scholenopdekaart.nl/
- **Data**: Schoolinformatie, soms contactgegevens
- **Voordelen**: 
  - Per school gedetailleerde info
  - Vaak directe contactgegevens
- **Nadelen**: 
  - Moet per school bekeken worden
  - Tijdrovend voor bulk verzameling

---

### 2. **Web Scraping** ⭐⭐ (Met voorzichtigheid)

#### Automatische Verzameling
- **Methode**: Script om school websites te scrapen
- **Bronnen**:
  - School websites (contact pagina's)
  - LinkedIn school pagina's
  - Social media accounts
- **Voordelen**: 
  - Snel en geautomatiseerd
  - Direct van de bron
- **Nadelen**: 
  - GDPR/privacy overwegingen
  - Rate limiting van websites
  - Kan tegen terms of service zijn
- **⚠️ Belangrijk**: 
  - Check robots.txt
  - Respecteer rate limits
  - Vraag toestemming waar mogelijk

#### Tools voor Scraping:
- **Python**: BeautifulSoup, Scrapy
- **Browser automation**: Puppeteer, Playwright
- **API's**: School-specifieke API's (indien beschikbaar)

---

### 3. **Commerciële Databases** ⭐⭐

#### Betaalde Services
- **Schoolinfo.nl** (indien beschikbaar)
- **KvK databases** (voor B2B contacten)
- **Marketing databases** (zoals ZoomInfo, LinkedIn Sales Navigator)
- **Voordelen**: 
  - Vaak compleet en gecontroleerd
  - Direct bruikbaar
- **Nadelen**: 
  - Kosten (€500-€2000+)
  - Mogelijk niet 100% compleet
  - Data kan verouderd zijn

---

### 4. **Handmatige Verzameling** ⭐

#### Team-based Approach
- **Methode**: Teamleden verzamelen handmatig per regio
- **Bronnen**: 
  - Google Maps (zoek "middelbare school [stad]")
  - School websites bezoeken
  - Telefoonnummers bellen voor e-mailadressen
- **Voordelen**: 
  - 100% controle over data kwaliteit
  - Direct contact mogelijk
- **Nadelen**: 
  - Zeer tijdrovend (1000+ scholen)
  - Duur (manuren)
  - Foutgevoelig

---

### 5. **Hybride Aanpak** ⭐⭐⭐ (Beste Optie)

#### Stap-voor-stap Plan:

**Fase 1: Basis Data Verzameling (Week 1)**
1. Download DUO database (alle middelbare scholen)
2. Importeer in admin panel
3. Verzamel basis info: naam, adres, plaats

**Fase 2: E-mail Verzameling (Week 2-3)**
1. **Automatisch**: 
   - Scrape school websites voor contact pagina's
   - Check LinkedIn voor school accounts
   - Gebruik Google Search API voor "school naam + contact"
   
2. **Semi-automatisch**:
   - Team belt scholen zonder e-mail (vraag naar algemeen@ of info@)
   - Gebruik e-mail finder tools (Hunter.io, FindThatLead)
   
3. **Handmatig**:
   - Scholen zonder online contact → telefonisch benaderen

**Fase 3: Validatie (Week 3-4)**
1. E-mail validatie (check of adres bestaat)
2. Test e-mail sturen naar kleine groep
3. Bounce rate monitoren
4. Data opschonen

---

## 🛠️ Technische Implementatie

### Admin Panel Features Nodig:

1. **Bulk Import Tool**
   - CSV/Excel import voor school data
   - Automatische mapping
   - Duplicate detection

2. **E-mail Verzameling Tool**
   - Integratie met e-mail finder API's
   - Web scraping interface
   - Progress tracking

3. **E-mail Validatie**
   - Real-time validatie
   - Bounce detection
   - Status tracking

4. **Campagne Management**
   - Segmentatie (per regio, schooltype)
   - E-mail templates
   - A/B testing
   - Tracking (opens, clicks)

---

## 📋 Praktische Stappen

### Stap 1: Data Bronnen Identificeren
```
1. DUO database downloaden
2. Scholen op de Kaart bekijken
3. Google Maps scraping voor aanvullingen
4. LinkedIn school pagina's
```

### Stap 2: Verzamel Strategie
```
1. Start met DUO data (gratis, compleet)
2. Vul aan met website scraping
3. Gebruik e-mail finder tools voor ontbrekende
4. Handmatige aanvulling voor moeilijke gevallen
```

### Stap 3: Data Opschoning
```
1. Duplicate removal
2. E-mail validatie
3. Format normalisatie
4. GDPR compliance check
```

### Stap 4: Campagne Voorbereiding
```
1. Segmentatie (regio, schoolgrootte)
2. Personalisatie (school naam, contactpersoon)
3. A/B test setup
4. Tracking implementatie
```

---

## ⚖️ GDPR & Privacy Overwegingen

### Belangrijke Punten:

1. **Toestemming**
   - Scholen moeten kunnen opt-out
   - Duidelijke unsubscribe optie
   - Privacy policy link

2. **Data Gebruik**
   - Alleen voor aangegeven doel (Valentijn aanbod)
   - Geen data delen met derden
   - Data retention policy

3. **Rechtmatige Grondslag**
   - Legitiem belang (B2B marketing)
   - Of expliciete toestemming vragen

4. **Transparantie**
   - Duidelijk wie de e-mail stuurt
   - Waarom ze de e-mail ontvangen
   - Hoe ze kunnen uitschrijven

---

## 💰 Kosten Schatting

### Optie 1: Volledig Handmatig
- **Tijd**: 2-3 weken (2 personen)
- **Kosten**: €3,000-€5,000 (manuren)
- **Kwaliteit**: ⭐⭐⭐⭐⭐

### Optie 2: Geautomatiseerd + Handmatig
- **Tools**: €200-€500 (e-mail finders, scraping tools)
- **Tijd**: 1-2 weken
- **Kosten**: €1,500-€2,500
- **Kwaliteit**: ⭐⭐⭐⭐

### Optie 3: Commerciële Database
- **Database**: €500-€2,000
- **Tijd**: 1 week (opschoning)
- **Kosten**: €500-€2,000
- **Kwaliteit**: ⭐⭐⭐

---

## 🎯 Aanbevolen Aanpak

### Fase 1: Quick Win (Week 1)
1. Download DUO database
2. Import in admin panel
3. Handmatig top 100 scholen aanvullen (grootste steden)

### Fase 2: Automatisering (Week 2-3)
1. Build scraping tool voor school websites
2. Integreer e-mail finder API
3. Automatiseer verzameling proces

### Fase 3: Opschoning & Validatie (Week 3-4)
1. E-mail validatie
2. Test campagne (kleine groep)
3. Feedback verwerken
4. Finale lijst prepareren

### Fase 4: Campagne (Week 5)
1. Segmentatie
2. Personalisatie
3. Staged sending (niet allemaal tegelijk)
4. Tracking & monitoring

---

## 🔧 Tools & Resources

### Gratis Tools:
- **DUO Open Data**: https://duo.nl/open_onderwijsdata/
- **Scholen op de Kaart**: https://www.scholenopdekaart.nl/
- **Google Maps**: Voor aanvullende data
- **Hunter.io**: Free tier voor e-mail finding

### Betaalde Tools:
- **Hunter.io Pro**: €49/maand (1000 verzoeken)
- **FindThatLead**: €29/maand
- **ScrapingBee**: Voor web scraping API
- **EmailListVerify**: Voor e-mail validatie

### Development Tools:
- **Python**: BeautifulSoup, Scrapy voor scraping
- **Node.js**: Puppeteer voor browser automation
- **Excel/CSV**: Voor data manipulatie

---

## 📊 Verwachte Resultaten

### Aantal Scholen:
- **Totaal middelbare scholen NL**: ~650-700 scholen
- **Realistisch bereik**: 500-600 e-mailadressen
- **Succesvolle deliveries**: 450-550 (90-95%)
- **Open rate verwachting**: 15-25%
- **Click rate verwachting**: 2-5%

---

## ✅ Checklist

- [ ] DUO database gedownload
- [ ] Admin panel import tool gebouwd
- [ ] Scraping tool ontwikkeld
- [ ] E-mail finder API geïntegreerd
- [ ] E-mail validatie tool actief
- [ ] GDPR compliance check gedaan
- [ ] Unsubscribe mechanisme klaar
- [ ] E-mail template gemaakt
- [ ] Test campagne uitgevoerd
- [ ] Tracking geïmplementeerd
- [ ] Finale lijst gevalideerd
- [ ] Campagne klaar voor verzending

---

## 💡 Tips & Best Practices

1. **Start Klein**: Test eerst met 50-100 scholen
2. **Personaliseer**: Gebruik school naam en contactpersoon
3. **Timing**: Stuur niet allemaal tegelijk (spread over dagen)
4. **Follow-up**: Plan follow-up e-mails voor non-responders
5. **Track Alles**: Monitoren opens, clicks, bounces
6. **A/B Test**: Test verschillende subject lines
7. **Mobile Friendly**: Zorg dat e-mail goed leesbaar is op mobiel
8. **Call-to-Action**: Duidelijke CTA in e-mail
9. **Landing Page**: Specifieke Valentijn pagina voor scholen
10. **Support**: Zorg dat er iemand beschikbaar is voor vragen

---

## 🚀 Volgende Stappen

1. **Beslissen**: Welke aanpak past bij jullie budget/tijd?
2. **Tools Klaarzetten**: Admin panel features bouwen
3. **Pilot**: Start met kleine groep (50 scholen)
4. **Itereren**: Verbeter op basis van feedback
5. **Scale**: Uitbreiden naar volledige lijst

---

## 📞 Contact & Support

Voor vragen over implementatie of technische ondersteuning bij het bouwen van de tools in het admin panel.
