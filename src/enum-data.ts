export interface EnumData<Data = any> {
  variant: number;
  data: Data;
}

export type Variant<V extends number, D = undefined> = {
  variant: V;
  data: D;
};

export function enumData<E extends EnumData, V extends E = E>(
  variant: V['variant'],
  data: V["data"]
): E {
  return <E>{
    variant,
    data,
  };
}
