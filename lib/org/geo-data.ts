/** Compact India geo catalog for pickers — extend via DB as you grow. */

export const INDIA_STATES: { code: string; name: string }[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

export const SEED_CITIES: {
  id: string;
  stateCode: string;
  name: string;
  slug: string;
}[] = [
  { id: "city_mh_mumbai", stateCode: "MH", name: "Mumbai", slug: "mumbai" },
  { id: "city_mh_pune", stateCode: "MH", name: "Pune", slug: "pune" },
  { id: "city_mh_nagpur", stateCode: "MH", name: "Nagpur", slug: "nagpur" },
  { id: "city_dl_delhi", stateCode: "DL", name: "New Delhi", slug: "new-delhi" },
  { id: "city_ka_bengaluru", stateCode: "KA", name: "Bengaluru", slug: "bengaluru" },
  { id: "city_ka_mysuru", stateCode: "KA", name: "Mysuru", slug: "mysuru" },
  { id: "city_tn_chennai", stateCode: "TN", name: "Chennai", slug: "chennai" },
  { id: "city_tg_hyderabad", stateCode: "TG", name: "Hyderabad", slug: "hyderabad" },
  { id: "city_gj_ahmedabad", stateCode: "GJ", name: "Ahmedabad", slug: "ahmedabad" },
  { id: "city_rj_jaipur", stateCode: "RJ", name: "Jaipur", slug: "jaipur" },
  { id: "city_wb_kolkata", stateCode: "WB", name: "Kolkata", slug: "kolkata" },
  { id: "city_up_lucknow", stateCode: "UP", name: "Lucknow", slug: "lucknow" },
  { id: "city_up_noida", stateCode: "UP", name: "Noida", slug: "noida" },
  { id: "city_br_patna", stateCode: "BR", name: "Patna", slug: "patna" },
  { id: "city_jh_ranchi", stateCode: "JH", name: "Ranchi", slug: "ranchi" },
  { id: "city_mp_bhopal", stateCode: "MP", name: "Bhopal", slug: "bhopal" },
  { id: "city_mp_indore", stateCode: "MP", name: "Indore", slug: "indore" },
  { id: "city_kl_kochi", stateCode: "KL", name: "Kochi", slug: "kochi" },
  { id: "city_pb_chandigarh", stateCode: "CH", name: "Chandigarh", slug: "chandigarh" },
  { id: "city_ga_panaji", stateCode: "GA", name: "Panaji", slug: "panaji" },
];

export const UNIT_KINDS = [
  {
    id: "uk_campus",
    key: "campus",
    label: "Campus team",
    description: "Students organising from a campus",
  },
  {
    id: "uk_college",
    key: "college",
    label: "College team",
    description: "College or university chapter",
  },
  {
    id: "uk_community",
    key: "community",
    label: "Community team",
    description: "Neighbourhood or locality group",
  },
  {
    id: "uk_workplace",
    key: "workplace",
    label: "Workplace team",
    description: "Young professionals at a workplace",
  },
  {
    id: "uk_club",
    key: "club",
    label: "Club team",
    description: "Interest or activity club",
  },
  {
    id: "uk_partner",
    key: "partner",
    label: "Partner team",
    description: "Partner organisation under Speak Up Gen",
  },
  {
    id: "uk_custom",
    key: "custom",
    label: "Custom team",
    description: "Other youth team that fits the mission",
  },
] as const;
