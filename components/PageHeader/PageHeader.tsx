"use client";

import { ChevronLeft } from "react-bootstrap-icons";
import { Link } from "@/i18n/navigation";
import type { Layout, Order } from "@/types/models";
import { useTranslations } from "next-intl";
import { OrderDropdown } from "./OrderDropdown/OrderDropdown";
import { LayoutDropdown } from "./LayoutDropdown/LayoutDropdown";
import styles from "./PageHeader.module.css";
import { useEffect, useState } from "react";

interface PageHeaderProps<OrderBy extends string> {
  title?: string;
  backLink?: string;
  order: Order<OrderBy>;
  onChangeOrder: (order: Order<OrderBy>) => void;
  availableOrderBys: readonly OrderBy[];
  layout: Layout;
  onChangeLayout: (layout: Layout) => void;
}

export default function PageHeader<OrderBy extends string>({
  title,
  backLink,
  order,
  onChangeOrder,
  availableOrderBys,
  layout,
  onChangeLayout,
}: PageHeaderProps<OrderBy>) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = useTranslations();

  return (
    <header className={`${styles.header} ${isStuck ? styles.stuck : ""}`}>
      <nav>
        <ul>
          <li>
            {backLink && (
              <Link href={backLink} aria-label={t("navigation.back")}>
                <ChevronLeft size={20} />
              </Link>
            )}
          </li>
        </ul>
        <ul>
          <li>{title && <strong>{title}</strong>}</li>
        </ul>
        <ul>
          <li>
            <LayoutDropdown value={layout} onChange={onChangeLayout} />
          </li>
          <li>
            <OrderDropdown
              value={order}
              onChange={onChangeOrder}
              availableValues={availableOrderBys}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}
