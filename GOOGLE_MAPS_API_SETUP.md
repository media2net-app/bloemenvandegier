# Google Maps API Setup

## Overzicht

De Lead Finder gebruikt de Google Maps Places API om bedrijfsgegevens op te halen. Deze handleiding legt uit hoe je de API key configureert.

## Stap 1: Google Cloud Console Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Ga naar **APIs & Services** > **Library**
4. Zoek naar **"Places API"**
5. Klik op **Enable** om de Places API in te schakelen
6. Optioneel: Schakel ook **"Geocoding API"** in voor betere adresgegevens

## Stap 2: API Key Aanmaken

1. Ga naar **APIs & Services** > **Credentials**
2. Klik op **+ CREATE CREDENTIALS** > **API Key**
3. Kopieer de gegenereerde API key
4. (Aanbevolen) Klik op de API key om restricties in te stellen:
   - **Application restrictions**: 
     - Selecteer **HTTP referrers (web sites)**
     - Voeg je domein toe (bijv. `localhost:4000/*`, `jouwdomein.nl/*`)
   - **API restrictions**:
     - Selecteer **Restrict key**
     - Vink alleen **Places API** aan (en eventueel **Geocoding API**)

## Stap 3: Environment Variable Configureren

1. Maak een `.env.local` bestand in de root van je project (als deze nog niet bestaat)
2. Voeg de volgende regel toe:

```env
GOOGLE_MAPS_API_KEY=jouw_api_key_hier
```

3. Herstart de development server:

```bash
npm run dev
```

## Stap 4: Verificatie

1. Ga naar `/admin/zakelijke-leads/lead-finder`
2. Voer een zoekterm in (bijv. "middelbare school Amsterdam")
3. Klik op "Zoek op Google Maps"
4. Als de API key correct is geconfigureerd, krijg je echte resultaten van Google Maps
5. Check de browser console - als je "Using mock data" ziet, is de API key niet correct geconfigureerd

## Kosten

- **Gratis tier**: $200 gratis credits per maand
- **Places API Text Search**: $32 per 1000 requests
- **Places API Details**: $17 per 1000 requests
- Met de gratis tier kun je ongeveer **6,000 text searches** per maand doen

## Rate Limiting

De Google Maps API heeft rate limits:
- **Text Search**: 10 requests per seconde
- **Details**: 10 requests per seconde

De huidige implementatie respecteert deze limits automatisch.

## Troubleshooting

### "API key not found" / Mock data wordt gebruikt
- Controleer of `.env.local` bestaat en de juiste variabele naam heeft
- Zorg dat de server opnieuw is gestart na het toevoegen van de variabele
- Controleer of de variabele naam exact is: `GOOGLE_MAPS_API_KEY`

### "REQUEST_DENIED" error
- Controleer of de Places API is ingeschakeld in Google Cloud Console
- Controleer of de API key restricties correct zijn ingesteld
- Zorg dat je IP/domein is toegestaan in de API key restricties

### "OVER_QUERY_LIMIT" error
- Je hebt je maandelijkse quota bereikt
- Upgrade je Google Cloud billing account
- Of wacht tot de volgende maand

### Geen resultaten
- Probeer meer specifieke zoektermen
- Voeg een locatie toe aan je zoekopdracht
- Controleer of je zoekterm in het Nederlands is (de API is ingesteld op `language: 'nl'`)

## Security Best Practices

1. **Gebruik API key restricties**: Beperk de API key tot alleen je domein
2. **Gebruik server-side calls**: De API key wordt alleen gebruikt in de Next.js API route, niet in de client
3. **Monitor usage**: Check regelmatig je Google Cloud Console voor ongebruikelijke activiteit
4. **Rotate keys**: Verander je API key regelmatig voor extra beveiliging

## Alternatieven

Als je geen Google Maps API wilt gebruiken:
- De applicatie valt automatisch terug op mock data
- Je kunt andere APIs gebruiken (bijv. Foursquare, Yelp)
- Je kunt handmatig data importeren via de "Import Leads" functionaliteit

## Support

Voor vragen over de Google Maps API:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Support](https://cloud.google.com/support)
