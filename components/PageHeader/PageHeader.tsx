"use client";

import { ChevronLeft } from "react-bootstrap-icons";
import { Link } from "@/i18n/navigation";
import type { Layout } from "@/types/models";
import { useTranslations } from "next-intl";
import { Order, OrderDropdown } from "./OrderDropdown/OrderDropdown";
import { LayoutDropdown } from "./LayoutDropdown/LayoutDropdown";
import styles from "./PageHeader.module.css";
import { useEffect, useState } from "react";

interface PageHeaderProps {
  title?: string;
  backLink?: string;
  order: Order;
  onChangeOrder: (order: Order) => void;
  availableOrderBys: string[];
  layout: Layout;
  onChangeLayout: (layout: Layout) => void;
}

export default function PageHeader({
  title,
  backLink,
  order,
  onChangeOrder,
  availableOrderBys,
  layout,
  onChangeLayout,
}: PageHeaderProps) {
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
            <OrderDropdown
              value={order}
              onChange={onChangeOrder}
              availableValues={availableOrderBys}
            />
          </li>
          <li>
            <LayoutDropdown value={layout} onChange={onChangeLayout} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
