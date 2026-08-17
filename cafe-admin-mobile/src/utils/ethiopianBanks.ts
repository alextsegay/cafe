export interface EthiopianBank {
  name: string;
  short: string;
  color: string;
}

export const ETHIOPIAN_BANKS: EthiopianBank[] = [
  { name: 'Commercial Bank of Ethiopia', short: 'CBE', color: '#1a4d8f' },
  { name: 'Awash Bank', short: 'Awash', color: '#b91c1c' },
  { name: 'Dashen Bank', short: 'Dashen', color: '#0e7a3c' },
  { name: 'Bank of Abyssinia', short: 'BoA', color: '#7f1d1d' },
  { name: 'Wegagen Bank', short: 'Wegagen', color: '#ea580c' },
  { name: 'United Bank', short: 'United', color: '#166534' },
  { name: 'Zemen Bank', short: 'Zemen', color: '#1e3a8a' },
  { name: 'Nib International Bank', short: 'NIB', color: '#9f1239' },
  { name: 'Lion International Bank', short: 'LIB', color: '#b45309' },
  { name: 'Cooperative Bank of Oromia', short: 'CBO', color: '#065f46' },
  { name: 'Oromia Bank', short: 'Oromia', color: '#0c4a6e' },
  { name: 'Abay Bank', short: 'Abay', color: '#312e81' },
  { name: 'Amhara Bank', short: 'Amhara', color: '#991b1b' },
  { name: 'Enat Bank', short: 'Enat', color: '#be185d' },
  { name: 'Ahadu Bank', short: 'Ahadu', color: '#4c1d95' },
  { name: 'Hijra Bank', short: 'Hijra', color: '#134e4a' },
  { name: 'Siinqee Bank', short: 'Siinqee', color: '#1d4ed8' },
  { name: 'Goh Betoch Bank', short: 'GB', color: '#78350f' },
  { name: 'Tseday Bank', short: 'Tseday', color: '#86198f' },
  { name: 'Aya Bank', short: 'Aya', color: '#0e7490' },
  { name: 'Addis International Bank', short: 'Addis', color: '#475569' },
  { name: 'Berhan Bank', short: 'Berhan', color: '#b91c1c' },
  { name: 'Debub Global Bank', short: 'DGB', color: '#3730a3' },
  { name: 'Global Bank Ethiopia', short: 'Global', color: '#c2410c' },
];

export function getBankColor(bankName: string): string {
  const bank = ETHIOPIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankName || '').toLowerCase()
  );
  return bank?.color || '#64748b';
}

export function getBankShort(bankName: string): string {
  const bank = ETHIOPIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankName || '').toLowerCase()
  );
  if (bank) return bank.short;
  return (
    bankName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '🏦'
  );
}
