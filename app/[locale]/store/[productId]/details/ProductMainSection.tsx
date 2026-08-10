"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  RiAddLine,
  RiShareLine,
  RiShoppingBagLine,
  RiSubtractLine,
} from "react-icons/ri";

import { ProductT } from "@/app/api/products";
import { useCart } from "@/hooks/useCart";
import SarAmount from "@/app/components/ui/SarAmount";

export default function ProductMainSection({ product }: { product: ProductT }) {
  const t = useTranslations("store");
  const { addProduct } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // API may return only `image` (list endpoints) while `images` is empty on detail.
  const galleryImages =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const mainImage =
    galleryImages[
      Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0))
    ] ?? product.image;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Right Column: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div className="relative w-full aspect-square bg-white dark:bg-[#1a160e] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-[#332d22] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            // data-alt={product.name}
            src={mainImage}
          />
          {/* <div className="absolute top-4 left-4">
            <button
              type="button"
              className="size-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              aria-label={
                isFavorite
                  ? t("product.actions.removeFromFavorites")
                  : t("product.actions.addToFavorites")
              }
              onClick={() => setIsFavorite((v) => !v)}
            >
              {isFavorite ? (
                <RiHeartFill className="text-xl" aria-hidden="true" />
              ) : (
                <RiHeartLine className="text-xl" aria-hidden="true" />
              )}
            </button>
          </div> */}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {galleryImages.map((img, idx) => {
            const selected = idx === activeImageIndex;
            return (
              <button
                key={img}
                type="button"
                className={
                  "relative size-20 sm:size-24 flex-shrink-0 rounded-xl overflow-hidden border-2 shadow-sm transition-all bg-white " +
                  (selected
                    ? "border-primary"
                    : "border-transparent hover:border-secondary/50")
                }
                aria-label={`${product.name} - ${idx + 1}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={img.split("/").pop()?.split(".")[0] ?? product.name}
                  className="w-full h-full object-cover"
                  src={img}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Left Column: Product Info */}
      <div className="flex flex-col justify-start pt-2">
        {/* Title & Tags */}
        <div className="mb-4">
          {product.available ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 ml-1.5" />
              {t("product.stock.inStock")}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 ml-1.5" />
              {t("product.stock.outOfStock")}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-text-main dark:text-white leading-tight mb-2">
            {product.name}
          </h1>
          {/* <div className="flex items-center gap-2">
            <div
              className="flex text-primary"
              aria-label={t("product.rating.aria")}
            >
              <RiStarFill className="text-lg" aria-hidden="true" />
              <RiStarFill className="text-lg" aria-hidden="true" />
              <RiStarFill className="text-lg" aria-hidden="true" />
              <RiStarFill className="text-lg" aria-hidden="true" />
              <RiStarHalfFill className="text-lg" aria-hidden="true" />
            </div>
            <span className="text-sm text-text-sub">
              {t("product.rating.count", { count: 125 })}
            </span>
          </div> */}
        </div>

        {/* Price */}
        <div className="mb-8 p-4 bg-white dark:bg-[#1a160e] rounded-xl border border-dashed border-[#dcdcdc] dark:border-[#332d22] inline-block w-full">
          {product.discount_price ? (
            <div className="flex items-baseline gap-3 flex-wrap">
              <SarAmount
                value={product.discount_price}
                maximumFractionDigits={2}
                className="text-4xl font-bold text-primary"
                symbolClassName="inline-block h-[0.9em] w-auto"
              />
              <SarAmount
                value={product.price}
                maximumFractionDigits={2}
                className="text-lg text-text-sub line-through font-bold"
                symbolClassName="inline-block h-[0.85em] w-auto"
              />
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <SarAmount
                value={product.price}
                maximumFractionDigits={2}
                className="text-4xl font-bold text-primary"
                symbolClassName="inline-block h-[0.9em] w-auto"
              />
            </div>
          )}
          <p className="text-sm text-text-sub mt-1">
            {t("product.price.vatIncluded")}
          </p>
        </div>

        {/* Short Description */}
        <p className="text-text-sub text-base leading-relaxed mb-8 dark:text-gray-400">
          {product.description}
        </p>

        {/* Selectors */}
        <div className="space-y-6 mb-8 border-t border-b border-gray-100 dark:border-[#332d22] py-6">
          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-text-main dark:text-white">
              {t("product.quantity.label")}
            </span>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#2a241a]">
              <button
                type="button"
                className="size-10 flex items-center justify-center text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-[#362f22] rounded-r-lg transition-colors"
                aria-label={t("product.quantity.increase")}
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              >
                <RiAddLine className="text-xl" aria-hidden="true" />
              </button>
              <input
                className="w-12 text-center border-none focus:ring-0 bg-transparent text-text-main dark:text-white font-bold h-10 p-0"
                readOnly
                type="number"
                value={quantity}
                aria-label={t("product.quantity.inputAria")}
              />
              <button
                type="button"
                className="size-10 flex items-center justify-center text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-[#362f22] rounded-l-lg transition-colors"
                aria-label={t("product.quantity.decrease")}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <RiSubtractLine className="text-xl" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-4 mt-auto">
          <button
            type="button"
            className="flex-1 min-h-14 bg-primary text-[#171512] text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-[#c9953a] hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
            aria-label={t("product.actions.addToCart")}
            onClick={() => {
              // Placeholder: wire this to your cart store/action
              addProduct({ ...product, quantity, type: "product" }, "replace");
            }}
          >
            <RiShoppingBagLine className="text-xl" aria-hidden="true" />
            {t("product.actions.addToCart")}
          </button>

          <button
            type="button"
            className="flex-none w-14 h-14 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-text-main dark:text-white hover:border-primary hover:text-primary transition-colors"
            aria-label={t("product.actions.share")}
            onClick={async () => {
              try {
                const share = (
                  navigator as Navigator & {
                    share?: (data: ShareData) => Promise<void>;
                  }
                ).share;

                if (typeof share === "function") {
                  await share({
                    title: t(`products.items.details.title`),
                    text: t("product.share.text"),
                    url: window.location.href,
                  });
                }
              } catch {
                // ignore
              }
            }}
          >
            <RiShareLine className="text-xl" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
