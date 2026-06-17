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
    <div className="city-input">
      <input
        className="city-input__field"
        style={style}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Місто"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-input__suggestions">
          {suggestions.map((city) => (
            <li
              key={city}
              className="city-input__option"
              onMouseDown={() => handleSelect(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}