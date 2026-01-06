"use client";
import React, {
  useCallback,
  useState,
  forwardRef,
  useEffect,
  useMemo,
} from "react";

// shadcn
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon, Globe } from "lucide-react";
import { CircleFlag } from "react-circle-flags";

// data
import { countries } from "country-data-list";

// Popular countries for faster initial load
const POPULAR_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "JP",
  "CN",
  "IN",
  "BR",
  "IT",
  "ES",
  "RU",
  "KR",
  "MX",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
];

// Memoized country item component for better performance
const CountryItem = React.memo(
  ({
    country,
    isSelected,
    onSelect,
  }: {
    country: Country;
    isSelected: boolean;
    onSelect: (country: Country) => void;
  }) => (
    <CommandItem
      className="flex items-center w-full gap-2"
      key={country.alpha2}
      onSelect={() => onSelect(country)}
    >
      <div className="flex flex-grow w-0 space-x-2 overflow-hidden">
        <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
          <CircleFlag countryCode={country.alpha2.toLowerCase()} height={20} />
        </div>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {country.name}
        </span>
      </div>
      <CheckIcon
        className={cn(
          "ml-auto h-4 w-4 shrink-0",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  )
);

// Country interface
export interface Country {
  alpha2: string;
  alpha3: string;
  countryCallingCodes: string[];
  currencies: string[];
  emoji?: string;
  ioc: string;
  languages: string[];
  name: string;
  status: string;
}

// Dropdown props
interface CountryDropdownProps {
  options?: Country[];
  onChange?: (country: Country) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  slim?: boolean;
  error?: string;
  className?: string;
}

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) =>
        country.emoji && country.status !== "deleted" && country.ioc !== "PRK"
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    error,
    className,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered countries for better performance
  const { popularCountries, otherCountries } = useMemo(() => {
    const filtered = options.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!searchQuery) {
      // Show popular countries first when no search
      const popular = filtered.filter((country) =>
        POPULAR_COUNTRIES.includes(country.alpha2)
      );
      const others = filtered.filter(
        (country) => !POPULAR_COUNTRIES.includes(country.alpha2)
      );
      return { popularCountries: popular, otherCountries: others };
    }

    // When searching, show all results together
    return { popularCountries: [], otherCountries: filtered };
  }, [options, searchQuery]);

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (country) =>
          country.alpha2 === defaultValue || country.alpha3 === defaultValue
      );
      if (initialCountry) {
        setSelectedCountry(initialCountry);
      } else {
        // Reset selected country if defaultValue is not found
        setSelectedCountry(undefined);
      }
    } else {
      // Reset selected country if defaultValue is undefined or null
      setSelectedCountry(undefined);
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country: Country) => {
      console.log(country);
      setSelectedCountry(country);
      onChange?.(country);
      setOpen(false);
      setSearchQuery(""); // Clear search when selecting
    },
    [onChange]
  );

  // Clear search when dropdown closes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  }, []);

  const triggerClasses = cn(
    "flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    slim === true && "w-20",
    error && "border-red-500 focus:border-red-500",
    className
  );

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          ref={ref}
          className={triggerClasses}
          disabled={disabled}
          {...props}
        >
          {selectedCountry ? (
            <div className="flex items-center flex-grow w-0 gap-2 overflow-hidden">
              <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                <CircleFlag
                  countryCode={selectedCountry.alpha2.toLowerCase()}
                  height={20}
                />
              </div>
              {slim === false && (
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {selectedCountry.name}
                </span>
              )}
            </div>
          ) : (
            <span>{slim === false ? placeholder : <Globe size={20} />}</span>
          )}
          <ChevronDown size={16} />
        </PopoverTrigger>
        <PopoverContent
          collisionPadding={10}
          side="bottom"
          className="min-w-[--radix-popper-anchor-width] p-0"
        >
          <Command
            className="w-full max-h-[200px] sm:max-h-[270px]"
            shouldFilter={false}
          >
            <CommandList>
              <div className="sticky top-0 z-10 bg-popover">
                <CommandInput
                  placeholder="Search country..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
              </div>
              <CommandEmpty>No country found.</CommandEmpty>

              {/* Popular Countries */}
              {popularCountries.length > 0 && (
                <CommandGroup heading="Popular Countries">
                  {popularCountries.map((country) => (
                    <CountryItem
                      key={country.alpha2}
                      country={country}
                      isSelected={country.name === selectedCountry?.name}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              )}

              {/* All Countries */}
              {otherCountries.length > 0 && (
                <CommandGroup
                  heading={
                    popularCountries.length > 0 ? "All Countries" : undefined
                  }
                >
                  {otherCountries.map((country) => (
                    <CountryItem
                      key={country.alpha2}
                      country={country}
                      isSelected={country.name === selectedCountry?.name}
                      onSelect={handleSelect}
                    />
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);

// Utility function to get country name by alpha2 code
export const getCountryNameByCode = (code: string): string => {
  const country = countries.all.find(
    (country: Country) => country.alpha2 === code || country.alpha3 === code
  );
  return country?.name || code;
};
