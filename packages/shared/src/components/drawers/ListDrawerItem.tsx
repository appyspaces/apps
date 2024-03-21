import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';
import type { SelectParams } from './common';

type CustomItem = (value: string, index: number) => ReactNode;

export interface ListDrawerItemProps {
  value: string;
  index: number;
  isSelected: boolean;
  onClick: (params: Omit<SelectParams, 'index'>) => void;
  customItem?: CustomItem;
}

export function ListDrawerItem({
  value,
  index,
  onClick,
  isSelected,
  customItem,
}: ListDrawerItemProps): ReactElement {
  return (
    <button
      key={value}
      role="menuitem"
      type="button"
      className={classNames(
        'flex h-10 flex-row items-center overflow-hidden text-ellipsis whitespace-nowrap px-2 typo-callout',
        isSelected ? 'font-bold' : 'text-theme-label-tertiary',
      )}
      onClick={(event) => onClick({ value, event })}
    >
      {customItem ? customItem(value, index) : value}
      {isSelected && (
        <VIcon secondary size={IconSize.Small} className="ml-auto" />
      )}
    </button>
  );
}
