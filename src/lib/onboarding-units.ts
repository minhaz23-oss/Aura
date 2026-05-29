export type HeightUnit = "cm" | "ft_in";
export type WeightUnit = "kg" | "lbs";

export function cmFromFeetInches(feet: number, inches: number) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgFromLbs(lbs: number) {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export function lbsFromKg(kg: number) {
  return Math.round((kg / 0.453592) * 10) / 10;
}

export function ageFromBirthDate(year: number, month: number, day: number) {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
