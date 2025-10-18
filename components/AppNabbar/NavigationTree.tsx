"use client";

import { Box, CloseButton, Tree, type TreeNodeData } from "@mantine/core";
import { IconCaretDownFilled, IconCaretRightFilled } from "@tabler/icons-react";
import type { ComponentType } from "react";
import { MainLink } from "./MainLink";

export type NavigationTreeMeta = {
  node: TreeNodeData;
  expanded: boolean;
  hasChildren: boolean;
};

export type NavigationTreeLinkProps = {
  to: string;
  icon: ComponentType<{
    className?: string;
    size?: number;
    stroke?: number;
  }>;
  count?: number;
  withLeftMargin?: boolean;
};

type NavigationTreeProps = {
  data: TreeNodeData[];
  getLinkProps: (meta: NavigationTreeMeta) => NavigationTreeLinkProps;
  onLinkClick: () => void;
  linkWrapperClassName: string;
  expandIconClassName?: string;
};

export function NavigationTree({
  data,
  getLinkProps,
  onLinkClick,
  linkWrapperClassName,
  expandIconClassName,
}: NavigationTreeProps) {
  return (
    <Tree
      data={data}
      expandOnClick={false}
      renderNode={({ node, expanded, hasChildren, elementProps, tree }) => {
        const { to, icon, count, withLeftMargin } = getLinkProps({
          node,
          expanded,
          hasChildren,
        });

        return (
          <div {...elementProps}>
            <div
              className={linkWrapperClassName}
              {...(hasChildren && { "data-has-children": "" })}
            >
              {hasChildren &&
                (expanded ? (
                  <>
                    <Box visibleFrom="sm">
                      <IconCaretDownFilled
                        className={expandIconClassName}
                        size={12}
                        onClick={() => tree.toggleExpanded(node.value)}
                      />
                    </Box>
                    <CloseButton
                      size="lg"
                      icon={<IconCaretDownFilled size={16} />}
                      hiddenFrom="sm"
                      onClick={() => tree.toggleExpanded(node.value)}
                    />
                  </>
                ) : (
                  <>
                    <Box visibleFrom="sm">
                      <IconCaretRightFilled
                        className={expandIconClassName}
                        size={12}
                        onClick={() => tree.toggleExpanded(node.value)}
                      />
                    </Box>
                    <CloseButton
                      size="lg"
                      icon={<IconCaretRightFilled size={16} />}
                      hiddenFrom="sm"
                      onClick={() => tree.toggleExpanded(node.value)}
                    />
                  </>
                ))}
              <MainLink
                to={to}
                icon={icon}
                label={node.label}
                count={count}
                withLeftMargin={withLeftMargin ?? !hasChildren}
                onClick={onLinkClick}
                onMouseDown={(event) => {
                  if (event.detail === 2) {
                    event.preventDefault();
                  }
                }}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  tree.toggleExpanded(node.value);
                }}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
