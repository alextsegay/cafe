'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'am'

interface Translations {
  [key: string]: {
    en: string
    am: string
  }
}

const translations: Translations = {
  'nav.home': { en: 'Home', am: 'ቤት' },
  'nav.menu': { en: 'Menu', am: 'ምህዋስ' },
  'nav.about': { en: 'About', am: 'ስለ' },
  'nav.gallery': { en: 'Gallery', am: 'ስዕላት' },
  'nav.contact': { en: 'Contact', am: 'ይድረስ' },
  'nav.admin': { en: 'Admin', am: 'አስተዳዳሪ' },
  'hero.tagline': { en: 'Experience the Art of Fine Coffee', am: 'ፕሪሚየም ካፌ' },
  'hero.cta': { en: 'View Our Menu', am: 'ምህዋሳችንን ይመልከቱ' },
  'hero.explore': { en: 'Explore', am: 'ያስሱ' },
  'about.title': { en: 'Our Story', am: 'ታሪኳችን' },
  'about.subtitle': { en: 'Crafted with Passion', am: 'ፍቅር የተሞላ' },
  'about.description': { en: 'Welcome to our café, where every cup tells a story. We source the finest beans from around the world and craft each beverage with dedication and love. Our passion for coffee goes beyond the ordinary — we believe in creating moments of joy, one cup at a time.', am: 'ወደ ካፍታችን እንኳን በሰላም መጡ። እያንዳንዱ ሽታ ታሪክ ይናገራል። ከዓለም ዙሪያ የተሻለ ቡና ማግኘት እንችላለን እና እያንዳንዱ መጠጥ በቁርኝት እና በፍቅር እንሠራለን። የቡና ፍቅራችን ከመደበኛው በላይ ነው — በአንድ ሽታ ላይ የሐሴት ጊዜዎችን መፍጠር እናምናለን።' },
  'about.quote': { en: 'Coffee is a lot more than just a drink; it\'s something happening.', am: 'ቡና ከማጠጥ በላይ ብዙ ነገር ነው፤ ነገር እየተከሰተ ነው።' },
  'about.quoteAuthor': { en: '— Jim Norman', am: '— ጂም ኖርማን' },
  'about.since': { en: 'Since', am: 'ከ' },
  'about.beans': { en: 'Beans', am: 'ቡናዎች' },
  'about.customers': { en: 'Happy Customers', am: 'ደስተኛ ደንበኞች' },
  'menu.search': { en: 'Search menu...', am: 'ምህዋስ ይፈልጉ...' },
  'menu.all': { en: 'All Items', am: 'ሁሉም ነገሮች' },
  'menu.popular': { en: 'Popular', am: 'ታዋቂ' },
  'menu.new': { en: 'New', am: 'አዲስ' },
  'menu.addToOrder': { en: 'Add to Order', am: 'ትዕዛዝ ጨምር' },
  'menu.ingredients': { en: 'Ingredients', am: 'ንጥረ ነገሮች' },
  'menu.unavailable': { en: 'Unavailable', am: 'አልተገኘም' },
  'menu.available': { en: 'Available', am: 'ይገኛል' },
  'menu.noItems': { en: 'No items found', am: 'ምንም ነገር አልተገኘም' },
  'menu.noItemsHint': { en: 'Try adjusting your search or filters', am: 'ፍለጋዎን ወይም ማጣሪያዎችን ለማስተካከል ይሞክሩ' },
  'menu.selection': { en: 'Our Selection', am: 'ምርጫችን' },
  'menu.featuredTitle': { en: 'Featured Delights', am: 'የተለዩ እርምጃዎች' },
  'menu.featuredSubtitle': { en: 'Discover our handpicked selection of premium beverages and treats', am: 'የተመረጡ የፕሪሚየም መጠጦች እና ምግቦችን ያግኙ' },
  'menu.viewDetails': { en: 'View Details', am: 'ዝርዝር ይመልከቱ' },
  'menu.viewFullMenu': { en: 'View Full Menu', am: 'ሙሉ ምህዋስ ይመልከቱ' },
  'menu.dailySpecial': { en: 'Daily Special', am: 'የቀን ልዩ እቃ' },
  'menu.specialOffer': { en: 'Special Offer', am: 'ልዩ ቅጥያት' },
  'menu.limitedTime': { en: 'Available for a limited time only!', am: 'ለጊዜው ብቻ ይገኛል!' },
  'admin.dashboard': { en: 'Dashboard', am: 'ዳሽቦርድ' },
  'admin.menu': { en: 'Menu', am: 'ምህዋስ' },
  'admin.categories': { en: 'Categories', am: 'ምድቦች' },
  'admin.gallery': { en: 'Gallery', am: 'ስዕላት' },
  'admin.settings': { en: 'Settings', am: 'ቅንብሮች' },
  'admin.qrCode': { en: 'QR Code', am: 'ኪዩ አር ኮድ' },
  'admin.messages': { en: 'Messages', am: 'መልዕክቶች' },
  'admin.viewWebsite': { en: 'View Website', am: 'ድርጅት ይመልከቱ' },
  'admin.logout': { en: 'Logout', am: 'ይደርስ' },
  'admin.totalItems': { en: 'Total Items', am: 'ጠቅላላ ነገሮች' },
  'admin.totalCategories': { en: 'Categories', am: 'ምድቦች' },
  'admin.hiddenItems': { en: 'Hidden Items', am: 'የተደበቁ ነገሮች' },
  'admin.galleryImages': { en: 'Gallery Images', am: 'ስዕላት' },
  'admin.notifications': { en: 'Notifications', am: 'ማሳወቂያዎች' },
  'admin.settingsSubtitle': { en: 'Manage your café profile and preferences', am: 'የካፍታዎን ፕሮፋይል እና ምርጫዎችን ያስተዳድሩ' },
  'admin.basicInfo': { en: 'Basic Information', am: 'መሠረታዊ መረጃ' },
  'admin.cafeName': { en: 'Café Name', am: 'የካፍታ ስም' },
  'admin.urlSlug': { en: 'URL Slug', am: 'ዩአርኤል ስሎግ' },
  'admin.cafeLogo': { en: 'Café Logo', am: 'የካፍታ ሎጎ' },
  'admin.uploadLogoFailed': { en: 'Failed to upload logo', am: 'ሎጎ ማስገባት አልተቻለም' },
  'admin.heroImage': { en: 'Hero Image', am: 'የሎሬ ምስል' },
  'admin.uploadHeroFailed': { en: 'Failed to upload hero image', am: 'የሎሬ ምስል ማስገባት አልተቻለም' },
  'admin.tagline': { en: 'Tagline', am: 'ስሎገን' },
  'admin.contactInfo': { en: 'Contact Information', am: 'የግንኙነት መረጃ' },
  'admin.address': { en: 'Address', am: 'አድራሻ' },
  'admin.phone': { en: 'Phone', am: 'ስልክ' },
  'admin.email': { en: 'Email', am: 'ኢሜይል' },
  'admin.brandingColors': { en: 'Branding Colors', am: 'የብራንድ ቀለሞች' },
  'admin.primaryColor': { en: 'Primary Color', am: 'ዋና ቀለም' },
  'admin.secondaryColor': { en: 'Secondary Color', am: 'ሁለተኛ ቀለም' },
  'admin.socialLinks': { en: 'Social Links', am: 'ማህበራዊ አገናኞች' },
  'admin.instagram': { en: 'Instagram', am: 'ኢንስታግራም' },
  'admin.facebook': { en: 'Facebook', am: 'ፌስቡክ' },
  'admin.twitter': { en: 'Twitter', am: 'ትዊተር' },
  'admin.openingHours': { en: 'Opening Hours', am: 'የመክፈቻ ሰዓታት' },
  'admin.weekdays': { en: 'Weekdays', am: 'የሳምንቱ ቀናት' },
  'admin.to': { en: 'to', am: 'እስከ' },
  'admin.saturday': { en: 'Saturday', am: 'ቅዳሜ' },
  'admin.sunday': { en: 'Sunday', am: 'እሑድ' },
  'admin.mapEmbed': { en: 'Map Embed', am: 'የካርታ ማስገባት' },
  'admin.dailySpecial': { en: 'Daily Special', am: 'የቀን ልዩ እቃ' },
  'admin.aboutSection': { en: 'About Section', am: 'ስለ ክፍል' },
  'admin.settingsSaved': { en: 'Settings saved successfully!', am: 'ቅንብሮች በተሳካ ሁኔታ ተቀምጠዋል!' },
  'admin.saveFailed': { en: 'Failed to save settings.', am: 'ቅንብሮችን ማስቀመጥ አልተቻለም።' },
  'admin.saveError': { en: 'An error occurred while saving settings.', am: 'ቅንብሮችን በማስቀመጥ ላይ ስህተት ተከስቷል።' },
  'admin.dailySpecialExpired': { en: 'Daily Special Expired', am: 'የቀን ልዩ እቃ ጊዜው አልፎበታል' },
  'admin.dailySpecialExpiredMsg': { en: 'The daily special has expired. Please update it.', am: 'የቀን ልዩ እቃ ጊዜው አልፎበታል። እባክዎ ያሻሽሉ።' },
  'action.add': { en: 'Add', am: 'ጨምር' },
  'action.edit': { en: 'Edit', am: 'አስተካክል' },
  'action.delete': { en: 'Delete', am: 'ሰርዝ' },
  'action.save': { en: 'Save', am: 'አስቀምጥ' },
  'action.cancel': { en: 'Cancel', am: 'ይቅር' },
  'action.upload': { en: 'Upload', am: 'ስቀምጥ' },
  'action.download': { en: 'Download', am: 'አውርድ' },
  'action.print': { en: 'Print', am: 'ፕሪንት' },
  'contact.title': { en: 'Contact Us', am: 'ይድረስን' },
  'contact.visitUs': { en: 'Visit Us', am: 'ይጎብኙን' },
  'contact.subtitle': { en: "We'd love to see you! Drop by for a cup of coffee or reach out with any questions.", am: 'ለማየት እንወዳለን! ለቡና አንድ ጽምግል ይምጡ ወይም ማንኛውንም ጥያቄ ያቅርቡ።' },
  'contact.sendMessage': { en: 'Send us a Message', am: 'መልዕክት ላኩልን' },
  'contact.success': { en: 'Message Sent!', am: 'መልዕክት ተልኳል!' },
  'contact.successMsg': { en: 'Thank you for reaching out. We\'ll get back to you soon.', am: 'ስለሚያግኙን እናመሰግናለን። በቅርቡ እንመልሳለን።' },
  'contact.firstName': { en: 'First Name', am: 'ስም' },
  'contact.lastName': { en: 'Last Name', am: 'የአባት ስም' },
  'contact.subject': { en: 'Subject', am: 'ርዕስ' },
  'contact.subjectPlaceholder': { en: 'How can we help?', am: 'እንዴት ልንረዳዎ እንደሚችል?' },
  'contact.message': { en: 'Message', am: 'መልዕክት' },
  'contact.messagePlaceholder': { en: 'Tell us what\'s on your mind...', am: 'ምን እንዳለዎት ይንገሩን...' },
  'contact.sending': { en: 'Sending...', am: 'በመላክ ላይ...' },
  'contact.send': { en: 'Send Message', am: 'መልዕክት ላክ' },
  'contact.required': { en: 'Please fill in all required fields.', am: 'እባክዎ ሁሉንም አስፈላጊ መስኮች ይሙሉ።' },
  'contact.error': { en: 'Failed to send message. Please try again.', am: 'መልዕክት ላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' },
  'contact.networkError': { en: 'Network error. Please check your connection and try again.', am: 'የኔትዎርክ ስህተት። እባክዎ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።' },
  'contact.directions': { en: 'Get Directions', am: 'አቅጣጫ ያግኙ' },
  'contact.address': { en: 'Address', am: 'አድራሻ' },
  'contact.hours': { en: 'Opening Hours', am: 'የመክፈቻ ሰዓታት' },
  'contact.phone': { en: 'Phone', am: 'ስልክ' },
  'contact.email': { en: 'Email', am: 'ኢሜይል' },
  'contact.monFri': { en: 'Mon - Fri', am: 'ሰኞ - ዓርብ' },
  'contact.saturday': { en: 'Saturday', am: 'ቅዳሜ' },
  'contact.sunday': { en: 'Sunday', am: 'እሑድ' },
  'footer.rights': { en: 'All rights reserved.', am: 'ሁሉም መብቶች የተጠበቁ ናቸው።' },
  'footer.tagline': { en: 'Premium Café', am: 'ፕሪሚየም ካፌ' },
  'testimonials.label': { en: 'Testimonials', am: 'ምስክርነቶች' },
  'testimonials.title': { en: 'What Our Guests Say', am: 'የእንግዶቻችን ምን ይላሉ' },
  'testimonials.subtitle': { en: 'Real stories from real coffee lovers', am: 'እውነተኛ ታሪኮች ከእውነተኛ ቡና ፍቋሮች' },
  'gallery.title': { en: 'Our Space', am: 'ቦታችን' },
  'gallery.subtitle': { en: 'A glimpse into the ambiance that makes our café special', am: 'የካፍታችንን ልዩ የሚያደርገውን ሁኔታ የሚያሳይ እይታ' },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || key
  }

  const providerValue = { language, setLanguage: handleSetLanguage, t }

  return React.createElement(
    I18nContext.Provider,
    { value: providerValue },
    children
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
