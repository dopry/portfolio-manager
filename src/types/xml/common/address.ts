export type CAStates =
  | "AB" // Alberta in Canada
  | "BC" // British Columbia in Canada
  | "MB" // Manitoba in Canada
  | "NB" // New Brunswick in Canada
  | "NL" // Newfoundland and Labrador in Canada
  | "NS" // Nova Scotia in Canada
  | "NT" // Northwest Territories in Canada
  | "NU" // Nunavut in Canada
  | "ON" // Ontario in Canada
  | "PE" // Prince Edward Island in Canada
  | "QC" // Quebec in Canada
  | "SK" // Saskatchewan in Canada
  | "YT"; // Yukon in Canada;

export type USStates =
  | "AK" // Alaska in United States
  | "AL" // Alabama in United States
  | "AR" // Arkansas in United States
  | "AS" // American Samoa in United States
  | "AZ" // Arizona in United States
  | "CA" // California in United States
  | "CO" // Colorado in United States
  | "CT" // Connecticut in United States
  | "DC" // District of Columbia in United States
  | "DE" // Delaware in United States
  | "FL" // Florida in United States
  | "GA" // Georgia in United States
  | "GU" // Guam in United States
  | "HI" // Hawaii in United States
  | "IA" // Iowa in United States
  | "ID" // Idaho in United States
  | "IL" // Illinois in United States
  | "IN" // Indiana in United States
  | "KS" // Kansas in United States
  | "KY" // Kentucky in United States
  | "LA" // Louisiana in United States
  | "MA" // Massachusetts in United States
  | "MD" // Maryland in United States
  | "ME" // Maine in United States
  | "MH" // Marshall Islands in United States
  | "MI" // Michigan in United States
  | "MN" // Minnesota in United States
  | "MO" // Missouri in United States
  | "MP" // Northern Mariana Islands in United States
  | "MS" // Mississippi in United States
  | "MT" // Montana in United States
  | "NC" // North Carolina in United States
  | "ND" // North Dakota in United States
  | "NE" // Nebraska in United States
  | "NH" // New Hampshire in United States
  | "NJ" // New Jersey in United States
  | "NM" // New Mexico in United States
  | "NN" // Navajo Nation in United States
  | "NV" // Nevada in United States
  | "NY" // New York in United States
  | "OH" // Ohio in United States
  | "OK" // Oklahoma in United States
  | "OR" // Oregon in United States
  | "PA" // Pennsylvania in United States
  | "PI" // Pacific Islands in United States
  | "PR" // Puerto Rico in United States
  | "RI" // Rhode Island in United States
  | "SC" // South Carolina in United States
  | "SD" // South Dakota in United States
  | "TN" // Tennessee in United States
  | "TT" // Trust Territory in United States
  | "TX" // Texas in United States
  | "UM" // United States Minor Outlying Islands
  | "UT" // Utah in United States
  | "VA" // Virginia in United States
  | "VI" // Virgin Islands in United States
  | "VT" // Vermont in United States
  | "WA" // Washington in United States
  | "WI" // Wisconsin in United States
  | "WQ" // Wake Island in United States
  | "WV" // West Virginia in United States
  | "WY"; // Wyoming in United States;

export type AddressState = USStates | CAStates;

// xml: countryList
export type AddressCountry =
  | "US" // United States
  | "CA" // Canada
  | "AD" // Andorra
  | "AE" // United Arab Emirates
  | "AF" // Afghanistan
  | "AG" // Antigua and Barbuda
  | "AI" // Anguilla
  | "AL" // Albania
  | "AM" // Armenia
  | "AO" // Angola
  | "AQ" // Antarctica
  | "AR" // Argentina
  | "AT" // Austria
  | "AU" // Australia
  | "AW" // Aruba
  | "AX" // Åland Islands
  | "AZ" // Azerbaijan
  | "BA" // Bosnia and Herzegovina
  | "BB" // Barbados
  | "BD" // Bangladesh
  | "BE" // Belgium
  | "BF" // Burkina Faso
  | "BG" // Bulgaria
  | "BH" // Bahrain
  | "BI" // Burundi
  | "BJ" // Benin
  | "BL" // Saint Barthélemy
  | "BM" // Bermuda
  | "BN" // Brunei Darussalam
  | "BO" // Bolivia
  | "BQ" // Bonaire, Sint Eustatius and Saba
  | "BR" // Brazil
  | "BS" // Bahamas
  | "BT" // Bhutan
  | "BV" // Bouvet Island
  | "BW" // Botswana
  | "BY" // Belarus
  | "BZ" // Belize
  | "CA" // Canada
  | "CC" // Cocos (Keeling) Islands
  | "CD" // Congo, the Democratic Republic of the
  | "CF" // Central African Republic
  | "CG" // Congo
  | "CH" // Switzerland
  | "CI" // Côte d'Ivoire
  | "CK" // Cook Islands
  | "CL" // Chile
  | "CM" // Cameroon
  | "CN" // China
  | "CO" // Colombia
  | "CR" // Costa Rica
  | "CU" // Cuba
  | "CV" // Cape Verde
  | "CW" // Curaçao
  | "CX" // Christmas Island
  | "CY" // Cyprus
  | "CZ" // Czechia
  | "DE" // Germany
  | "DJ" // Djibouti
  | "DK" // Denmark
  | "DM" // Dominica
  | "DO" // Dominican Republic
  | "DZ" // Algeria
  | "EC" // Ecuador
  | "EE" // Estonia
  | "EG" // Egypt
  | "EH" // Western Sahara
  | "ER" // Eritrea
  | "ES" // Spain
  | "ET" // Ethiopia
  | "FI" // Finland
  | "FJ" // Fiji
  | "FK" // Falkland Islands (Malvinas)
  | "FM" // Micronesia, Federated States of
  | "FO" // Faroe Islands
  | "FR" // France
  | "GA" // Gabon
  | "GB" // United Kingdom
  | "GD" // Grenada
  | "GE" // Georgia
  | "GF" // French Guiana
  | "GG" // Guernsey
  | "GH" // Ghana
  | "GI" // Gibraltar
  | "GL" // Greenland
  | "GM" // Gambia
  | "GN" // Guinea
  | "GP" // Guadeloupe
  | "GQ" // Equatorial Guinea
  | "GR" // Greece
  | "GS" // South Georgia and the South Sandwich Islands
  | "GT" // Guatemala
  | "GW" // Guinea-Bissau
  | "GY" // Guyana
  | "HK" // Hong Kong
  | "HM" // Heard Island and McDonald Islands
  | "HN" // Honduras
  | "HR" // Croatia
  | "HT" // Haiti
  | "HU" // Hungary
  | "ID" // Indonesia
  | "IE" // Ireland
  | "IL" // Israel
  | "IM" // Isle of Man
  | "IN" // India
  | "IO" // British Indian Ocean Territory
  | "IQ" // Iraq
  | "IR" // Iran
  | "IS" // Iceland
  | "IT" // Italy
  | "JE" // Jersey
  | "JM" // Jamaica
  | "JO" // Jordan
  | "JP" // Japan
  | "KE" // Kenya
  | "KG" // Kyrgyzstan
  | "KH" // Cambodia
  | "KI" // Kiribati
  | "KM" // Comoros
  | "KN" // Saint Kitts and Nevis
  | "KP" // North Korea
  | "KR" // South Korea
  | "KW" // Kuwait
  | "KY" // Cayman Islands
  | "KZ" // Kazakhstan
  | "LA" // Laos
  | "LB" // Lebanon
  | "LC" // Saint Lucia
  | "LI" // Liechtenstein
  | "LK" // Sri Lanka
  | "LR" // Liberia
  | "LS" // Lesotho
  | "LT" // Lithuania
  | "LU" // Luxembourg
  | "LV" // Latvia
  | "LY" // Libya
  | "MA" // Morocco
  | "MC" // Monaco
  | "MD" // Moldova
  | "ME" // Montenegro
  | "MF" // Saint Martin (French part)
  | "MG" // Madagascar
  | "MK" // Macedonia
  | "ML" // Mali
  | "MM" // Myanmar
  | "MN" // Mongolia
  | "MO" // Macao
  | "MQ" // Martinique
  | "MR" // Mauritania
  | "MS" // Montserrat
  | "MT" // Malta
  | "MU" // Mauritius
  | "MV" // Maldives
  | "MW" // Malawi
  | "MX" // Mexico
  | "MY" // Malaysia
  | "MZ" // Mozambique
  | "NA" // Namibia
  | "NC" // New Caledonia
  | "NE" // Niger
  | "NF" // Norfolk Island
  | "NG" // Nigeria
  | "NI" // Nicaragua
  | "NL" // Netherlands
  | "NO" // Norway
  | "NP" // Nepal
  | "NR" // Nauru
  | "NU" // Niue
  | "NZ" // New Zealand
  | "OM" // Oman
  | "PA" // Panama
  | "PE" // Peru
  | "PF" // French Polynesia
  | "PG" // Papua New Guinea
  | "PH" // Philippines
  | "PK" // Pakistan
  | "PL" // Poland
  | "PM" // Saint Pierre and Miquelon
  | "PN" // Pitcairn
  | "PS" // Palestine
  | "PT" // Portugal
  | "PW" // Palau
  | "PY" // Paragauy
  | "QA" // Qatar
  | "RE" // Reunion
  | "RO" // Romania
  | "RS" // Serbia
  | "RU" // Russian Federation
  | "RW" // Rwanda
  | "SA" // Saudi Arabia
  | "SB" // Solomon Islands
  | "SC" // Seychelles
  | "SD" // Sudan
  | "SE" // Sweden
  | "SG" // Singapore
  | "SH" // Saint Helena, Ascension and Tristan da Cunha
  | "SI" // Slovenia
  | "SJ" // Svalbard and Jan Mayen
  | "SK" // Slovakia
  | "SL" // Sierra Leone
  | "SM" // San Marino
  | "SN" // Senegal
  | "SO" // Somalia
  | "SR" // Suriname
  | "SS" // South Sudan
  | "ST" // Sao Tome and Principe
  | "SV" // El Salvador
  | "SX" // Sint Maarten (Dutch part)
  | "SY" // Syrian Arab Republic
  | "SZ" // Swaziland
  | "TC" // Turks and Caicos Islands
  | "TD" // Chad
  | "TF" // French Southern Territories
  | "TG" // Togo
  | "TH" // Thailand
  | "TJ" // Tajikistan
  | "TK" // Tokelau
  | "TL" // Timor-Leste
  | "TM" // Turkmenistan
  | "TN" // Tunisia
  | "TO" // Tonga
  | "TR" // Turkey
  | "TT" // Trinidad and Tobago
  | "TV" // Tuvalu
  | "TW" // Taiwan
  | "TZ" // Tanzania
  | "UA" // Ukraine
  | "UG" // Uganda
  | "UY" // Uruguay
  | "UZ" // Uzbekistan
  | "VA" // Holy See (Vatican City State)
  | "VC" // Saint Vincent and the Grenadines
  | "VE" // Venezuela
  | "VG" // British Virgin Islands
  | "VN" // Vietnam
  | "VU" // Vanuatu
  | "WF" // Wallis and Futuna
  | "WS" // Samoa
  | "YE" // Yemen
  | "YT" // Mayotte
  | "ZA" // South Africa
  | "ZM" // Zambia
  | "ZW"; // Zimbabwe

export interface IAddress {
  "@_address1": string; // max length: 100
  "@_address2"?: string; // max length: 100
  "@_city": string; // max length: 100
  "@_county"?: string; // max length: 40
  "@_postalCode": string; // max length: 40
  "@_state"?: AddressState; // either state or otherState must be provided
  "@_otherState"?: string; // max length: 50
  "@_country": AddressCountry;
}
