"use client";

import * as React from "react";
import { IconSlash } from "@tabler/icons-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export const Breadcrumbs: React.FC = () => {
  const items = useBreadcrumbs();

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index, array) => (
          <React.Fragment key={item.title}>
            {index !== array.length - 1 && (
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < array.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block">
                <IconSlash />
              </BreadcrumbSeparator>
            )}
            {index === array.length - 1 && (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
