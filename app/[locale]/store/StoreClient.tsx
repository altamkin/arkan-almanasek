"use client";

import { CategoryT, getProducts, ProductsResT, TagT } from "@/app/api/products";
import { useCart } from "@/hooks/useCart";
import { Link } from "@/i18n/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  RiApps2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiPriceTag3Line,
  RiSearchLine,
  RiShoppingBagLine,
} from "react-icons/ri";
import SarAmount from "@/app/components/ui/SarAmount";

type StoreClientProps = {
  initialProducts: ProductsResT;
  categories: CategoryT[];
  tags: TagT[];
};

export default function StorePage({
  initialProducts,
  categories,
  tags,
}: StoreClientProps) {
  const { addProduct } = useCart();
  const t = useTranslations("store");
  const tCommon = useTranslations("common");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [tagId, setTagId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("bestSelling");
  const [minPriceInput, setMinPriceInput] = useState("0");
  const [maxPriceInput, setMaxPriceInput] = useState("1000");
  const [available, setAvailable] = useState(true);
  const [page, setPage] = useState(1);

  const perPage = initialProducts.pagination?.per_page;

  const minPrice =
    minPriceInput.trim() === "" ? undefined : Number(minPriceInput);
  const maxPrice =
    maxPriceInput.trim() === "" ? undefined : Number(maxPriceInput);

  const categoryOptions = [
    { id: "all", label: t("categories.all") },
    ...categories.map((c) => ({ id: String(c.id), label: c.name })),
  ];

  const tagOptions = [
    { id: "all", label: t("categories.all") },
    ...tags.map((tag) => ({ id: String(tag.id), label: tag.name })),
  ];

  const categoryLabelByCode = new Map(
    categories.map((c) => [c.code, c.name] as const),
  );

  const isInitialQuery =
    categoryId === "all" &&
    tagId === "all" &&
    search === "" &&
    sort === "bestSelling" &&
    minPrice === 0 &&
    maxPrice === 1000 &&
    available === true &&
    page === 1;

  useEffect(() => {
    setPage(1);
  }, [categoryId, tagId, search, sort, minPrice, maxPrice, available]);

  /* ================== React Query ================== */
  const { data } = useQuery({
    queryKey: [
      "products",
      categoryId,
      tagId,
      search,
      sort,
      minPrice,
      maxPrice,
      available,
      page,
      perPage,
    ],
    queryFn: () =>
      getProducts({
        category_id: categoryId === "all" ? undefined : categoryId,
        tag_id: tagId === "all" ? undefined : tagId,
        search,
        sort,
        minPrice,
        maxPrice,
        available,
        page,
        perPage,
      }),
    ...(isInitialQuery ? { initialData: initialProducts } : {}),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const products = (data ?? initialProducts).products;
  const pagination = (data ?? initialProducts).pagination;
  const currentPage = pagination?.current_page ?? 1;
  const totalPages = pagination?.total_pages ?? 1;
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <>
      <div className="bg-white dark:bg-[#1a160e] border-b border-gray-100 dark:border-[#332e25]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#171511] dark:text-white mb-2">
                {t("brand.title")}
              </h2>
              <p className="text-secondary dark:text-[#d4a86a] text-lg">
                {t("brand.subtitle")}
              </p>
            </div>

            <div className="hidden md:block">
              <nav aria-label={t("breadcrumb.ariaLabel")} className="flex">
                <ol className="inline-flex items-center gap-2">
                  <li>
                    <Link className="text-gray-500 hover:text-primary" href="/">
                      {tCommon("home")}
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li aria-current="page" className="text-primary font-medium">
                    {t("breadcrumb.store")}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="lg:hidden mb-6">
              <div className="relative">
                <input
                  className="w-full h-12 pr-10 pl-4 rounded-xl border border-gray-50 bg-white dark:bg-[#2a241a] shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-primary text-sm transition-shadow"
                  placeholder={t("search.mobilePlaceholder")}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <RiSearchLine
                  className="absolute top-3 right-3 text-gray-400 text-xl"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#2a241a] rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#332e25]">
              <h3 className="text-lg font-bold text-[#171511] dark:text-white mb-4 flex items-center gap-2">
                <RiApps2Line
                  className="text-primary text-xl"
                  aria-hidden="true"
                />
                {t("filters.categories")}
              </h3>

              <div className="space-y-3">
                {categoryOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                      name="category"
                      type="radio"
                      value={option.id}
                      checked={categoryId === option.id}
                      onChange={() => setCategoryId(option.id)}
                    />
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#2a241a] rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#332e25]">
              <h3 className="text-lg font-bold text-[#171511] dark:text-white mb-4 flex items-center gap-2">
                <RiPriceTag3Line
                  className="text-primary text-xl"
                  aria-hidden="true"
                />
                {t("filters.tags")}
              </h3>

              <div className="space-y-3">
                {tagOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                      name="tag"
                      type="radio"
                      value={option.id}
                      checked={tagId === option.id}
                      onChange={() => setTagId(option.id)}
                    />
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#2a241a] rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#332e25]">
              <h3 className="text-lg font-bold text-[#171511] dark:text-white mb-4 flex items-center gap-2">
                <RiPriceTag3Line
                  className="text-primary text-xl"
                  aria-hidden="true"
                />
                {t("filters.price")}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400">
                    {t("filters.minPrice")}
                  </label>
                  <input
                    className="w-full h-11 px-3 rounded-xl border border-gray-50 bg-white dark:bg-[#2a241a] shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-primary text-sm transition-shadow text-[#171511] dark:text-white"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400">
                    {t("filters.maxPrice")}
                  </label>
                  <input
                    className="w-full h-11 px-3 rounded-xl border border-gray-50 bg-white dark:bg-[#2a241a] shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:ring-2 focus:ring-primary text-sm transition-shadow text-[#171511] dark:text-white"
                    inputMode="numeric"
                    min={0}
                    placeholder="1000"
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#2a241a] rounded-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-[#332e25]">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {t("filters.inStockOnly")}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    className="sr-only peer"
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </aside>

          <section className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-96 hidden lg:block">
                <input
                  className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-50 bg-white dark:bg-[#2a241a] shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:ring-1 focus:ring-primary text-base placeholder:text-gray-400 text-[#171511] dark:text-white transition-all"
                  placeholder={t("search.desktopPlaceholder")}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <RiSearchLine
                  className="absolute top-3 right-3 text-gray-400 text-xl"
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-gray-500 whitespace-nowrap text-sm font-medium">
                  {t("sort.label")}
                </span>
                <select
                  className="h-12 bg-white dark:bg-[#2a241a] border border-gray-50 rounded-xl text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-primary cursor-pointer w-full sm:w-48 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 transition-shadow"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="bestSelling">
                    {t("sort.options.bestSelling")}
                  </option>
                  <option value="priceLowToHigh">
                    {t("sort.options.priceLowToHigh")}
                  </option>
                  <option value="priceHighToLow">
                    {t("sort.options.priceHighToLow")}
                  </option>
                  <option value="newest">{t("sort.options.newest")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) =>
                (() => {
                  const categoryLabel =
                    typeof product.category === "string"
                      ? (categoryLabelByCode.get(product.category) ??
                        product.category)
                      : product.category?.name;

                  return (
                    <Link
                      key={product.id}
                      href={`/store/${product.id}/details`}
                      className="group bg-white dark:bg-[#2a241a] rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all duration-500 ease-out border border-gray-50 dark:border-[#332e25] flex flex-col"
                    >
                      <div className="relative h-64 overflow-hidden bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={product.image}
                        />

                        {categoryLabel && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-secondary shadow-sm">
                            {categoryLabel}
                          </div>
                        )}

                        {/* {"badgeKey" in product && product.badgeKey ? (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {t(product.badgeKey)}
                      </div>
                    ) : null} */}
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-[#171511] dark:text-white line-clamp-2">
                            {product.name}
                          </h3>
                          {/* <button
                            type="button"
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label={t("actions.addToFavorites")}
                          >
                            <RiHeartLine
                              className="text-[20px]"
                              aria-hidden="true"
                            />
                          </button> */}
                        </div>

                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          {product.discount_price ? (
                            <div className="flex flex-col">
                              <SarAmount
                                value={product.price}
                                maximumFractionDigits={2}
                                className="text-xs text-gray-400 line-through"
                                symbolClassName="inline-block h-[0.75em] w-auto"
                              />
                              <SarAmount
                                value={product.discount_price}
                                maximumFractionDigits={2}
                                className="text-xl font-black text-primary"
                                symbolClassName="inline-block h-[0.9em] w-auto"
                              />
                            </div>
                          ) : (
                            <SarAmount
                              value={product.price}
                              maximumFractionDigits={2}
                              className="text-xl font-black text-primary"
                              symbolClassName="inline-block h-[0.9em] w-auto"
                            />
                          )}

                          <button
                            type="button"
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2 group/btn"
                            onClick={(e) => {
                              e.preventDefault();
                              addProduct(
                                {
                                  ...product,
                                  quantity: 1,
                                  type: "product",
                                },
                                "increment",
                              );
                            }}
                          >
                            <RiShoppingBagLine
                              className="text-[18px]"
                              aria-hidden="true"
                            />
                            {t("actions.addToCartShort")}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })(),
              )}
            </div>

            <div className="mt-12 flex justify-center">
              <nav aria-label={tCommon("pagination")} className="flex gap-2">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t("pagination.previous")}
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <RiArrowRightSLine className="text-xl" aria-hidden="true" />
                </button>

                {visiblePages.map((p, idx) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-10 h-10 flex items-center justify-center text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={
                        p === currentPage
                          ? "w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
                          : "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-500 font-medium"
                      }
                      aria-current={p === currentPage ? "page" : undefined}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t("pagination.next")}
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <RiArrowLeftSLine className="text-xl" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];

  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(safeCurrent);
  pages.add(safeCurrent - 1);
  pages.add(safeCurrent + 1);

  const inRange = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];
  for (let i = 0; i < inRange.length; i++) {
    const page = inRange[i];
    const prev = inRange[i - 1];
    if (i > 0 && prev !== undefined && page - prev > 1) result.push("ellipsis");
    result.push(page);
  }

  return result;
}
