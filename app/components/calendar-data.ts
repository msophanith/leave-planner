export interface HolidayEvent {
  title: string;
  khmerTitle?: string;
  date: string;
  theme: string;
  country: string;
  emoji: string;
  type?: string;
}

export const KHMER_TRANSLATIONS: Record<string, string> = {
  "International New Year Day": "ថ្ងៃចូលឆ្នាំសកល",
  "Victory Over Genocide Day": "ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍",
  "International Women's Day": "ទិវានារីអន្តរជាតិ",
  "Khmer New Year": "ពិធីបុណ្យចូលឆ្នាំខ្មែរ",
  "Bonn Visak Bochea": "បុណ្យវិសាខបូជា",
  "Royal Ploughing Ceremony": "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
  "King Norodom Sihamoni's Birthday":
    "ព្រះរាជទិវាបុណ្យចំរើនព្រះជន្ម សម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី",
  "International Labour Day": "ទិវាពលកម្មអន្តរជាតិ",
  "Queen Mother Norodom Monineath's Birthday":
    "ព្រះរាជទិវាបុណ្យចំរើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ",
  "Pchum Ben Festival": "ពិធីបុណ្យភ្ជុំបិណ្ឌ",
  "Constitutional Day": "ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ",
  "Coronation Day": "ព្រះរាជពិធីខួបគ្រងរាជសម្បត្តិ",
  "Water Festival": "ពិធីបុណ្យអុំទូក អកអំបុក និងសំពះព្រះខែ",
  "Independence Day": "ពិធីបុណ្យឯករាជ្យជាតិ",
};

export const BASE_PLACEHOLDERS = [
  {
    title: "International New Year",
    khmerTitle: "ថ្ងៃចូលឆ្នាំសកល",
    monthDay: "01-01",
    theme: "blue",
    country: "UN",
    emoji: "🎉",
  },
  {
    title: "Women's Day",
    khmerTitle: "ទិវានារីអន្តរជាតិ",
    monthDay: "03-08",
    theme: "pink",
    country: "UN",
    emoji: "🌸",
  },
  {
    title: "Labour Day",
    khmerTitle: "ទិវាពលកម្មអន្តរជាតិ",
    monthDay: "05-01",
    theme: "green",
    country: "UN",
    emoji: "🌟",
  },
  {
    title: "Human Rights Day",
    khmerTitle: "ទិវាសិទ្ធិមនុស្សអន្តរជាតិ",
    monthDay: "12-10",
    theme: "green",
    country: "UN",
    emoji: "🕊️",
  },
];

export const getEmojiForHoliday = (name: string, month: number): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("king") || lowerName.includes("coronation"))
    return "👑";
  if (lowerName.includes("queen")) return "👑";
  if (lowerName.includes("independence")) return "🇰🇭";
  if (lowerName.includes("victory")) return "✌️";
  if (lowerName.includes("new year")) return "🎊";
  if (lowerName.includes("women")) return "🌸";
  if (lowerName.includes("labour")) return "💪";
  if (lowerName.includes("bochea")) return "🙏";
  if (lowerName.includes("ben")) return "🏮";
  if (lowerName.includes("festival")) return "🚤";
  if (lowerName.includes("constitution")) return "📜";
  const seasonalFallbacks = [
    "❄️",
    "🌱",
    "🌷",
    "🌸",
    "☀️",
    "🏖️",
    "🍦",
    "🌻",
    "🍂",
    "🎃",
    "🧣",
    "🎄",
  ];
  return seasonalFallbacks[month] || "✨";
};

export const getThemeForHoliday = (name: string, month: number): string => {
  const lowerName = name.toLowerCase();
  const has = (terms: string[]) =>
    terms.some((term) => lowerName.includes(term));
  if (has(["king", "year", "coronation"])) return "yellow";
  if (has(["women", "birthday"])) return "pink";
  if (has(["labour", "victory"])) return "green";
  if (has(["bochea", "ben"])) return "purple";
  if (has(["festival", "constitution"])) return "blue";
  if (has(["independence"])) return "red";
  const themes = ["blue", "pink", "yellow", "green", "purple", "orange", "red"];
  return themes[month % themes.length];
};

export const toKhmerDigits = (num: number) => {
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  return num
    .toString()
    .split("")
    .map((d) => khmerDigits[Number.parseInt(d)])
    .join("");
};
