"use client";

import { SortDown } from "react-bootstrap-icons";
import { useTranslations } from "next-intl";
import styles from "./OrderDropdown.module.css";

export interface Order {
  orderBy: string;
  sortIncrease: boolean;
}

interface OrderDropdownProps {
  value: Order;
  onChange: (order: Order) => void;
  availableValues: string[];
}

export function OrderDropdown({
  value,
  onChange,
  availableValues,
}: OrderDropdownProps) {
  const t = useTranslations();

  function onClickOrder(orderBy: string) {
    onChange({
      orderBy,
      sortIncrease:
        orderBy === value.orderBy ? !value.sortIncrease : value.sortIncrease,
    });
  }

  return (
    <details className={`dropdown ${styles.sort}`}>
      <summary>
        <SortDown size={20} />
      </summary>
      <ul dir="rtl" className={value.sortIncrease ? styles.asc : styles.desc}>
        {availableValues.map((orderBy) => (
          <li
            key={orderBy}
            className={orderBy === value.orderBy ? styles.active : ""}
            dir="ltr"
          >
            <a
              onClick={() => {
                onClickOrder(orderBy);
              }}
            >
              {t(`orderBy.${orderBy}`)}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
