export interface EthiopianBank {
  name: string
  short: string
  color: string
  logo: string
}

const logo = (slug: string) => `/banks/${slug}.png`

// Popular Ethiopian banks for quick selection in the admin UI.
export const ETHIOPIAN_BANKS: EthiopianBank[] = [
  { name: 'Commercial Bank of Ethiopia', short: 'CBE', color: '#1a4d8f', logo: logo('cbe') },
  { name: 'Awash Bank', short: 'Awash', color: '#b91c1c', logo: logo('awash') },
  { name: 'Dashen Bank', short: 'Dashen', color: '#0e7a3c', logo: logo('dashen') },
  { name: 'Bank of Abyssinia', short: 'BoA', color: '#7f1d1d', logo: logo('boa') },
  { name: 'Wegagen Bank', short: 'Wegagen', color: '#ea580c', logo: logo('wegagen') },
  { name: 'United Bank', short: 'United', color: '#166534', logo: logo('united') },
  { name: 'Zemen Bank', short: 'Zemen', color: '#1e3a8a', logo: logo('zemen') },
  { name: 'Nib International Bank', short: 'NIB', color: '#9f1239', logo: logo('nib') },
  { name: 'Lion International Bank', short: 'LIB', color: '#b45309', logo: logo('lib') },
  { name: 'Cooperative Bank of Oromia', short: 'CBO', color: '#065f46', logo: logo('cbo') },
  { name: 'Oromia Bank', short: 'Oromia', color: '#0c4a6e', logo: logo('oromia') },
  { name: 'Abay Bank', short: 'Abay', color: '#312e81', logo: logo('abay') },
  { name: 'Amhara Bank', short: 'Amhara', color: '#991b1b', logo: logo('amhara') },
  { name: 'Enat Bank', short: 'Enat', color: '#be185d', logo: logo('enat') },
  { name: 'Ahadu Bank', short: 'Ahadu', color: '#4c1d95', logo: logo('ahadu') },
  { name: 'Hijra Bank', short: 'Hijra', color: '#134e4a', logo: logo('hijra') },
  { name: 'Siinqee Bank', short: 'Siinqee', color: '#1d4ed8', logo: logo('siinqee') },
  { name: 'Goh Betoch Bank', short: 'GB', color: '#78350f', logo: logo('gb') },
  { name: 'Tseday Bank', short: 'Tseday', color: '#86198f', logo: logo('tseday') },
  { name: 'Aya Bank', short: 'Aya', color: '#0e7490', logo: logo('aya') },
  { name: 'Addis International Bank', short: 'Addis', color: '#475569', logo: logo('addis') },
  { name: 'Berhan Bank', short: 'Berhan', color: '#b91c1c', logo: logo('berhan') },
  { name: 'Debub Global Bank', short: 'DGB', color: '#3730a3', logo: logo('dgb') },
  { name: 'Global Bank Ethiopia', short: 'Global', color: '#c2410c', logo: logo('global') },
]

export function getBankColor(bankName: string): string {
  const bank = ETHIOPIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankName || '').toLowerCase()
  )
  return bank?.color || '#64748b'
}

export function getBankLogo(bankName: string): string {
  const bank = ETHIOPIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankName || '').toLowerCase()
  )
  return bank?.logo || logo('custom')
}
