"use client";

import { SortDown } from "react-bootstrap-icons";
import { useTranslations } from "next-intl";
import styles from "./OrderDropdown.module.css";
import { Order } from "@/types/models";

interface OrderDropdownProps<OrderBy extends string> {
  value: Order<OrderBy>;
  onChange: (order: Order<OrderBy>) => void;
  availableValues: readonly OrderBy[];
}

export function OrderDropdown<OrderBy extends string>({
  value,
  onChange,
  availableValues,
}: OrderDropdownProps<OrderBy>) {
  const t = useTranslations();

  function onClickOrder(orderBy: OrderBy) {
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
              {t(`orderBy.${orderBy as string}`)}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
