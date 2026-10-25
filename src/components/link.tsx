"use client";

import { useRouter } from "@bprogress/next/app";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ComponentProps, type MouseEvent } from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

// Use this for every in-app link instead of next/link.
// - Navigation starts on mouse down, about 100ms before the click event fires,
//   so pages feel instant. Next.js already prefetches links in view and on hover.
// - `data-active` is set when the link points at the current page, so active
//   styles are one class away: className="data-active:font-bold".
export function Link({ href, onMouseDown, onClick, ...props }: LinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navigatedOnMouseDown = useRef(false);

  function navigateEarly(event: MouseEvent<HTMLAnchorElement>) {
    onMouseDown?.(event);
    const isPlainLeftClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    const staysInThisTab = !props.target || props.target === "_self";
    if (event.defaultPrevented || !isPlainLeftClick || !staysInThisTab) return;
    navigatedOnMouseDown.current = true;
    router.push(href);
  }

  function skipSecondNavigation(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // The mouse-down handler already navigated; stop next/link from doing it again.
    if (navigatedOnMouseDown.current) event.preventDefault();
    navigatedOnMouseDown.current = false;
  }

  return (
    <NextLink
      href={href}
      data-active={pathname === href ? "" : undefined}
      aria-current={pathname === href ? "page" : undefined}
      onMouseDown={navigateEarly}
      onClick={skipSecondNavigation}
      {...props}
    />
  );
}
