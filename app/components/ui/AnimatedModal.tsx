"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import React, { useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { MdClose } from "react-icons/md";

export type ModalCloseReason =
  | "backdrop"
  | "escape"
  | "closeButton"
  | "programmatic";

export type AnimatedModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type AnimatedModalPlacement = "center" | "top";

export type AnimatedModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean, reason: ModalCloseReason) => void;
  children: React.ReactNode;

  title?: React.ReactNode;
  description?: React.ReactNode;

  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;

  size?: AnimatedModalSize;
  placement?: AnimatedModalPlacement;

  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;

  lockScroll?: boolean;
  trapFocus?: boolean;

  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;

  portal?: boolean;
  portalContainer?: Element | null;

  overlayClassName?: string;
  panelClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;

  overlayMotionProps?: Partial<MotionProps>;
  panelMotionProps?: Partial<MotionProps>;

  preventClose?: boolean;
};

function getFocusableElements(root: HTMLElement) {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selectors));
  return nodes.filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

function joinClassNames(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

export function AnimatedModal({
  open,
  onOpenChange,
  children,
  title,
  description,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  size = "md",
  placement = "center",
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  lockScroll = true,
  trapFocus = true,
  initialFocusRef,
  finalFocusRef,
  portal = true,
  portalContainer,
  overlayClassName,
  panelClassName,
  headerClassName,
  bodyClassName,
  overlayMotionProps,
  panelMotionProps,
  preventClose = false,
}: AnimatedModalProps) {
  const reactId = useId();
  const reduceMotion = useReducedMotion();
  const tCommon = useTranslations("common");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);

  const computedTitleId = useMemo(() => `${reactId}-title`, [reactId]);
  const computedDescId = useMemo(() => `${reactId}-desc`, [reactId]);

  const labelledBy = ariaLabelledby ?? (title ? computedTitleId : undefined);
  const describedBy =
    ariaDescribedby ?? (description ? computedDescId : undefined);

  function requestClose(reason: ModalCloseReason) {
    if (preventClose) return;
    onOpenChange?.(false, reason);
  }

  useEffect(() => {
    if (!open) return;

    if (typeof document === "undefined") return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const finalFocusElement = finalFocusRef?.current ?? null;

    if (lockScroll) {
      previousBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      if (lockScroll && typeof document !== "undefined") {
        document.body.style.overflow = previousBodyOverflowRef.current ?? "";
      }

      const target = finalFocusElement ?? previousActiveElement;
      if (target && typeof target.focus === "function") {
        // Delay to let unmount/animation settle.
        setTimeout(() => target.focus(), 0);
      }
    };
  }, [open, lockScroll, finalFocusRef]);

  useEffect(() => {
    if (!open) return;
    if (!panelRef.current) return;

    const panelEl = panelRef.current;

    const focusTarget =
      initialFocusRef?.current ??
      getFocusableElements(panelEl)[0] ??
      (panelEl as HTMLElement);

    setTimeout(() => {
      if (!open) return;
      focusTarget?.focus?.();
    }, 0);
  }, [open, initialFocusRef]);

  function onBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!closeOnBackdropClick) return;
    if (e.target !== e.currentTarget) return;
    requestClose("backdrop");
  }

  function onPanelKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && closeOnEscape) {
      e.stopPropagation();
      requestClose("escape");
      return;
    }

    if (!trapFocus) return;
    if (e.key !== "Tab") return;

    const panelEl = panelRef.current;
    if (!panelEl) return;

    const focusables = getFocusableElements(panelEl);
    if (focusables.length === 0) {
      e.preventDefault();
      panelEl.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (e.shiftKey && (active === first || active === panelEl)) {
      e.preventDefault();
      last.focus();
    }
  }

  const sizeClass =
    size === "sm"
      ? "max-w-sm"
      : size === "md"
        ? "max-w-lg"
        : size === "lg"
          ? "max-w-2xl"
          : size === "xl"
            ? "max-w-4xl"
            : "max-w-none";

  const fullClass =
    size === "full" ? "w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]" : "w-full";

  const placementClass =
    placement === "top" ? "items-start pt-10" : "items-center";

  const overlayBase = "fixed inset-0 z-50 flex justify-center px-4 bg-black/50";

  const panelBase =
    "relative outline-none rounded-2xl border border-gray-100 dark:border-gray-700 bg-background-light dark:bg-background-dark shadow-xl";

  const headerBase = "flex items-start justify-between gap-4 p-6";
  const bodyBase = "px-6 pb-6";

  const overlayInitial = reduceMotion ? { opacity: 0 } : { opacity: 0 };
  const overlayAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1 };
  const overlayExit = reduceMotion ? { opacity: 0 } : { opacity: 0 };

  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: placement === "top" ? -10 : 10, scale: 0.98 };

  const panelAnimate = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  const panelExit = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: placement === "top" ? -10 : 10, scale: 0.98 };

  const defaultOverlayTransition = { duration: 0.18, ease: "easeOut" } as const;
  const defaultPanelTransition = { duration: 0.22, ease: "easeOut" } as const;

  const modalContent = (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="modal-overlay"
          className={joinClassNames(
            overlayBase,
            placementClass,
            overlayClassName,
          )}
          initial={overlayInitial}
          animate={overlayAnimate}
          exit={overlayExit}
          transition={defaultOverlayTransition}
          onMouseDown={onBackdropMouseDown}
          aria-hidden={false}
          data-state="open"
          {...overlayMotionProps}
        >
          <motion.div
            key="modal-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : labelledBy}
            aria-describedby={describedBy}
            tabIndex={-1}
            className={joinClassNames(
              panelBase,
              fullClass,
              sizeClass,
              "my-4",
              panelClassName,
            )}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={defaultPanelTransition}
            onKeyDown={onPanelKeyDown}
            {...panelMotionProps}
          >
            {(title || description || showCloseButton) && (
              <div className={joinClassNames(headerBase, headerClassName)}>
                <div className="min-w-0">
                  {title ? (
                    <h2
                      id={computedTitleId}
                      className="text-lg font-bold text-gray-900 dark:text-white"
                    >
                      {title}
                    </h2>
                  ) : null}

                  {description ? (
                    <p
                      id={computedDescId}
                      className="mt-1 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>

                {showCloseButton ? (
                  <button
                    type="button"
                    onClick={() => requestClose("closeButton")}
                    className="shrink-0 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    aria-label={tCommon("closeModal")}
                  >
                    <MdClose className="text-xl" aria-hidden />
                  </button>
                ) : null}
              </div>
            )}

            <div className={joinClassNames(bodyBase, bodyClassName)}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (!portal) return modalContent;

  if (typeof document === "undefined") return null;
  const target = portalContainer ?? document.body;

  return createPortal(modalContent, target);
}

export default AnimatedModal;
