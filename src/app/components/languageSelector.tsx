import { View } from 'react-native';
import { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { useContent } from '../hooks/useContent';
import { fetchAvailableLanguages } from '../services/api';
import { useApp } from '../context/AppContext';

const LanguageSelector = () => {
  const { selectedLanguage, setSelectedLanguage } = useApp();
  const [open, setOpen] = useState(false);

  const { data } = useContent(['languages'], fetchAvailableLanguages);

  const items = (data ?? []).map((lang: any) => {
    const value = lang.iso_639_1 || 'en';
    const normalizedValue = value === 'en' ? 'en-US' : value;

    return {
      label: lang.english_name || lang.name || value,
      value: normalizedValue,
    };
  });

  return (
    <View>
      <DropDownPicker
        open={open}
        value={selectedLanguage}
        items={items}
        setOpen={setOpen}
        setValue={(value) => {
          if (value !== null) {
            setSelectedLanguage(String(value));
          }
        }}
        placeholder={selectedLanguage}
        searchable={true}
      />
    </View>
  );
};

export default LanguageSelector;

