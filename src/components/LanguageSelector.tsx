import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from './ui/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },

 
];

interface LanguageSelectorProps {
  variant?: 'button' | 'compact';
  onLanguageChange?: (languageCode: string) => void;
}

export function LanguageSelector({ variant = 'button', onLanguageChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default to English

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setOpen(false);
    onLanguageChange?.(language.code);
    
    // Here you would typically:
    // 1. Update the app's language context
    // 2. Load translation files
    // 3. Update localStorage for persistence
    console.log(`Language changed to: ${language.name} (${language.code})`);
  };

  if (variant === 'compact') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className="w-auto justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedLanguage.flag}</span>
              <span className="hidden sm:inline">{selectedLanguage.code.toUpperCase()}</span>
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={language.name}
                  onSelect={() => handleLanguageSelect(language)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.name}</div>
                      <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedLanguage.code === language.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="flex items-center gap-2">
              <span>{selectedLanguage.flag}</span>
              <span>{selectedLanguage.name}</span>
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Search languages..." className="h-9" />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                key={language.code}
                value={language.name}
                onSelect={() => handleLanguageSelect(language)}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedLanguage.code === language.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}