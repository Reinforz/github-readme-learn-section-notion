import { IPage, TTextColor } from '@nishans/types';

export type ICategoryMap = Map<
  string,
  {
    items: IPage['properties'][];
    color: TTextColor;
  }
>;
