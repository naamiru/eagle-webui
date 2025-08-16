import { Order, ItemOrderBy, ITEM_ORDER_BY } from "@/types/models";

function isItemOrderBy(value: string): value is ItemOrderBy {
  return ITEM_ORDER_BY.includes(value as ItemOrderBy);
}

export function orderToString(order: Order<ItemOrderBy>): string {
  const prefix = order.sortIncrease ? "" : "-";
  return `${prefix}${order.orderBy}`;
}

export function stringToOrder(str: string | null | undefined): Order<ItemOrderBy> | undefined {
  if (!str) return undefined;
  
  const sortIncrease = !str.startsWith("-");
  const orderByStr = sortIncrease ? str : str.substring(1);
  
  if (!isItemOrderBy(orderByStr)) return undefined;
  
  return {
    orderBy: orderByStr,
    sortIncrease
  };
}