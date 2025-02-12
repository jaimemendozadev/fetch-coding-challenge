import { SearchShape } from '@/utils/ts';

export const getZipCodesFromString = (
  zipCodeString: string
): RegExpMatchArray | null => {
  return zipCodeString.match(/\b\d{5}\b/g);
};

interface QueryParams extends SearchShape {
  from?: number;
}
export const getFrontendSearchURL = ({
  ageMin,
  ageMax,
  zipCodes,
  size,
  breeds,
  sort,
  from
}: QueryParams): string => {
  let frontendURL = `/search?&size=${size}`;

  if (ageMin.length > 0) {
    frontendURL = `${frontendURL}&ageMin=${ageMin}`;
  }

  if (ageMax.length > 0) {
    frontendURL = `${frontendURL}&ageMax=${ageMax}`;
  }

  if (zipCodes.length > 0) {
    frontendURL = `${frontendURL}&zipCodes=${zipCodes}`;
  }

  const dogBreeds = Array.from(breeds);

  if (dogBreeds.length > 0) {
    frontendURL = `${frontendURL}&breeds=${dogBreeds}`;
  }

  const [sortOrder] = Array.from(sort);

  // See Dev Note #1
  if (typeof sortOrder === 'string') {
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      frontendURL = `${frontendURL}&sort=breed:${sortOrder}`;
    }
  }

  if (from) {
    frontendURL = `${frontendURL}&from=${from}`;
  }

  return frontendURL;
};

export const DOG_BREEDS = [
  'Affenpinscher',
  'Afghan Hound',
  'African Hunting Dog',
  'Airedale',
  'American Staffordshire Terrier',
  'Appenzeller',
  'Australian Terrier',
  'Basenji',
  'Basset',
  'Beagle',
  'Bedlington Terrier',
  'Bernese Mountain Dog',
  'Black-and-tan Coonhound',
  'Blenheim Spaniel',
  'Bloodhound',
  'Bluetick',
  'Border Collie',
  'Border Terrier',
  'Borzoi',
  'Boston Bull',
  'Bouvier Des Flandres',
  'Boxer',
  'Brabancon Griffon',
  'Briard',
  'Brittany Spaniel',
  'Bull Mastiff',
  'Cairn',
  'Cardigan',
  'Chesapeake Bay Retriever',
  'Chihuahua',
  'Chow',
  'Clumber',
  'Cocker Spaniel',
  'Collie',
  'Curly-coated Retriever',
  'Dandie Dinmont',
  'Dhole',
  'Dingo',
  'Doberman',
  'English Foxhound',
  'English Setter',
  'English Springer',
  'EntleBucher',
  'Eskimo Dog',
  'Flat-coated Retriever',
  'French Bulldog',
  'German Shepherd',
  'German Short-haired Pointer',
  'Giant Schnauzer',
  'Golden Retriever',
  'Gordon Setter',
  'Great Dane',
  'Great Pyrenees',
  'Greater Swiss Mountain Dog',
  'Groenendael',
  'Ibizan Hound',
  'Irish Setter',
  'Irish Terrier',
  'Irish Water Spaniel',
  'Irish Wolfhound',
  'Italian Greyhound',
  'Japanese Spaniel',
  'Keeshond',
  'Kelpie',
  'Kerry Blue Terrier',
  'Komondor',
  'Kuvasz',
  'Labrador Retriever',
  'Lakeland Terrier',
  'Leonberg',
  'Lhasa',
  'Malamute',
  'Malinois',
  'Maltese Dog',
  'Mexican Hairless',
  'Miniature Pinscher',
  'Miniature Poodle',
  'Miniature Schnauzer',
  'Newfoundland',
  'Norfolk Terrier',
  'Norwegian Elkhound',
  'Norwich Terrier',
  'Old English Sheepdog',
  'Otterhound',
  'Papillon',
  'Pekinese',
  'Pembroke',
  'Pomeranian',
  'Pug',
  'Redbone',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Saint Bernard',
  'Saluki',
  'Samoyed',
  'Schipperke',
  'Scotch Terrier',
  'Scottish Deerhound',
  'Sealyham Terrier',
  'Shetland Sheepdog',
  'Shih-Tzu',
  'Siberian Husky',
  'Silky Terrier',
  'Soft-coated Wheaten Terrier',
  'Staffordshire Bullterrier',
  'Standard Poodle',
  'Standard Schnauzer',
  'Sussex Spaniel',
  'Tibetan Mastiff',
  'Tibetan Terrier',
  'Toy Poodle',
  'Toy Terrier',
  'Vizsla',
  'Walker Hound',
  'Weimaraner',
  'Welsh Springer Spaniel',
  'West Highland White Terrier',
  'Whippet',
  'Wire-haired Fox Terrier',
  'Yorkshire Terrier'
];

/******************************************** 
   * Notes
   ******************************************** 

   1) For version 1, we only sort by the breed 
      IF THE USER MAKES A SELECTION in the dropdown menu. 
  */
