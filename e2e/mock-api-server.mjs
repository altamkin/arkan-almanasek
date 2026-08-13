import http from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 3099);
const BASE = "/api/v1";

const mockProduct = {
  id: 1,
  name: "مسبحة فاخرة",
  price: 150,
  discount_price: 120,
  image: "https://placehold.co/400x400/png",
  code: "MSB-001",
  description: "مسبحة عالية الجودة للحج والعمرة",
  details: "تفاصيل المنتج التجريبية للاختبارات",
  quantity: 25,
  available: true,
  category: "إكسسوارات",
  tag: null,
  images: ["https://placehold.co/400x400/png"],
  specifications: [
    {
      logo: "https://placehold.co/64x64/png",
      name: "الخامة",
      description: "خشب زيتون طبيعي",
    },
  ],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const mockProductsResponse = {
  products: [mockProduct],
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 1,
    per_page: 20,
  },
};

const mockCategories = [
  {
    id: 1,
    code: "accessories",
    name: "إكسسوارات",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const mockTags = {
  tags: [
    {
      id: 1,
      code: "featured",
      name: "مميز",
      color: "#d4af37",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const mockBadels = {
  on_behalves: [
    {
      id: 1,
      type: "OnBehalfHajj",
      kind: "hajj",
      name: "حج عن الغير",
      description: "أداء فريضة الحج نيابة عن الغير",
      price: 5000,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      type: "OnBehalfUmrah",
      kind: "umrah",
      name: "عمرة عن الغير",
      description: "أداء العمرة نيابة عن الغير",
      price: 2500,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const mockHadi = {
  hadi: [
    {
      id: 1,
      name: "أضحية",
      description: "ذبح وتوزيع الأضاحي",
      types: [
        {
          id: 101,
          name: "خروف",
          description: "خروف كامل",
          classefication: "sheep",
          price: 450,
          quantity: 100,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 102,
          name: "بقرة",
          description: "حصة من بقرة",
          classefication: "cow",
          price: 120,
          quantity: 50,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const mockPermits = {
  permits: [
    {
      id: 1,
      type: "PermitHajj",
      kind: "hajj",
      name: "تصريح الحج",
      description: "إصدار تصريح الحج الرسمي",
      price: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      type: "PermitUmrah",
      kind: "umrah",
      name: "تصريح العمرة",
      description: "إصدار تصريح العمرة الرسمي",
      price: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Accept-Language, locale",
  });
  res.end(payload);
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

function routeRequest(req, res) {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Accept-Language, locale",
    });
    res.end();
    return;
  }

  if (pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (!pathname.startsWith(BASE)) {
    notFound(res);
    return;
  }

  const apiPath = pathname.slice(BASE.length) || "/";

  if (req.method === "GET" && apiPath === "/products") {
    sendJson(res, 200, mockProductsResponse);
    return;
  }

  if (req.method === "GET" && /^\/products\/\d+$/.test(apiPath)) {
    sendJson(res, 200, mockProduct);
    return;
  }

  if (req.method === "GET" && apiPath === "/categories") {
    sendJson(res, 200, mockCategories);
    return;
  }

  if (req.method === "GET" && apiPath === "/tags") {
    sendJson(res, 200, mockTags);
    return;
  }

  if (req.method === "GET" && apiPath === "/on_behalf") {
    sendJson(res, 200, mockBadels);
    return;
  }

  if (req.method === "GET" && apiPath === "/on_behalf/get_request") {
    notFound(res);
    return;
  }

  if (req.method === "GET" && apiPath === "/hadi") {
    sendJson(res, 200, mockHadi);
    return;
  }

  if (req.method === "GET" && apiPath === "/hadi/get_request") {
    notFound(res);
    return;
  }

  if (req.method === "GET" && apiPath === "/permit") {
    sendJson(res, 200, mockPermits);
    return;
  }

  if (req.method === "GET" && apiPath === "/permit/get_request") {
    notFound(res);
    return;
  }

  if (req.method === "GET" && apiPath === "/requests/cart") {
    notFound(res);
    return;
  }

  if (req.method === "POST" && apiPath === "/carts/items") {
    sendJson(res, 200, { products: [mockProduct] });
    return;
  }

  if (
    req.method === "POST" &&
    (apiPath === "/requests/create" || apiPath === "/requests/update")
  ) {
    sendJson(res, 200, { token: "e2e-test-token" });
    return;
  }

  if (
    (req.method === "POST" || req.method === "PUT") &&
    apiPath.startsWith("/on_behalf")
  ) {
    sendJson(res, 200, { token: "e2e-badel-token" });
    return;
  }

  if (
    (req.method === "POST" || req.method === "PUT") &&
    apiPath.startsWith("/hadi")
  ) {
    sendJson(res, 200, { token: "e2e-hadi-token" });
    return;
  }

  if (
    (req.method === "POST" || req.method === "PUT") &&
    apiPath.startsWith("/permit")
  ) {
    sendJson(res, 200, { token: "e2e-permit-token" });
    return;
  }

  notFound(res);
}

const server = http.createServer((req, res) => {
  try {
    routeRequest(req, res);
  } catch (error) {
    console.error("[mock-api] request failed:", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-api] listening on http://127.0.0.1:${PORT}${BASE}`);
});
