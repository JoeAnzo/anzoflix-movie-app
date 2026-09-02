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

  const languageItems = [
    { label: 'English', value: 'en-US' },
    ...items.filter((item: { value: string }) => item.value !== 'en-US'),
  ];

  return (
    <View className="w-[100px] z-10">
      <DropDownPicker
        open={open}
        value={selectedLanguage}
        items={languageItems}
        setOpen={setOpen}
        setValue={(value) => {
          if (value !== null) {
            setSelectedLanguage(String(value));
          }
        }}
        placeholder="English"
        searchable={true}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 0,
          minHeight: 36,
        }}
        textStyle={{
          color: 'white',
          fontSize: 12,
        }}
        dropDownContainerStyle={{
          backgroundColor: '#27272a',
          borderColor: '#52525b',
        }}
      />
    </View>
  );
};

export default LanguageSelector;

