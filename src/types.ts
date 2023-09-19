type ProvinceCode = string;
type ProvinceName = string;

type CityCode = string;
type CityName = string;

type CountryCode = string;
type CountryName = string;

type CnAreaData = Array<{
  code: ProvinceCode;
  name: ProvinceName;
  children: Array<{
    code: CityCode;
    name: CityName;
    children: Array<{
      code: CountryCode;
      name: CountryName;
    }>;
  }>;
}>;

export { CnAreaData };
