import React, { useState, useEffect, useMemo, useRef } from "react";

// Compatibility fallback: the original AI file uses window.storage.
// This keeps it working in a normal browser by using localStorage.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key, parse = true) {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      try { return parse ? JSON.parse(value) : value; } catch { return value; }
    },
    async set(key, value) {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      return true;
    },
    async delete(key) {
      localStorage.removeItem(key);
      return true;
    }
  };
}
import {
  ShoppingBag, Search, Menu, X, Star, Plus, Minus, Trash2, ChevronRight,
  ChevronLeft, Instagram, Facebook, Music2, Phone, Mail, MapPin, Check,
  Pencil, Package, Users, SlidersHorizontal, ArrowRight, ArrowLeft,
  LayoutGrid, ClipboardList, Store, Truck, ShieldCheck, RotateCcw, Plus as PlusIcon
} from "lucide-react";

/* =========================================================================
   EDITABLE STORE CONFIG
   ---------------------------------------------------------------------
   Everything a store owner needs to change lives here. Update these
   values (or use the Admin → Settings tab at runtime) and the whole
   site updates. Nothing else in this file needs to be touched to
   rebrand the store.
   ========================================================================= */
const DEFAULT_SETTINGS = {
  brandName: "LUME",                                   // <- your brand name
  tagline: "Timeless Style. Everyday Elegance.",
  logoInitial: "L",                                     // shown in the badge mark
  phone: "+92 300 1234567",                              // <- your phone
  whatsapp: "+92 300 1234567",                           // <- your WhatsApp number
  email: "hello@lume-store.com",                         // <- your email
  instagram: "instagram.com/lume.store",                 // <- your Instagram
  facebook: "facebook.com/lume.store",                   // <- your Facebook
  tiktok: "tiktok.com/@lume.store",                       // <- your TikTok
  address: "Shop 14, Liberty Market, Gulberg, Lahore, Pakistan",
  deliveryCharge: 250,                                    // flat delivery charge in PKR
  freeDeliveryOver: 15000,                                // free delivery threshold in PKR
  currency: "Rs.",
  returnPolicy: "Easy 7-day returns on unworn items in original packaging. Exchanges are free; refunds are processed within 5–7 business days after inspection.",
  paymentMethods: ["Cash on Delivery", "Bank Transfer", "JazzCash / EasyPaisa"],
};

/* =========================================================================
   SAMPLE PRODUCT DATA
   ---------------------------------------------------------------------
   Replace with your real catalog, or manage it live from the Admin tab.
   Structure is kept flat and simple so it can later be swapped for a
   real API / Firebase / Supabase / MongoDB response with no UI changes
   — see the `catalogAPI` shim near the bottom of the CONFIG section.
   ========================================================================= */
const SAMPLE_WATCHES = [
  { id: "w1", name: "Meridian Chrono", type: "watch", category: "Men's", style: "Luxury", price: 24500, originalPrice: 32000, description: "A steel chronograph with a sunburst dial, built for the boardroom and beyond.", images: ["https://picsum.photos/seed/lume-w1a/900/1100", "https://picsum.photos/seed/lume-w1b/900/1100", "https://picsum.photos/seed/lume-w1c/900/1100"], colors: ["Silver", "Gunmetal"], sizes: ["40mm", "42mm"], rating: 4.8, reviews: 126, featured: true, bestseller: true, newArrival: false, stock: 14 },
  { id: "w2", name: "Aria Minimal", type: "watch", category: "Women's", style: "Casual", price: 14900, originalPrice: 14900, description: "A slim, understated dress watch with a mother-of-pearl face.", images: ["https://picsum.photos/seed/lume-w2a/900/1100", "https://picsum.photos/seed/lume-w2b/900/1100"], colors: ["Rose Gold", "Silver"], sizes: ["32mm"], rating: 4.6, reviews: 84, featured: true, bestseller: false, newArrival: true, stock: 20 },
  { id: "w3", name: "Voyager Field", type: "watch", category: "Men's", style: "Sports", price: 18900, originalPrice: 21500, description: "Shock-resistant field watch built for travel, hiking and everyday wear.", images: ["https://picsum.photos/seed/lume-w3a/900/1100", "https://picsum.photos/seed/lume-w3b/900/1100"], colors: ["Olive", "Black"], sizes: ["44mm"], rating: 4.7, reviews: 61, featured: false, bestseller: true, newArrival: false, stock: 9 },
  { id: "w4", name: "Solstice Gold", type: "watch", category: "Unisex", style: "Luxury", price: 38500, originalPrice: 38500, description: "A statement piece in warm gold-tone stainless steel with a link bracelet.", images: ["https://picsum.photos/seed/lume-w4a/900/1100", "https://picsum.photos/seed/lume-w4b/900/1100"], colors: ["Gold"], sizes: ["38mm", "41mm"], rating: 4.9, reviews: 203, featured: true, bestseller: true, newArrival: false, stock: 6 },
  { id: "w5", name: "Nocturne Black", type: "watch", category: "Men's", style: "Casual", price: 16500, originalPrice: 19900, description: "Matte black IP-coated case with a smoked sapphire-style crystal.", images: ["https://picsum.photos/seed/lume-w5a/900/1100", "https://picsum.photos/seed/lume-w5b/900/1100"], colors: ["Black"], sizes: ["42mm"], rating: 4.5, reviews: 47, featured: false, bestseller: false, newArrival: true, stock: 17 },
  { id: "w6", name: "Petal Rose", type: "watch", category: "Women's", style: "Casual", price: 12900, originalPrice: 12900, description: "A soft rose-gold case paired with a genuine leather strap.", images: ["https://picsum.photos/seed/lume-w6a/900/1100", "https://picsum.photos/seed/lume-w6b/900/1100"], colors: ["Rose Gold", "Tan"], sizes: ["34mm"], rating: 4.4, reviews: 38, featured: false, bestseller: false, newArrival: true, stock: 22 },
  { id: "w7", name: "Regatta Diver", type: "watch", category: "Men's", style: "Sports", price: 27900, originalPrice: 31900, description: "200m water resistant diver with a unidirectional rotating bezel.", images: ["https://picsum.photos/seed/lume-w7a/900/1100", "https://picsum.photos/seed/lume-w7b/900/1100"], colors: ["Blue", "Black"], sizes: ["43mm"], rating: 4.8, reviews: 152, featured: true, bestseller: false, newArrival: false, stock: 11 },
  { id: "w8", name: "Halcyon Unisex", type: "watch", category: "Unisex", style: "Luxury", price: 21900, originalPrice: 21900, description: "A balanced 39mm case designed to sit comfortably on any wrist.", images: ["https://picsum.photos/seed/lume-w8a/900/1100", "https://picsum.photos/seed/lume-w8b/900/1100"], colors: ["Silver", "Gold"], sizes: ["39mm"], rating: 4.6, reviews: 29, featured: false, bestseller: true, newArrival: false, stock: 15 },
];

const SAMPLE_BRACELETS = [
  { id: "b1", name: "Cuban Link Steel", type: "bracelet", category: "Men's", style: "Chain", price: 6900, originalPrice: 8900, description: "A heavyweight Cuban link chain in brushed stainless steel.", images: ["https://picsum.photos/seed/lume-b1a/900/1100", "https://picsum.photos/seed/lume-b1b/900/1100"], colors: ["Silver", "Gold"], sizes: ["7.5in", "8.5in"], rating: 4.7, reviews: 96, featured: true, bestseller: true, newArrival: false, stock: 25 },
  { id: "b2", name: "Woven Leather Wrap", type: "bracelet", category: "Men's", style: "Leather", price: 3200, originalPrice: 3200, description: "Hand-woven leather wrap bracelet with a magnetic clasp.", images: ["https://picsum.photos/seed/lume-b2a/900/1100", "https://picsum.photos/seed/lume-b2b/900/1100"], colors: ["Brown", "Black"], sizes: ["One Size"], rating: 4.5, reviews: 41, featured: false, bestseller: false, newArrival: true, stock: 30 },
  { id: "b3", name: "Pearl Beaded Strand", type: "bracelet", category: "Women's", style: "Beaded", price: 2800, originalPrice: 3600, description: "Freshwater pearls hand-strung on elastic cord.", images: ["https://picsum.photos/seed/lume-b3a/900/1100", "https://picsum.photos/seed/lume-b3b/900/1100"], colors: ["White", "Ivory"], sizes: ["One Size"], rating: 4.6, reviews: 58, featured: true, bestseller: false, newArrival: false, stock: 40 },
  { id: "b4", name: "Friendship Duo Set", type: "bracelet", category: "Couple", style: "Friendship", price: 1900, originalPrice: 1900, description: "A matching pair of adjustable cord bracelets for two.", images: ["https://picsum.photos/seed/lume-b4a/900/1100", "https://picsum.photos/seed/lume-b4b/900/1100"], colors: ["Black/Gold", "Red/Silver"], sizes: ["One Size"], rating: 4.8, reviews: 112, featured: true, bestseller: true, newArrival: true, stock: 50 },
  { id: "b5", name: "Gold Bangle Trio", type: "bracelet", category: "Women's", style: "Chain", price: 5400, originalPrice: 6200, description: "Three stacking bangles in a warm gold finish.", images: ["https://picsum.photos/seed/lume-b5a/900/1100", "https://picsum.photos/seed/lume-b5b/900/1100"], colors: ["Gold"], sizes: ["S", "M", "L"], rating: 4.4, reviews: 33, featured: false, bestseller: false, newArrival: false, stock: 18 },
  { id: "b6", name: "Onyx Bead Stack", type: "bracelet", category: "Unisex", style: "Beaded", price: 2400, originalPrice: 2400, description: "Matte onyx beads with a brushed steel accent bead.", images: ["https://picsum.photos/seed/lume-b6a/900/1100", "https://picsum.photos/seed/lume-b6b/900/1100"], colors: ["Black"], sizes: ["S", "M", "L"], rating: 4.7, reviews: 71, featured: false, bestseller: true, newArrival: false, stock: 27 },
  { id: "b7", name: "Braided Cord Classic", type: "bracelet", category: "Men's", style: "Friendship", price: 1500, originalPrice: 1900, description: "A simple braided cord bracelet with an anchor clasp.", images: ["https://picsum.photos/seed/lume-b7a/900/1100", "https://picsum.photos/seed/lume-b7b/900/1100"], colors: ["Navy", "Khaki"], sizes: ["One Size"], rating: 4.3, reviews: 22, featured: false, bestseller: false, newArrival: true, stock: 35 },
  { id: "b8", name: "Slim Leather Band", type: "bracelet", category: "Unisex", style: "Leather", price: 2100, originalPrice: 2100, description: "A slim, minimal leather band that layers well with watches.", images: ["https://picsum.photos/seed/lume-b8a/900/1100", "https://picsum.photos/seed/lume-b8b/900/1100"], colors: ["Black", "Brown", "Tan"], sizes: ["One Size"], rating: 4.5, reviews: 19, featured: true, bestseller: false, newArrival: true, stock: 44 },
];

const REVIEWS = [
  { name: "Ayesha K.", text: "The Meridian Chrono looks even better in person. Packaging felt genuinely premium.", rating: 5 },
  { name: "Hamza R.", text: "Fast delivery to Lahore and the bracelet quality is way above the price point.", rating: 5 },
  { name: "Sana M.", text: "Exchanged my size with zero hassle. Will be ordering gifts from here again.", rating: 4 },
];

/* Storage keys */
const K_CART = "lume:cart";
const K_CATALOG = "lume:catalog";
const K_ORDERS = "lume:orders";
const K_SETTINGS = "lume:settings";

/* ---------- small utils ---------- */
const money = (n, settings) => `${settings.currency} ${Number(n || 0).toLocaleString("en-PK")}`;
const uid = (p = "") => p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

function StarRow({ rating, size = 14 }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= full ? "fill-[#C6A15B] text-[#C6A15B]" : "text-[#3A3A3A]"} />
      ))}
    </div>
  );
}

function Badge({ children, tone = "dark" }) {
  const tones = {
    dark: "bg-[#1C1C1C] text-[#F5F1E8]",
    gold: "bg-[#C6A15B] text-[#0D0D0D]",
    outline: "border border-[#F5F1E8]/20 text-[#F5F1E8]",
  };
  return <span className={`inline-block px-2.5 py-1 text-[11px] tracking-wide ${tones[tone]}`}>{children}</span>;
}

/* =========================================================================
   APP
   ========================================================================= */
export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [products, setProducts] = useState([...SAMPLE_WATCHES, ...SAMPLE_BRACELETS]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]); // {productId, qty, color, size}
  const [page, setPage] = useState({ name: "home" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  /* ---- load persisted state once ---- */
  useEffect(() => {
    (async () => {
      try {
        const c = await window.storage.get(K_CART, false);
        if (c && c.value) setCart(JSON.parse(c.value));
      } catch (e) {}
      try {
        const cat = await window.storage.get(K_CATALOG, true);
        if (cat && cat.value) setProducts(JSON.parse(cat.value));
        else await window.storage.set(K_CATALOG, JSON.stringify([...SAMPLE_WATCHES, ...SAMPLE_BRACELETS]), true);
      } catch (e) {}
      try {
        const o = await window.storage.get(K_ORDERS, true);
        if (o && o.value) setOrders(JSON.parse(o.value));
      } catch (e) {}
      try {
        const s = await window.storage.get(K_SETTINGS, true);
        if (s && s.value) setSettings(JSON.parse(s.value));
        else await window.storage.set(K_SETTINGS, JSON.stringify(DEFAULT_SETTINGS), true);
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) window.storage.set(K_CART, JSON.stringify(cart), false).catch(() => {}); }, [cart, ready]);
  useEffect(() => { if (ready) window.storage.set(K_CATALOG, JSON.stringify(products), true).catch(() => {}); }, [products, ready]);
  useEffect(() => { if (ready) window.storage.set(K_ORDERS, JSON.stringify(orders), true).catch(() => {}); }, [orders, ready]);
  useEffect(() => { if (ready) window.storage.set(K_SETTINGS, JSON.stringify(settings), true).catch(() => {}); }, [settings, ready]);

  const go = (name, params = {}) => { setPage({ name, ...params }); setMenuOpen(false); setSearchOpen(false); window.scrollTo(0, 0); };

  /* ---- cart actions ---- */
  const addToCart = (product, opts = {}) => {
    const color = opts.color || product.colors[0];
    const size = opts.size || product.sizes[0];
    const qty = opts.qty || 1;
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.productId === product.id && l.color === color && l.size === size);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productId: product.id, color, size, qty }];
    });
    showToast(`Added ${product.name} to bag`);
  };
  const updateQty = (i, delta) => setCart((prev) => prev.map((l, idx) => (idx === i ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));
  const removeLine = (i) => setCart((prev) => prev.filter((_, idx) => idx !== i));

  const cartLines = useMemo(() => cart.map((l) => ({ ...l, product: products.find((p) => p.id === l.productId) })).filter((l) => l.product), [cart, products]);
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const deliveryFee = subtotal === 0 || subtotal >= settings.freeDeliveryOver ? 0 : settings.deliveryCharge;
  const total = subtotal + deliveryFee;

  /* ---- product admin actions ---- */
  const upsertProduct = (p) => setProducts((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
  const deleteProduct = (id) => { setProducts((prev) => prev.filter((p) => p.id !== id)); setCart((prev) => prev.filter((l) => l.productId !== id)); };

  const placeOrder = (customer) => {
    const order = {
      id: "LM" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      customer,
      lines: cartLines.map((l) => ({ productId: l.product.id, name: l.product.name, color: l.color, size: l.size, qty: l.qty, price: l.product.price })),
      subtotal, deliveryFee, total,
      payment: customer.payment,
      status: "Pending",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  };

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => [p.name, p.category, p.style, p.type].join(" ").toLowerCase().includes(q)).slice(0, 8);
  }, [query, products]);

  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "'Inter', sans-serif", background: "#0D0D0D", color: "#F5F1E8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #C6A15B; color: #0D0D0D; }
        .hairline { border-color: rgba(245,241,232,0.12); }
        input, select, textarea { background: #171717; color: #F5F1E8; border-color: rgba(245,241,232,0.12); }
        input::placeholder, textarea::placeholder { color: #6f6b62; }
        input[type="checkbox"], input[type="radio"] { accent-color: #C6A15B; }
        select option { background: #171717; color: #F5F1E8; }
        input:focus, select:focus, textarea:focus, button:focus-visible { outline: 2px solid #C6A15B; outline-offset: 2px; }
        .prod-img { transition: transform 0.6s cubic-bezier(.2,.8,.2,1); }
        .prod-card:hover .prod-img { transform: scale(1.045); }
        @media (prefers-reduced-motion: reduce) { .prod-img { transition: none !important; } }
      `}</style>

      <Navbar settings={settings} page={page} go={go} cartCount={cartCount}
        menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        searchOpen={searchOpen} setSearchOpen={setSearchOpen}
        query={query} setQuery={setQuery} searchResults={searchResults} />

      <main>
        {page.name === "home" && <Home settings={settings} products={products} go={go} addToCart={addToCart} />}
        {page.name === "shop" && <ShopPage settings={settings} products={products} type={page.type} go={go} addToCart={addToCart} initialCategory={page.category} />}
        {page.name === "product" && <ProductDetails settings={settings} products={products} id={page.id} go={go} addToCart={addToCart} />}
        {page.name === "about" && <AboutPage settings={settings} />}
        {page.name === "contact" && <ContactPage settings={settings} showToast={showToast} />}
        {page.name === "cart" && <CartPage settings={settings} lines={cartLines} updateQty={updateQty} removeLine={removeLine} subtotal={subtotal} deliveryFee={deliveryFee} total={total} go={go} />}
        {page.name === "checkout" && <CheckoutPage settings={settings} lines={cartLines} subtotal={subtotal} deliveryFee={deliveryFee} total={total} go={go} placeOrder={placeOrder} />}
        {page.name === "confirmation" && <ConfirmationPage settings={settings} order={page.order} go={go} />}
        {page.name === "admin" && <AdminPage settings={settings} setSettings={setSettings} products={products} upsertProduct={upsertProduct} deleteProduct={deleteProduct} orders={orders} setOrders={setOrders} go={go} />}
      </main>

      <Footer settings={settings} go={go} />

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-[#1C1C1C] text-[#F5F1E8] border border-[#C6A15B]/20 px-5 py-3 text-sm flex items-center gap-2 shadow-lg">
          <Check size={16} className="text-[#C6A15B]" /> {toast}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   NAVBAR
   ========================================================================= */
function Navbar({ settings, page, go, cartCount, menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, searchResults }) {
  const links = [
    { label: "Home", action: () => go("home") },
    { label: "Watches", action: () => go("shop", { type: "watch" }) },
    { label: "Bracelets", action: () => go("shop", { type: "bracelet" }) },
    { label: "About", action: () => go("about") },
    { label: "Contact", action: () => go("contact") },
  ];
  return (
    <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur border-b hairline">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={() => go("home")} className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-[#0D0D0D] flex items-center justify-center font-display text-sm">{settings.logoInitial}</span>
          <span className="font-display text-lg tracking-tight text-[#C6A15B]">{settings.brandName}</span>
        </button>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
          {links.map((l) => (
            <button key={l.label} onClick={l.action} className="hover:text-[#D8B978] transition-colors">{l.label}</button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button aria-label="Search" onClick={() => setSearchOpen((s) => !s)} className="p-2 hover:text-[#D8B978]"><Search size={19} /></button>
            {searchOpen && (
              <div className="absolute right-0 mt-2 w-[300px] bg-[#171717] border hairline shadow-xl p-3">
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search watches, bracelets…" className="w-full border-b hairline pb-2 text-sm outline-none bg-transparent" />
                <div className="mt-2 max-h-72 overflow-auto">
                  {query && searchResults.length === 0 && <p className="text-xs text-[#A9A49A] py-3">No products match "{query}".</p>}
                  {searchResults.map((p) => (
                    <button key={p.id} onClick={() => go("product", { id: p.id })} className="w-full flex items-center gap-3 py-2 text-left hover:bg-[#171717]">
                      <img src={p.images[0]} alt="" className="w-10 h-10 object-cover" />
                      <span className="text-sm">{p.name}<span className="block text-[11px] text-[#A9A49A]">{p.category} · {p.type === "watch" ? "Watch" : "Bracelet"}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button aria-label="Cart" onClick={() => go("cart")} className="p-2 relative hover:text-[#D8B978]">
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#C6A15B] text-[#0D0D0D] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
          <button aria-label="Menu" onClick={() => setMenuOpen((s) => !s)} className="p-2 md:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t hairline px-5 py-3 flex flex-col gap-3 text-sm">
          {links.map((l) => <button key={l.label} onClick={l.action} className="text-left py-1">{l.label}</button>)}
          <button onClick={() => go("admin")} className="text-left py-1 text-[#A9A49A]">Admin</button>
        </div>
      )}
    </header>
  );
}

/* =========================================================================
   PRODUCT CARD
   ========================================================================= */
function ProductCard({ product, settings, go, addToCart }) {
  const onSale = product.originalPrice > product.price;
  return (
    <div className="prod-card group">
      <button onClick={() => go("product", { id: product.id })} className="block w-full text-left">
        <div className="relative overflow-hidden bg-[#1C1C1C] aspect-[4/5]">
          <img src={product.images[0]} alt={product.name} className="prod-img w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.newArrival && <Badge tone="dark">New</Badge>}
            {onSale && <Badge tone="gold">-{Math.round(100 - (product.price / product.originalPrice) * 100)}%</Badge>}
          </div>
        </div>
      </button>
      <div className="pt-3">
        <button onClick={() => go("product", { id: product.id })} className="text-left w-full">
          <h3 className="font-display text-[17px] leading-tight">{product.name}</h3>
        </button>
        <p className="text-[13px] text-[#A9A49A] mt-0.5 line-clamp-1">{product.category} · {product.style}</p>
        <div className="mt-1.5"><StarRow rating={product.rating} /></div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-medium">{money(product.price, settings)}</span>
          {onSale && <span className="text-[13px] text-[#A9A49A] line-through">{money(product.originalPrice, settings)}</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => go("product", { id: product.id })} className="flex-1 border border-[#C6A15B] text-[12px] tracking-wide py-2 hover:bg-[#C6A15B] hover:text-[#0D0D0D] transition-colors">View Details</button>
          <button onClick={() => addToCart(product)} className="flex-1 bg-[#C6A15B] text-[#0D0D0D] text-[12px] tracking-wide py-2 hover:bg-[#D8B978] transition-colors">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   HOME PAGE
   ========================================================================= */
function Home({ settings, products, go, addToCart }) {
  const watches = products.filter((p) => p.type === "watch");
  const bracelets = products.filter((p) => p.type === "bracelet");
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-12 grid md:grid-cols-2 gap-8 md:gap-4 items-center">
        <div className="order-2 md:order-1">
          <p className="text-[13px] tracking-wide text-[#C6A15B] mb-4">{settings.brandName} — Watches &amp; Bracelets</p>
          <h1 className="font-display text-[40px] sm:text-[52px] leading-[1.05] mb-5">{settings.tagline}</h1>
          <p className="text-[#A9A49A] max-w-md mb-8 leading-relaxed">Considered pieces for the wrist — steel and gold-tone watches paired with hand-finished bracelets, designed to be worn every day and kept for years.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => go("shop", { type: "watch" })} className="bg-[#C6A15B] text-[#0D0D0D] px-6 py-3.5 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Shop Watches</button>
            <button onClick={() => go("shop", { type: "bracelet" })} className="border border-[#C6A15B] px-6 py-3.5 text-sm tracking-wide hover:bg-[#C6A15B] hover:text-[#0D0D0D] transition-colors">Shop Bracelets</button>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden">
            <img src="https://picsum.photos/seed/lume-hero/1000/1300" alt="Featured watch on a wrist" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <ProductRow title="Featured" products={featured} settings={settings} go={go} addToCart={addToCart} />
      <ProductRow title="Featured Watches" products={watches.filter((w) => w.featured)} settings={settings} go={go} addToCart={addToCart} />
      <ProductRow title="Featured Bracelets" products={bracelets.filter((b) => b.featured)} settings={settings} go={go} addToCart={addToCart} />
      <ProductRow title="New Arrivals" products={newArrivals} settings={settings} go={go} addToCart={addToCart} />
      <ProductRow title="Best Sellers" products={bestsellers} settings={settings} go={go} addToCart={addToCart} />

      {/* WHY CHOOSE US */}
      <section className="bg-[#171717] text-[#F5F1E8] py-16 mt-6">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid sm:grid-cols-3 gap-10">
          {[
            { icon: ShieldCheck, title: "12-Month Warranty", body: "Every watch and bracelet is covered against manufacturing defects." },
            { icon: Truck, title: "Nationwide Delivery", body: `Delivered across Pakistan, free over ${money(settings.freeDeliveryOver, settings)}.` },
            { icon: RotateCcw, title: "Easy Returns", body: "7-day return window if something isn't right." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon size={26} className="text-[#C6A15B] mb-4" />
              <h3 className="font-display text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[#A9A49A] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <h2 className="font-display text-3xl mb-8">What customers say</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="border hairline p-5">
              <StarRow rating={r.rating} />
              <p className="text-sm mt-3 leading-relaxed text-[#A9A49A]">"{r.text}"</p>
              <p className="text-[13px] mt-4 text-[#A9A49A]">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#1C1C1C] py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-display text-3xl mb-3">Join the list</h2>
          <p className="text-[#A9A49A] mb-6">New arrivals and early access to sales, roughly once a month.</p>
          {subscribed ? (
            <p className="text-[#C6A15B] font-medium">You're on the list — thank you.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex gap-2 max-w-md mx-auto">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 border border-[#C6A15B]/30 bg-[#171717] px-4 py-3 text-sm" />
              <button className="bg-[#C6A15B] text-[#0D0D0D] px-5 text-sm hover:bg-[#D8B978] transition-colors">Subscribe</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductRow({ title, products, settings, go, addToCart }) {
  if (!products.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
        {products.map((p) => <ProductCard key={p.id} product={p} settings={settings} go={go} addToCart={addToCart} />)}
      </div>
    </section>
  );
}

/* =========================================================================
   SHOP (WATCHES / BRACELETS) PAGE
   ========================================================================= */
function ShopPage({ settings, products, type, go, addToCart, initialCategory }) {
  const base = products.filter((p) => p.type === type);
  const isWatch = type === "watch";
  const categories = isWatch ? ["Men's", "Women's", "Unisex"] : ["Men's", "Women's", "Unisex", "Couple"];
  const styles = isWatch ? ["Casual", "Luxury", "Sports"] : ["Chain", "Leather", "Beaded", "Friendship"];

  const [category, setCategory] = useState(initialCategory || "All");
  const [style, setStyle] = useState("All");
  const [flag, setFlag] = useState("All"); // New Arrivals / Best Sellers
  const [sort, setSort] = useState("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  let list = base.filter((p) => (category === "All" || p.category === category) && (style === "All" || p.style === style));
  if (flag === "New Arrivals") list = list.filter((p) => p.newArrival);
  if (flag === "Best Sellers") list = list.filter((p) => p.bestseller);

  list = [...list].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "newest") return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
    return b.reviews - a.reviews; // popular
  });

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <p className="text-[13px] text-[#C6A15B] mb-1">{isWatch ? "Watches" : "Bracelets"}</p>
        <h1 className="font-display text-3xl md:text-4xl">{isWatch ? "The Watch Collection" : "The Bracelet Collection"}</h1>
      </div>

      <div className="flex items-center justify-between mb-5 md:hidden">
        <button onClick={() => setFiltersOpen((s) => !s)} className="flex items-center gap-2 border hairline px-4 py-2 text-sm"><SlidersHorizontal size={15} /> Filters</button>
        <span className="text-sm text-[#A9A49A]">{list.length} items</span>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block space-y-7`}>
          <FilterGroup label="Category" options={["All", ...categories]} value={category} onChange={setCategory} />
          <FilterGroup label="Style" options={["All", ...styles]} value={style} onChange={setStyle} />
          <FilterGroup label="Collection" options={["All", "New Arrivals", "Best Sellers"]} value={flag} onChange={setFlag} />
        </aside>

        <div>
          <div className="hidden md:flex items-center justify-between mb-5">
            <span className="text-sm text-[#A9A49A]">{list.length} items</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border hairline px-3 py-2 text-sm bg-[#171717]">
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          <div className="md:hidden mb-5">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border hairline px-3 py-2 text-sm bg-[#171717] w-full">
              <option value="popular">Sort: Popular</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price Low to High</option>
              <option value="price-desc">Sort: Price High to Low</option>
            </select>
          </div>

          {list.length === 0 ? (
            <p className="text-[#A9A49A] py-16 text-center">No products match these filters yet.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {list.map((p) => <ProductCard key={p.id} product={p} settings={settings} go={go} addToCart={addToCart} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <h4 className="text-[12px] tracking-wide text-[#A9A49A] mb-2">{label}</h4>
      <div className="flex flex-col gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`text-left text-sm py-0.5 ${value === o ? "text-[#C6A15B] font-medium" : "text-[#F5F1E8] hover:text-[#D8B978]"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   PRODUCT DETAILS PAGE
   ========================================================================= */
function ProductDetails({ settings, products, id, go, addToCart }) {
  const product = products.find((p) => p.id === id);
  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState(product?.colors[0]);
  const [size, setSize] = useState(product?.sizes[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");

  useEffect(() => { if (product) { setColor(product.colors[0]); setSize(product.sizes[0]); setImgIdx(0); setQty(1); } }, [id]);

  if (!product) return <div className="max-w-3xl mx-auto px-5 py-20 text-center"><p>This product is no longer available.</p><button onClick={() => go("home")} className="mt-4 underline">Back to home</button></div>;

  const related = products.filter((p) => p.type === product.type && p.id !== product.id).slice(0, 4);
  const onSale = product.originalPrice > product.price;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <button onClick={() => go("shop", { type: product.type })} className="flex items-center gap-1 text-sm text-[#A9A49A] hover:text-[#F5F1E8] mb-6"><ArrowLeft size={14} /> Back to {product.type === "watch" ? "Watches" : "Bracelets"}</button>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-[#1C1C1C] overflow-hidden mb-3">
            <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 overflow-hidden border ${i === imgIdx ? "border-[#C6A15B]" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[13px] text-[#C6A15B] mb-1">{product.category} · {product.style}</p>
          <h1 className="font-display text-3xl mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-3"><StarRow rating={product.rating} /> <span className="text-[13px] text-[#A9A49A]">{product.rating} ({product.reviews} reviews)</span></div>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-medium">{money(product.price, settings)}</span>
            {onSale && <><span className="text-[#A9A49A] line-through">{money(product.originalPrice, settings)}</span><Badge tone="gold">-{Math.round(100 - (product.price / product.originalPrice) * 100)}%</Badge></>}
          </div>
          <p className="text-[#A9A49A] leading-relaxed mb-6">{product.description}</p>

          <div className="mb-5">
            <h4 className="text-[12px] tracking-wide text-[#A9A49A] mb-2">Color: <span className="text-[#F5F1E8]">{color}</span></h4>
            <div className="flex gap-2">{product.colors.map((c) => <button key={c} onClick={() => setColor(c)} className={`px-3 py-1.5 border text-sm ${c === color ? "border-[#C6A15B] bg-[#C6A15B] text-[#0D0D0D]" : "hairline"}`}>{c}</button>)}</div>
          </div>
          <div className="mb-6">
            <h4 className="text-[12px] tracking-wide text-[#A9A49A] mb-2">Size: <span className="text-[#F5F1E8]">{size}</span></h4>
            <div className="flex gap-2">{product.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 border text-sm ${s === size ? "border-[#C6A15B] bg-[#C6A15B] text-[#0D0D0D]" : "hairline"}`}>{s}</button>)}</div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border hairline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5"><Minus size={14} /></button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-2.5"><Plus size={14} /></button>
            </div>
            <span className="text-[13px] text-[#A9A49A]">{product.stock} in stock</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={() => addToCart(product, { color, size, qty })} className="flex-1 border border-[#C6A15B] py-3.5 text-sm tracking-wide hover:bg-[#C6A15B] hover:text-[#0D0D0D] transition-colors">Add to Cart</button>
            <button onClick={() => { addToCart(product, { color, size, qty }); go("checkout"); }} className="flex-1 bg-[#C6A15B] text-[#0D0D0D] py-3.5 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Buy Now</button>
          </div>

          <div className="border-t hairline">
            {[
              { key: "description", label: "Specifications" },
              { key: "delivery", label: "Delivery Information" },
              { key: "returns", label: "Return Policy" },
            ].map((t) => (
              <div key={t.key} className="border-b hairline">
                <button onClick={() => setTab(tab === t.key ? "" : t.key)} className="w-full flex items-center justify-between py-3 text-sm font-medium">
                  {t.label} <span>{tab === t.key ? "−" : "+"}</span>
                </button>
                {tab === t.key && (
                  <div className="pb-4 text-sm text-[#A9A49A] leading-relaxed">
                    {t.key === "description" && <ul className="space-y-1"><li>Category: {product.category}</li><li>Style: {product.style}</li><li>Available colors: {product.colors.join(", ")}</li><li>Available sizes: {product.sizes.join(", ")}</li></ul>}
                    {t.key === "delivery" && <p>Delivered in 2–5 business days nationwide. Delivery fee {money(settings.deliveryCharge, settings)}, free over {money(settings.freeDeliveryOver, settings)}.</p>}
                    {t.key === "returns" && <p>{settings.returnPolicy}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && <ProductRow title="You may also like" products={related} settings={settings} go={go} addToCart={addToCart} />}
    </div>
  );
}

/* =========================================================================
   ABOUT / CONTACT
   ========================================================================= */
function AboutPage({ settings }) {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <p className="text-[13px] text-[#C6A15B] mb-2">About Us</p>
      <h1 className="font-display text-4xl mb-6">The story behind {settings.brandName}</h1>
      <div className="space-y-4 text-[#A9A49A] leading-relaxed">
        <p>{settings.brandName} started with a simple idea: everyday accessories — a watch, a bracelet — should feel considered without being precious. We design pieces that hold up to daily wear and look right whether you're at a desk or at dinner.</p>
        <p>Every watch and bracelet in the collection is selected for its materials and finishing, then priced fairly for the Pakistani market, with delivery to your door and a straightforward returns policy if it isn't right.</p>
        <p>We're a small team, and every order is packed by hand at our studio in {settings.address.split(",").slice(-2).join(",").trim()}.</p>
      </div>
    </div>
  );
}

function ContactPage({ settings, showToast }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <p className="text-[13px] text-[#C6A15B] mb-2">Contact Us</p>
        <h1 className="font-display text-4xl mb-6">Get in touch</h1>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3"><Phone size={16} className="text-[#C6A15B]" /> {settings.phone}</div>
          <div className="flex items-center gap-3"><Mail size={16} className="text-[#C6A15B]" /> {settings.email}</div>
          <div className="flex items-center gap-3"><MapPin size={16} className="text-[#C6A15B]" /> {settings.address}</div>
        </div>
        <div className="flex gap-3 mt-6">
          <span className="p-2.5 border hairline"><Instagram size={17} /></span>
          <span className="p-2.5 border hairline"><Facebook size={17} /></span>
          <span className="p-2.5 border hairline"><Music2 size={17} /></span>
        </div>
      </div>
      <div>
        {sent ? (
          <div className="border hairline p-6"><Check className="text-[#C6A15B] mb-2" /> <p>Thanks — we'll reply within one business day.</p></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); showToast("Message sent"); }} className="space-y-4">
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border hairline px-4 py-3 text-sm" />
            <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border hairline px-4 py-3 text-sm" />
            <textarea required placeholder="Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border hairline px-4 py-3 text-sm" />
            <button className="bg-[#C6A15B] text-[#0D0D0D] px-6 py-3 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   CART PAGE
   ========================================================================= */
function CartPage({ settings, lines, updateQty, removeLine, subtotal, deliveryFee, total, go }) {
  if (lines.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 text-[#A9A49A]" size={36} />
        <h1 className="font-display text-2xl mb-2">Your bag is empty</h1>
        <p className="text-[#A9A49A] mb-6">Nothing here yet — browse the collection to find something.</p>
        <button onClick={() => go("home")} className="bg-[#C6A15B] text-[#0D0D0D] px-6 py-3 text-sm">Continue Shopping</button>
      </div>
    );
  }
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Your Bag</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="divide-y hairline">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-4 py-5">
              <img src={l.product.images[0]} alt="" className="w-24 h-24 object-cover bg-[#1C1C1C] shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-display text-lg">{l.product.name}</h3>
                  <button onClick={() => removeLine(i)} className="text-[#A9A49A] hover:text-[#F5F1E8]"><Trash2 size={16} /></button>
                </div>
                <p className="text-[13px] text-[#A9A49A]">{l.color} · {l.size}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border hairline">
                    <button onClick={() => updateQty(i, -1)} className="p-2"><Minus size={13} /></button>
                    <span className="w-8 text-center text-sm">{l.qty}</span>
                    <button onClick={() => updateQty(i, 1)} className="p-2"><Plus size={13} /></button>
                  </div>
                  <span className="font-medium">{money(l.product.price * l.qty, settings)}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-5"><button onClick={() => go("home")} className="text-sm underline text-[#A9A49A]">Continue Shopping</button></div>
        </div>

        <div className="border hairline p-5 h-fit">
          <h3 className="font-display text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#A9A49A]">Subtotal</span><span>{money(subtotal, settings)}</span></div>
            <div className="flex justify-between"><span className="text-[#A9A49A]">Delivery</span><span>{deliveryFee === 0 ? "Free" : money(deliveryFee, settings)}</span></div>
            <div className="flex justify-between font-medium text-base pt-2 border-t hairline"><span>Total</span><span>{money(total, settings)}</span></div>
          </div>
          <button onClick={() => go("checkout")} className="w-full bg-[#C6A15B] text-[#0D0D0D] py-3.5 mt-5 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   CHECKOUT PAGE
   ========================================================================= */
function CheckoutPage({ settings, lines, subtotal, deliveryFee, total, go, placeOrder }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", postal: "", payment: settings.paymentMethods[0] });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (lines.length === 0) {
    return <div className="max-w-xl mx-auto px-5 py-24 text-center"><p className="mb-4">Your bag is empty.</p><button onClick={() => go("home")} className="underline">Return to shop</button></div>;
  }

  const submit = (e) => {
    e.preventDefault();
    const order = placeOrder(form);
    go("confirmation", { order });
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="font-display text-3xl mb-8">Checkout</h1>
      <form onSubmit={submit} className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-[12px] tracking-wide text-[#A9A49A] mb-3">Contact &amp; Delivery</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Full name" value={form.name} onChange={set("name")} className="border hairline px-4 py-3 text-sm sm:col-span-2" />
              <input required placeholder="Phone number" value={form.phone} onChange={set("phone")} className="border hairline px-4 py-3 text-sm" />
              <input required type="email" placeholder="Email" value={form.email} onChange={set("email")} className="border hairline px-4 py-3 text-sm" />
              <input required placeholder="Complete address" value={form.address} onChange={set("address")} className="border hairline px-4 py-3 text-sm sm:col-span-2" />
              <input required placeholder="City" value={form.city} onChange={set("city")} className="border hairline px-4 py-3 text-sm" />
              <input required placeholder="Postal code" value={form.postal} onChange={set("postal")} className="border hairline px-4 py-3 text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-[12px] tracking-wide text-[#A9A49A] mb-3">Payment Method</h3>
            <div className="space-y-2">
              {settings.paymentMethods.map((m) => (
                <label key={m} className={`flex items-center gap-3 border px-4 py-3 text-sm cursor-pointer ${form.payment === m ? "border-[#C6A15B]" : "hairline"}`}>
                  <input type="radio" name="payment" checked={form.payment === m} onChange={() => setForm({ ...form, payment: m })} /> {m}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border hairline p-5 h-fit">
          <h3 className="font-display text-lg mb-4">Order Summary</h3>
          <div className="divide-y hairline mb-3 max-h-56 overflow-auto">
            {lines.map((l, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-[#A9A49A]">{l.product.name} × {l.qty}<span className="block text-[11px] text-[#A9A49A]">{l.color} · {l.size}</span></span>
                <span>{money(l.product.price * l.qty, settings)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t hairline pt-3">
            <div className="flex justify-between"><span className="text-[#A9A49A]">Subtotal</span><span>{money(subtotal, settings)}</span></div>
            <div className="flex justify-between"><span className="text-[#A9A49A]">Delivery</span><span>{deliveryFee === 0 ? "Free" : money(deliveryFee, settings)}</span></div>
            <div className="flex justify-between font-medium text-base pt-2 border-t hairline"><span>Total</span><span>{money(total, settings)}</span></div>
          </div>
          <button type="submit" className="w-full bg-[#C6A15B] text-[#0D0D0D] py-3.5 mt-5 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Place Order</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmationPage({ settings, order, go }) {
  if (!order) return <div className="max-w-xl mx-auto px-5 py-24 text-center"><button onClick={() => go("home")} className="underline">Return to shop</button></div>;
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-[#C6A15B] text-[#0D0D0D] flex items-center justify-center mx-auto mb-5"><Check size={26} /></div>
      <h1 className="font-display text-3xl mb-2">Order confirmed</h1>
      <p className="text-[#A9A49A] mb-6">Order #{order.id} · Paying via {order.payment}. A confirmation has been sent to {order.customer.email}.</p>
      <div className="border hairline p-5 text-left mb-8">
        {order.lines.map((l, i) => (
          <div key={i} className="flex justify-between text-sm py-1"><span>{l.name} × {l.qty}</span><span>{money(l.price * l.qty, settings)}</span></div>
        ))}
        <div className="flex justify-between font-medium pt-2 mt-2 border-t hairline"><span>Total</span><span>{money(order.total, settings)}</span></div>
      </div>
      <button onClick={() => go("home")} className="bg-[#C6A15B] text-[#0D0D0D] px-6 py-3 text-sm tracking-wide hover:bg-[#D8B978] transition-colors">Continue Shopping</button>
    </div>
  );
}

/* =========================================================================
   ADMIN DASHBOARD
   ========================================================================= */
function AdminPage({ settings, setSettings, products, upsertProduct, deleteProduct, orders, setOrders, go }) {
  const [tab, setTab] = useState("products");
  const tabs = [
    { key: "products", label: "Products", icon: Package },
    { key: "watches", label: "Watches", icon: Package },
    { key: "bracelets", label: "Bracelets", icon: Package },
    { key: "orders", label: "Orders", icon: ClipboardList },
    { key: "customers", label: "Customers", icon: Users },
    { key: "settings", label: "Settings", icon: Store },
  ];
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Admin Dashboard</h1>
        <button onClick={() => go("home")} className="text-sm underline text-[#A9A49A]">Back to store</button>
      </div>
      <div className="flex gap-1 border-b hairline mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm whitespace-nowrap flex items-center gap-1.5 border-b-2 -mb-px ${tab === t.key ? "border-[#C6A15B] font-medium" : "border-transparent text-[#A9A49A]"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {(tab === "products" || tab === "watches" || tab === "bracelets") && (
        <ProductAdminTable
          products={products.filter((p) => tab === "products" || p.type === (tab === "watches" ? "watch" : "bracelet"))}
          defaultType={tab === "bracelets" ? "bracelet" : "watch"}
          settings={settings} upsertProduct={upsertProduct} deleteProduct={deleteProduct}
        />
      )}
      {tab === "orders" && <OrdersAdminTable orders={orders} setOrders={setOrders} settings={settings} />}
      {tab === "customers" && <CustomersAdminTable orders={orders} />}
      {tab === "settings" && <SettingsAdmin settings={settings} setSettings={setSettings} />}
    </div>
  );
}

function emptyProduct(type) {
  return { id: uid("p"), name: "", type, category: "Men's", style: type === "watch" ? "Casual" : "Chain", price: 0, originalPrice: 0, description: "", images: ["https://picsum.photos/seed/" + uid() + "/900/1100"], colors: ["Black"], sizes: ["One Size"], rating: 4.5, reviews: 0, featured: false, bestseller: false, newArrival: true, stock: 10 };
}

function ProductAdminTable({ products, defaultType, settings, upsertProduct, deleteProduct }) {
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(emptyProduct(defaultType))} className="flex items-center gap-1.5 bg-[#C6A15B] text-[#0D0D0D] px-4 py-2.5 text-sm hover:bg-[#D8B978] transition-colors"><PlusIcon size={15} /> Add Product</button>
      </div>
      <div className="overflow-x-auto border hairline">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-[#1C1C1C] text-left">
            <tr>{["Image", "Name", "Type", "Category", "Price", "Stock", "Flags", ""].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y hairline">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2"><img src={p.images[0]} className="w-10 h-10 object-cover" alt="" /></td>
                <td className="px-3 py-2">{p.name || <em className="text-[#A9A49A]">Untitled</em>}</td>
                <td className="px-3 py-2 capitalize">{p.type}</td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2">{money(p.price, settings)}</td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2 space-x-1">
                  {p.featured && <Badge tone="outline">Featured</Badge>}{p.bestseller && <Badge tone="outline">Best</Badge>}{p.newArrival && <Badge tone="outline">New</Badge>}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="p-1.5 hover:text-[#D8B978]"><Pencil size={15} /></button>
                  <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }} className="p-1.5 hover:text-red-600"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-[#A9A49A]">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <ProductEditModal product={editing} onClose={() => setEditing(null)} onSave={(p) => { upsertProduct(p); setEditing(null); }} />}
    </div>
  );
}

function ProductEditModal({ product, onClose, onSave }) {
  const [f, setF] = useState({ ...product, colors: product.colors.join(", "), sizes: product.sizes.join(", "), images: product.images.join(", ") });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      price: Number(f.price) || 0,
      originalPrice: Number(f.originalPrice) || Number(f.price) || 0,
      stock: Number(f.stock) || 0,
      rating: Number(f.rating) || 4.5,
      reviews: Number(f.reviews) || 0,
      colors: f.colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      images: f.images.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-start md:items-center justify-center p-4 overflow-auto" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-[#171717] border border-[#F5F1E8]/10 w-full max-w-xl p-6 my-8 space-y-3">
        <div className="flex justify-between items-center mb-2"><h3 className="font-display text-xl">{product.name ? "Edit Product" : "Add Product"}</h3><button type="button" onClick={onClose}><X size={18} /></button></div>
        <input required placeholder="Product name" value={f.name} onChange={set("name")} className="w-full border hairline px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <select value={f.type} onChange={set("type")} className="border hairline px-3 py-2 text-sm bg-[#171717]"><option value="watch">Watch</option><option value="bracelet">Bracelet</option></select>
          <input placeholder="Category (e.g. Men's)" value={f.category} onChange={set("category")} className="border hairline px-3 py-2 text-sm" />
          <input placeholder="Style (e.g. Sports)" value={f.style} onChange={set("style")} className="border hairline px-3 py-2 text-sm" />
          <input placeholder="Stock" type="number" value={f.stock} onChange={set("stock")} className="border hairline px-3 py-2 text-sm" />
          <input placeholder="Price" type="number" value={f.price} onChange={set("price")} className="border hairline px-3 py-2 text-sm" />
          <input placeholder="Original price (for discount)" type="number" value={f.originalPrice} onChange={set("originalPrice")} className="border hairline px-3 py-2 text-sm" />
        </div>
        <textarea placeholder="Description" value={f.description} onChange={set("description")} rows={3} className="w-full border hairline px-3 py-2 text-sm" />
        <input placeholder="Image URLs, comma separated" value={f.images} onChange={set("images")} className="w-full border hairline px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Colors, comma separated" value={f.colors} onChange={set("colors")} className="border hairline px-3 py-2 text-sm" />
          <input placeholder="Sizes, comma separated" value={f.sizes} onChange={set("sizes")} className="border hairline px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-4 text-sm pt-1">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={f.featured} onChange={set("featured")} /> Featured</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={f.bestseller} onChange={set("bestseller")} /> Best Seller</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={f.newArrival} onChange={set("newArrival")} /> New Arrival</label>
        </div>
        <div className="flex gap-3 pt-3">
          <button type="button" onClick={onClose} className="flex-1 border hairline py-2.5 text-sm">Cancel</button>
          <button type="submit" className="flex-1 bg-[#C6A15B] text-[#0D0D0D] py-2.5 text-sm hover:bg-[#D8B978] transition-colors">Save Product</button>
        </div>
      </form>
    </div>
  );
}

function OrdersAdminTable({ orders, setOrders, settings }) {
  const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  const updateStatus = (id, status) => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-[#1C1C1C] text-left"><tr>{["Order", "Customer", "Items", "Total", "Payment", "Status"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y hairline">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-3 py-2 whitespace-nowrap">#{o.id}<span className="block text-[11px] text-[#A9A49A]">{new Date(o.date).toLocaleDateString()}</span></td>
              <td className="px-3 py-2">{o.customer.name}<span className="block text-[11px] text-[#A9A49A]">{o.customer.phone}</span></td>
              <td className="px-3 py-2">{o.lines.reduce((s, l) => s + l.qty, 0)} items</td>
              <td className="px-3 py-2">{money(o.total, settings)}</td>
              <td className="px-3 py-2">{o.payment}</td>
              <td className="px-3 py-2">
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="border hairline px-2 py-1 text-sm bg-[#171717]">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-[#A9A49A]">No orders placed yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function CustomersAdminTable({ orders }) {
  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.customer.email;
      if (!map.has(key)) map.set(key, { ...o.customer, orders: 0 });
      map.get(key).orders += 1;
    });
    return Array.from(map.values());
  }, [orders]);
  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-[#1C1C1C] text-left"><tr>{["Name", "Phone", "Email", "City", "Orders"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y hairline">
          {customers.map((c, i) => (
            <tr key={i}><td className="px-3 py-2">{c.name}</td><td className="px-3 py-2">{c.phone}</td><td className="px-3 py-2">{c.email}</td><td className="px-3 py-2">{c.city}</td><td className="px-3 py-2">{c.orders}</td></tr>
          ))}
          {customers.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-[#A9A49A]">Customers appear here after their first order.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function SettingsAdmin({ settings, setSettings }) {
  const [f, setF] = useState({ ...settings, paymentMethods: settings.paymentMethods.join(", ") });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const [saved, setSaved] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setSettings({ ...f, deliveryCharge: Number(f.deliveryCharge) || 0, freeDeliveryOver: Number(f.freeDeliveryOver) || 0, paymentMethods: f.paymentMethods.split(",").map((s) => s.trim()).filter(Boolean) });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const fields = [
    ["brandName", "Brand Name"], ["tagline", "Homepage Tagline"], ["logoInitial", "Logo Initial"],
    ["phone", "Phone"], ["whatsapp", "WhatsApp Number"], ["email", "Email"],
    ["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"],
    ["address", "Store Address"], ["currency", "Currency Symbol"],
  ];
  return (
    <form onSubmit={submit} className="max-w-2xl space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(([k, label]) => (
          <label key={k} className="text-sm">
            <span className="block text-[12px] text-[#A9A49A] mb-1">{label}</span>
            <input value={f[k]} onChange={set(k)} className="w-full border hairline px-3 py-2" />
          </label>
        ))}
        <label className="text-sm"><span className="block text-[12px] text-[#A9A49A] mb-1">Delivery Charge</span><input type="number" value={f.deliveryCharge} onChange={set("deliveryCharge")} className="w-full border hairline px-3 py-2" /></label>
        <label className="text-sm"><span className="block text-[12px] text-[#A9A49A] mb-1">Free Delivery Over</span><input type="number" value={f.freeDeliveryOver} onChange={set("freeDeliveryOver")} className="w-full border hairline px-3 py-2" /></label>
      </div>
      <label className="text-sm block"><span className="block text-[12px] text-[#A9A49A] mb-1">Payment Methods (comma separated)</span><input value={f.paymentMethods} onChange={set("paymentMethods")} className="w-full border hairline px-3 py-2" /></label>
      <label className="text-sm block"><span className="block text-[12px] text-[#A9A49A] mb-1">Return Policy</span><textarea rows={3} value={f.returnPolicy} onChange={set("returnPolicy")} className="w-full border hairline px-3 py-2" /></label>
      <button className="bg-[#C6A15B] text-[#0D0D0D] px-6 py-2.5 text-sm hover:bg-[#D8B978] transition-colors">{saved ? "Saved ✓" : "Save Settings"}</button>
    </form>
  );
}

/* =========================================================================
   FOOTER
   ========================================================================= */
function Footer({ settings, go }) {
  return (
    <footer className="bg-[#171717] text-[#A9A49A] mt-6 border-t border-[#F5F1E8]/10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-[#0D0D0D] flex items-center justify-center font-display text-sm">{settings.logoInitial}</span>
            <span className="font-display text-lg text-[#C6A15B]">{settings.brandName}</span>
          </div>
          <p className="text-sm leading-relaxed">{settings.tagline}</p>
          <div className="flex gap-3 mt-4">
            <span className="p-2 border border-[#F5F1E8]/15"><Instagram size={15} /></span>
            <span className="p-2 border border-[#F5F1E8]/15"><Facebook size={15} /></span>
            <span className="p-2 border border-[#F5F1E8]/15"><Music2 size={15} /></span>
          </div>
        </div>
        <div>
          <h4 className="text-[#F5F1E8] text-sm mb-3">Shop</h4>
          <div className="flex flex-col gap-2 text-sm">
            <button onClick={() => go("shop", { type: "watch" })} className="text-left hover:text-[#C6A15B]">Watches</button>
            <button onClick={() => go("shop", { type: "bracelet" })} className="text-left hover:text-[#C6A15B]">Bracelets</button>
            <button onClick={() => go("cart")} className="text-left hover:text-[#C6A15B]">Cart</button>
          </div>
        </div>
        <div>
          <h4 className="text-[#F5F1E8] text-sm mb-3">Company</h4>
          <div className="flex flex-col gap-2 text-sm">
            <button onClick={() => go("about")} className="text-left hover:text-[#C6A15B]">About Us</button>
            <button onClick={() => go("contact")} className="text-left hover:text-[#C6A15B]">Contact Us</button>
            <button onClick={() => go("admin")} className="text-left hover:text-[#C6A15B]">Admin</button>
          </div>
        </div>
        <div>
          <h4 className="text-[#F5F1E8] text-sm mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span>{settings.phone}</span>
            <span>{settings.email}</span>
            <span>{settings.address}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</div>
    </footer>
  );
}
