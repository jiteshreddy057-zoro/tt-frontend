import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { languages } from '../constants/languages';

const GlobeSelector = ({ onSelectLanguage, currentLanguage }) => {
  const globeEl = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries);
  }, []);

  const countryLanguageMap = {
    'IND': {
      name: 'India',
      languages: [
        { id: 'hi', name: 'Hindi' },
        { id: 'te', name: 'Telugu' },
        { id: 'ta', name: 'Tamil' },
        { id: 'kn', name: 'Kannada' },
        { id: 'ml', name: 'Malayalam' }
      ],
      provinces: [
        { name: 'Telangana', lang: 'te' },
        { name: 'Tamil Nadu', lang: 'ta' },
        { name: 'Karnataka', lang: 'kn' },
        { name: 'Delhi', lang: 'hi' }
      ]
    },
    'USA': {
      name: 'USA',
      languages: [{ id: 'en', name: 'English' }, { id: 'es', name: 'Spanish' }]
    },
    'CHE': {
      name: 'Switzerland',
      languages: [{ id: 'de', name: 'German' }, { id: 'fr', name: 'French' }, { id: 'it', name: 'Italian' }]
    },
    // South America
    'BRA': { name: 'Brazil', languages: [{ id: 'pt', name: 'Portuguese' }] },
    'ARG': { name: 'Argentina', languages: [{ id: 'es', name: 'Spanish' }] },
    'COL': { name: 'Colombia', languages: [{ id: 'es', name: 'Spanish' }] },
    'CHL': { name: 'Chile', languages: [{ id: 'es', name: 'Spanish' }] },
    'PER': { name: 'Peru', languages: [{ id: 'es', name: 'Spanish' }] },
    'VEN': { name: 'Venezuela', languages: [{ id: 'es', name: 'Spanish' }] },
    'ECU': { name: 'Ecuador', languages: [{ id: 'es', name: 'Spanish' }] },
    'BOL': { name: 'Bolivia', languages: [{ id: 'es', name: 'Spanish' }] },
    'PRY': { name: 'Paraguay', languages: [{ id: 'es', name: 'Spanish' }] },
    'URY': { name: 'Uruguay', languages: [{ id: 'es', name: 'Spanish' }] },
    'GUY': { name: 'Guyana', languages: [{ id: 'en', name: 'English' }] },
    'SUR': { name: 'Suriname', languages: [{ id: 'nl', name: 'Dutch' }] },
    // Europe
    'FRA': { name: 'France', languages: [{ id: 'fr', name: 'French' }] },
    'DEU': { name: 'Germany', languages: [{ id: 'de', name: 'German' }] },
    'ESP': { name: 'Spain', languages: [{ id: 'es', name: 'Spanish' }, { id: 'ca', name: 'Catalan' }, { id: 'gl', name: 'Galician' }, { id: 'eu', name: 'Basque' }] },
    'ITA': { name: 'Italy', languages: [{ id: 'it', name: 'Italian' }] },
    'GBR': { name: 'United Kingdom', languages: [{ id: 'en', name: 'English' }, { id: 'cy', name: 'Welsh' }, { id: 'ga', name: 'Irish' }] },
    'IRL': { name: 'Ireland', languages: [{ id: 'ga', name: 'Irish' }, { id: 'en', name: 'English' }] },
    'ISL': { name: 'Iceland', languages: [{ id: 'is', name: 'Icelandic' }] },
    'PRT': { name: 'Portugal', languages: [{ id: 'pt', name: 'Portuguese' }] },
    'NLD': { name: 'Netherlands', languages: [{ id: 'nl', name: 'Dutch' }] },
    'POL': { name: 'Poland', languages: [{ id: 'pl', name: 'Polish' }] },
    'SWE': { name: 'Sweden', languages: [{ id: 'sv', name: 'Swedish' }] },
    'NOR': { name: 'Norway', languages: [{ id: 'no', name: 'Norwegian' }] },
    'DNK': { name: 'Denmark', languages: [{ id: 'da', name: 'Danish' }] },
    'FIN': { name: 'Finland', languages: [{ id: 'fi', name: 'Finnish' }] },
    'GRC': { name: 'Greece', languages: [{ id: 'el', name: 'Greek' }] },
    'RUS': { name: 'Russia', languages: [{ id: 'ru', name: 'Russian' }] },
    'BEL': { name: 'Belgium', languages: [{ id: 'nl', name: 'Dutch' }, { id: 'fr', name: 'French' }, { id: 'de', name: 'German' }] },
    'AUT': { name: 'Austria', languages: [{ id: 'de', name: 'German' }] },
    'UKR': { name: 'Ukraine', languages: [{ id: 'uk', name: 'Ukrainian' }, { id: 'ru', name: 'Russian' }] },
    'CZE': { name: 'Czechia', languages: [{ id: 'cs', name: 'Czech' }] },
    'HUN': { name: 'Hungary', languages: [{ id: 'hu', name: 'Hungarian' }] },
    'ROU': { name: 'Romania', languages: [{ id: 'ro', name: 'Romanian' }] },
    'BGR': { name: 'Bulgaria', languages: [{ id: 'bg', name: 'Bulgarian' }] },
    'HRV': { name: 'Croatia', languages: [{ id: 'hr', name: 'Croatian' }] },
    'SRB': { name: 'Serbia', languages: [{ id: 'sr', name: 'Serbian' }] },
    // Asia/Others
    'CHN': { name: 'China', languages: [{ id: 'zh-CN', name: 'Chinese (Simplified)' }] },
    'JPN': { name: 'Japan', languages: [{ id: 'ja', name: 'Japanese' }] },
    'KOR': { name: 'South Korea', languages: [{ id: 'ko', name: 'Korean' }] },
    'TUR': { name: 'Turkey', languages: [{ id: 'tr', name: 'Turkish' }, { id: 'ku', name: 'Kurdish' }] },
    // Africa
    'ZAF': { name: 'South Africa', languages: [{ id: 'en', name: 'English' }, { id: 'af', name: 'Afrikaans' }, { id: 'zu', name: 'Zulu' }] },
    'NGA': { name: 'Nigeria', languages: [{ id: 'en', name: 'English' }, { id: 'yo', name: 'Yoruba' }, { id: 'ha', name: 'Hausa' }, { id: 'ig', name: 'Igbo' }] },
    'ETH': { name: 'Ethiopia', languages: [{ id: 'am', name: 'Amharic' }] },
    'EGY': { name: 'Egypt', languages: [{ id: 'ar', name: 'Arabic' }] },
    'KEN': { name: 'Kenya', languages: [{ id: 'sw', name: 'Swahili' }, { id: 'en', name: 'English' }] },
    'TZA': { name: 'Tanzania', languages: [{ id: 'sw', name: 'Swahili' }] },
    'MAR': { name: 'Morocco', languages: [{ id: 'ar', name: 'Arabic' }, { id: 'fr', name: 'French' }] },
    'DZA': { name: 'Algeria', languages: [{ id: 'ar', name: 'Arabic' }, { id: 'fr', name: 'French' }] },
    'GHA': { name: 'Ghana', languages: [{ id: 'en', name: 'English' }] },
    'UGA': { name: 'Uganda', languages: [{ id: 'en', name: 'English' }, { id: 'sw', name: 'Swahili' }] },
    'AGO': { name: 'Angola', languages: [{ id: 'pt', name: 'Portuguese' }] },
    'MOZ': { name: 'Mozambique', languages: [{ id: 'pt', name: 'Portuguese' }] },
    'MDG': { name: 'Madagascar', languages: [{ id: 'mg', name: 'Malagasy' }, { id: 'fr', name: 'French' }] },
    'SOM': { name: 'Somalia', languages: [{ id: 'so', name: 'Somali' }, { id: 'ar', name: 'Arabic' }] },
    // Middle East
    'SAU': { name: 'Saudi Arabia', languages: [{ id: 'ar', name: 'Arabic' }] },
    'IRN': { name: 'Iran', languages: [{ id: 'fa', name: 'Persian' }] },
    'IRQ': { name: 'Iraq', languages: [{ id: 'ar', name: 'Arabic' }, { id: 'ku', name: 'Kurdish' }] },
    'ISR': { name: 'Israel', languages: [{ id: 'he', name: 'Hebrew' }, { id: 'ar', name: 'Arabic' }] },
    'ARE': { name: 'UAE', languages: [{ id: 'ar', name: 'Arabic' }] },
    'AFG': { name: 'Afghanistan', languages: [{ id: 'ps', name: 'Pashto' }, { id: 'fa', name: 'Persian' }] },
    // Asia
    'PAK': { name: 'Pakistan', languages: [{ id: 'ur', name: 'Urdu' }, { id: 'pa', name: 'Punjabi' }, { id: 'sd', name: 'Sindhi' }] },
    'BGD': { name: 'Bangladesh', languages: [{ id: 'bn', name: 'Bengali' }] },
    'THA': { name: 'Thailand', languages: [{ id: 'th', name: 'Thai' }] },
    'VNM': { name: 'Vietnam', languages: [{ id: 'vi', name: 'Vietnamese' }] },
    'IDN': { name: 'Indonesia', languages: [{ id: 'id', name: 'Indonesian' }] },
    'MYS': { name: 'Malaysia', languages: [{ id: 'ms', name: 'Malay' }, { id: 'zh-CN', name: 'Chinese' }, { id: 'ta', name: 'Tamil' }] },
    'PHL': { name: 'Philippines', languages: [{ id: 'tl', name: 'Filipino' }, { id: 'en', name: 'English' }] },
    'MMR': { name: 'Myanmar', languages: [{ id: 'my', name: 'Burmese' }] },
    'KHM': { name: 'Cambodia', languages: [{ id: 'km', name: 'Khmer' }] },
    'LAO': { name: 'Laos', languages: [{ id: 'lo', name: 'Lao' }] },
    'LKA': { name: 'Sri Lanka', languages: [{ id: 'si', name: 'Sinhala' }, { id: 'ta', name: 'Tamil' }] },
    'NPL': { name: 'Nepal', languages: [{ id: 'ne', name: 'Nepali' }] },
    'KAZ': { name: 'Kazakhstan', languages: [{ id: 'kk', name: 'Kazakh' }, { id: 'ru', name: 'Russian' }] },
    'UZB': { name: 'Uzbekistan', languages: [{ id: 'uz', name: 'Uzbek' }] },
    'GEO': { name: 'Georgia', languages: [{ id: 'ka', name: 'Georgian' }] },
    'ARM': { name: 'Armenia', languages: [{ id: 'hy', name: 'Armenian' }] },
    'AZE': { name: 'Azerbaijan', languages: [{ id: 'az', name: 'Azerbaijani' }] },
    'MNG': { name: 'Mongolia', languages: [{ id: 'mn', name: 'Mongolian' }] },
    // Oceania
    'AUS': { name: 'Australia', languages: [{ id: 'en', name: 'English' }] },
    'NZL': { name: 'New Zealand', languages: [{ id: 'en', name: 'English' }] },
    // Europe Additions
    'MLT': { name: 'Malta', languages: [{ id: 'mt', name: 'Maltese' }, { id: 'en', name: 'English' }] },
    // Central America & Caribbean
    'MEX': { name: 'Mexico', languages: [{ id: 'es', name: 'Spanish' }] },
    'GTM': { name: 'Guatemala', languages: [{ id: 'es', name: 'Spanish' }] },
    'CRI': { name: 'Costa Rica', languages: [{ id: 'es', name: 'Spanish' }] },
    'PAN': { name: 'Panama', languages: [{ id: 'es', name: 'Spanish' }] },
    'CUB': { name: 'Cuba', languages: [{ id: 'es', name: 'Spanish' }] },
    'DOM': { name: 'Dominican Republic', languages: [{ id: 'es', name: 'Spanish' }] },
    // More Africa
    'SEN': { name: 'Senegal', languages: [{ id: 'fr', name: 'French' }, { id: 'wo', name: 'Wolof' }] },
    'CIV': { name: 'Ivory Coast', languages: [{ id: 'fr', name: 'French' }] },
    'CMR': { name: 'Cameroon', languages: [{ id: 'fr', name: 'French' }, { id: 'en', name: 'English' }] },
    'COD': { name: 'Congo (DRC)', languages: [{ id: 'fr', name: 'French' }, { id: 'sw', name: 'Swahili' }] },
    'ZWE': { name: 'Zimbabwe', languages: [{ id: 'en', name: 'English' }] },
  };

  return (
    <div className="relative w-full h-[650px] bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-700">
      <div className="absolute top-8 left-8 z-20 space-y-2 pointer-events-none">
        <div className="inline-block px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20 backdrop-blur-md">
          Global Intelligence
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter">Regional Selector</h2>
      </div>

      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={countries.features}
        polygonAltitude={d => d === hoverD ? 0.06 : 0.01}
        polygonCapColor={d => d === hoverD ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.15)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0.2)'}
        polygonStrokeColor={() => '#111'}
        onPolygonHover={setHoverD}
        onPolygonClick={({ properties: d }) => {
          const data = countryLanguageMap[d.ISO_A3];
          if (data) setSelectedCountry(data);
          else setSelectedCountry({ name: d.NAME, languages: [{ id: 'en', name: 'English' }] });
        }}
        enablePointerInteraction={true}
        animateIn={true}
      />

      {selectedCountry && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{selectedCountry.name}</h3>
                <p className="text-slate-500 text-sm font-medium">Select a local language or province</p>
              </div>
              <button onClick={() => setSelectedCountry(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">✕</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {selectedCountry.languages.map(lang => (
                  <button 
                    key={lang.id}
                    onClick={() => { onSelectLanguage(lang.id); setSelectedCountry(null); }}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent hover:border-blue-500 font-bold transition-all text-sm"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {selectedCountry.provinces && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Specific Provinces</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry.provinces.map(p => (
                      <button 
                        key={p.name}
                        onClick={() => { onSelectLanguage(p.lang); setSelectedCountry(null); }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-wrap gap-2 justify-center">
        {[
          { name: 'North America', coords: { lat: 37, lng: -95, altitude: 2 } },
          { name: 'South America', coords: { lat: -15, lng: -60, altitude: 2 } },
          { name: 'Europe', coords: { lat: 46, lng: 8, altitude: 2 } },
          { name: 'Africa', coords: { lat: 5, lng: 20, altitude: 2.5 } },
          { name: 'Asia', coords: { lat: 35, lng: 105, altitude: 2.5 } },
          { name: 'Oceania', coords: { lat: -25, lng: 135, altitude: 2 } },
          { name: 'Antarctica', coords: { lat: -90, lng: 0, altitude: 2.5 } }
        ].map(continent => (
          <button 
            key={continent.name}
            onClick={() => globeEl.current.pointOfView(continent.coords, 1000)}
            className="px-4 py-2 bg-white/10 hover:bg-blue-600/40 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 shadow-lg"
          >
            {continent.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobeSelector;
