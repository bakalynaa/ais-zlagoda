import { useState } from 'react';

const UA_CITIES = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Донецьк', 'Запоріжжя',
  'Львів', 'Кривий Ріг', 'Миколаїв', 'Маріуполь', 'Луганськ',
  'Вінниця', 'Херсон', 'Полтава', 'Чернігів', 'Черкаси',
  'Житомир', 'Суми', 'Хмельницький', 'Рівне', 'Івано-Франківськ',
  'Тернопіль', 'Луцьк', 'Ужгород', 'Чернівці', 'Кропивницький',
  'Біла Церква', 'Кременчук', 'Мелітополь', 'Нікополь',
];

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export default function CityInput({ value, onChange, style }: CityInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val.length > 0) {
      const filtered = UA_CITIES.filter(city =>
        city.toLowerCase().startsWith(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={style}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Місто"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          zIndex: 100,
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {suggestions.map(city => (
            <li
              key={city}
              onMouseDown={() => handleSelect(city)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}