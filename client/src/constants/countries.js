import { getData } from "country-list";

/**
 * ISO 3166-1 alpha-2 countries for phone number country_code validation.
 * value = Alpha-2 code stored in validations.country_code
 */
export const COUNTRIES = getData()
  .map(({ code, name }) => ({ value: code, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label));

/** Options for SearchableSelect — label includes Alpha-2 for easier search */
export const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: country.value,
  label: `${country.label} (${country.value})`,
}));
