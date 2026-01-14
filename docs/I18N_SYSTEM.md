# i18n Translation System

## Overzicht

Dit systeem zorgt ervoor dat alle teksten in de applicatie volledig vertaald zijn in alle ondersteunde talen (NL, EN, TR, RO).

## Componenten

### 1. i18n Scanner (`scripts/i18n-scanner.ts`)

Scant de codebase op hardcoded Nederlandse teksten.

**Gebruik:**
```bash
npm run i18n:scan
```

**Output:**
- `i18n-scan-report.json` - Rapport met alle gevonden hardcoded teksten

**Wat het doet:**
- Scant alle `.ts` en `.tsx` bestanden
- Detecteert Nederlandse teksten in strings, JSX en template literals
- Genereert translation keys voor nieuwe teksten
- Rapporteert waar teksten gevonden zijn

### 2. i18n Validator (`scripts/i18n-validator.ts`)

Valideert dat alle translation keys in alle talen bestaan.

**Gebruik:**
```bash
npm run i18n:validate
```

**Output:**
- `i18n-validation-report.json` - Rapport met ontbrekende vertalingen

**Wat het doet:**
- Vergelijkt alle translation keys tussen talen
- Identificeert ontbrekende vertalingen
- Rapporteert extra keys die niet in NL (source) staan
- Retourneert exit code 1 als er ontbrekende vertalingen zijn

### 3. i18n Translation Agent (`scripts/i18n-translation-agent.ts`)

Genereert automatisch ontbrekende vertalingen.

**Gebruik:**
```bash
# Genereer suggesties (zonder bestanden te wijzigen)
npm run i18n:translate

# Auto-fix mode (wijzigt bestanden)
npm run i18n:translate:fix
```

**Wat het doet:**
- Identificeert ontbrekende vertalingen
- Genereert translation suggesties
- Kan automatisch placeholder vertalingen toevoegen (met `--auto-fix`)

**Let op:** In productie zou dit een echte translation API gebruiken (Google Translate, DeepL, etc.)

## Workflow

### Dagelijkse checks

```bash
# Scan + Validate in één commando
npm run i18n:check
```

Dit voert beide checks uit en genereert rapporten.

### Voor nieuwe features

1. **Schrijf code met hardcoded NL teksten** (tijdens ontwikkeling)
2. **Run scanner na implementatie:**
   ```bash
   npm run i18n:scan
   ```
3. **Voeg translation keys toe** aan `lib/i18n/translations/nl.ts`
4. **Genereer vertalingen:**
   ```bash
   npm run i18n:translate
   ```
5. **Review en update** de gegenereerde vertalingen
6. **Valideer:**
   ```bash
   npm run i18n:validate
   ```

### Voor bestaande code

1. **Scan voor hardcoded teksten:**
   ```bash
   npm run i18n:scan
   ```
2. **Bekijk het rapport** (`i18n-scan-report.json`)
3. **Vervang hardcoded teksten** met `t('translation.key')`
4. **Voeg keys toe** aan vertaalbestanden
5. **Valideer** dat alles compleet is

## Best Practices

### ✅ Goed

```tsx
// ✅ Gebruik translation keys
const { t } = useI18n()
<h1>{t('homepage.hero.title')}</h1>
```

### ❌ Slecht

```tsx
// ❌ Hardcoded Nederlandse tekst
<h1>Prachtige bloemen van topkwaliteit</h1>
```

### Placeholders

Voor dynamische content:

```tsx
// ✅ Met placeholder
{t('account.welcome', { name: user.name })}

// In vertaalbestand:
welcome: 'Welkom terug, {name}!'
```

## CI/CD Integration

Voeg toe aan je CI pipeline:

```yaml
# .github/workflows/i18n-check.yml
name: i18n Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run i18n:check
```

## Toekomstige Verbeteringen

1. **Translation API Integratie**
   - Integreer Google Translate API of DeepL API
   - Automatische vertaling generatie

2. **Pre-commit Hook**
   - Automatische scan bij elke commit
   - Blokkeer commits met hardcoded teksten

3. **Visual Diff Tool**
   - Toon verschillen tussen talen
   - Highlight ontbrekende vertalingen

4. **Translation Memory**
   - Hergebruik bestaande vertalingen
   - Consistentie tussen componenten

## Troubleshooting

### "Missing translations" error

1. Run `npm run i18n:validate` om te zien welke keys ontbreken
2. Voeg ontbrekende keys toe aan de vertaalbestanden
3. Run opnieuw om te valideren

### Scanner vindt te veel false positives

Pas de `isLikelyDutch()` functie aan in `i18n-scanner.ts` om filters te verfijnen.

### Translation keys zijn inconsistent

Gebruik een consistente naming convention:
- `component.section.element` (bijv. `homepage.hero.title`)
- Gebruik kebab-case voor keys
- Groepeer gerelateerde keys

## Support

Voor vragen of problemen, check:
- `i18n-scan-report.json` - Voor gevonden hardcoded teksten
- `i18n-validation-report.json` - Voor ontbrekende vertalingen
- `i18n-translation-suggestions.json` - Voor translation suggesties
