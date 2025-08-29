import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaSearch,
  FaRobot,
  FaTimes,
  FaHeart,
  FaMicrophone,
} from "react-icons/fa";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [likes, setLikes] = useState({});
  const [search, setSearch] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hi 👋 I'm your shopping assistant!" },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  // Load products
  useEffect(() => {
    axios
      .get("https://fakestoreapi.com/products?limit=60")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.find((p) => p.id === product.id);
    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((p) => p.id !== id));

  const changeQuantity = (id, delta) =>
    setCart(
      cart.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.max(1, p.quantity + delta) }
          : p
      )
    );

  const toggleLike = (id) => setLikes({ ...likes, [id]: !likes[id] });

  const cartTotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const discountedTotal = (cartTotal * (1 - discount / 100)).toFixed(2);

  const applyCoupon = () => {
    if (coupon === "SAVE10") setDiscount(10);
    else if (coupon === "SAVE20") setDiscount(20);
    else {
      setDiscount(0);
      alert("Invalid coupon");
    }
  };

  const placeOrder = () => {
    if (cart.length === 0) return alert("🛒 Cart is empty!");
    alert(`✅ Order placed! Total: ₹${discountedTotal}`);
    setCart([]);
    setDiscount(0);
    setCoupon("");
    setCartOpen(false);
  };

  // Voice input
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("🎤 Voice input not supported");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) =>
      setAiInput(event.results[0][0].transcript);
    recognition.onerror = () => alert("❌ Voice recognition failed");
    recognition.start();
  };

  // AI chat
  const sendAI = async () => {
    if (!aiInput.trim()) return;

    const prompt = `You are a friendly and knowledgeable online shopping assistant. 
Your job is to help the user quickly find the best products for their needs. 
Always reply in a clear and helpful tone, like a shop assistant who knows the market well. 

Guidelines:
- Suggest a few specific product options (2–4) instead of vague answers.
- Provide direct links from Amazon, Flipkart, Myntra, Meesho, Savana , Ajio or Nykaa where relevant.
- Always include the price (approximate if needed), and mention one or two key features (like material, size options, durability, style, or ratings).
- When comparing, highlight differences (e.g., price, quality, style, delivery).
- Never ask the user questions back; just give useful suggestions straight away.
- Do not use bold, italics, or asterisks formatting.
- Keep responses short, practical, and user-friendly.
- if user asks questions unrelated to kindly redirect the question and refrain from answer shopping unrelated question 
- don't provide links to products

User query: "${aiInput}"`;

    const newMessages = [...aiMessages, { role: "user", text: aiInput }];
    setAiMessages(newMessages);
    setAiInput("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai", // ✅ call backend
        { prompt }
      );

      console.log("🤖 Full Gemini API response:", response.data);

      let aiText = response.data.reply || "No response";

      // 🔹 remove asterisks formatting
      aiText = aiText.replace(/\*/g, "").trim();

      setAiMessages([...newMessages, { role: "assistant", text: aiText }]);
    } catch (err) {
      console.error("❌ Gemini API error:", err.response?.data || err.message);
      setAiMessages([
        ...newMessages,
        { role: "assistant", text: "Error fetching AI" },
      ]);
    }
  }; // ✅ this closing brace was missing before

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-lavender-100 to-white p-4 overflow-x-hidden">
      {/* Background Watermark */}
      <div className="absolute bottom-0 right-0 pointer-events-none z-0">
        <h1 className="text-[10rem] font-black text-purple-100 opacity-10 select-none">
          TRENDIFY AI
        </h1>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center mb-4 relative z-10">
        <h1 className="text-3xl font-bold text-purple-700">TRENDIFY AI</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg border-2 border-purple-500">
            <FaSearch className="text-purple-700 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none"
            />
          </div>
          <button className="relative" onClick={() => setCartOpen(!cartOpen)}>
            <FaShoppingCart className="text-2xl text-purple-600" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
          <motion.button
            className="bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={() => setAiOpen(!aiOpen)}
          >
            <FaRobot /> Chat
          </motion.button>
        </div>
      </header>

      {/* Ribbon */}
      <div className="overflow-hidden whitespace-nowrap mb-6 border-b border-purple-300 relative z-10">
        <div className="animate-scroll inline-block text-white bg-purple-500 px-4 py-2">
          Hello 👋 Welcome to Trendify! Enjoy shopping! &nbsp; • &nbsp; Hello 👋
          Welcome to Trendify! Enjoy shopping! &nbsp; • &nbsp;
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {products
          .filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-xl p-3 flex flex-col"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-40 object-contain mb-2"
              />
              <h2 className="font-semibold text-purple-700 mb-1 truncate">
                {product.title}
              </h2>
              <p className="text-purple-600 mb-1">₹{product.price}</p>
              <div className="flex gap-2 mb-2">
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(
                    product.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline text-sm"
                >
                  Amazon
                </a>
                <a
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(
                    product.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline text-sm"
                >
                  Flipkart
                </a>
              </div>
              <div className="flex justify-between items-center mt-auto">
                <button
                  onClick={() => addToCart(product)}
                  className="bg-purple-400 text-white px-3 py-1 rounded-lg"
                >
                  Add
                </button>
                <button onClick={() => toggleLike(product.id)}>
                  <FaHeart
                    color={likes[product.id] ? "red" : "gray"}
                    className={likes[product.id] ? "heart-shine" : ""}
                  />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <motion.div
          className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl p-4 flex flex-col z-20"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-purple-700">🛒 Cart ({cart.length})</h3>
            <button onClick={() => setCartOpen(false)}>
              <FaTimes />
            </button>
          </div>
          {cart.length === 0 && <p>Cart is empty</p>}
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center mb-1"
            >
              <span>
                {item.title} x {item.quantity}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => changeQuantity(item.id, -1)}
                  className="px-2 bg-purple-200 rounded"
                >
                  -
                </button>
                <button
                  onClick={() => changeQuantity(item.id, 1)}
                  className="px-2 bg-purple-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="px-2 bg-purple-500 text-white rounded"
                >
                  x
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon"
              className="flex-1 border rounded-lg px-2 py-1"
            />
            <button
              onClick={applyCoupon}
              className="bg-purple-400 text-white px-3 py-1 rounded-lg"
            >
              Apply
            </button>
          </div>
          <p className="font-bold mt-2 text-purple-700">
            Total: ₹{discountedTotal} {discount > 0 && `(Discount ${discount}%)`}
          </p>
          <button
            onClick={placeOrder}
            className="mt-2 w-full bg-purple-500 text-white py-2 rounded-lg"
          >
            Place Order
          </button>
        </motion.div>
      )}

      {/* AI Chat Drawer */}
      {aiOpen && (
        <motion.div
          className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl p-4 flex flex-col z-20"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700 font-semibold flex-1">
              Hello! I am your Virtual Shopping Assistant.
            </div>
            <button onClick={() => setAiOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-xs ${
                  msg.role === "user"
                    ? "ml-auto bg-lavender-200 text-right"
                    : "mr-auto bg-purple-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAI()}
              placeholder="Ask me..."
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              onClick={sendAI}
              className="bg-purple-400 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
            <button
              onClick={startVoiceInput}
              className="bg-lavender-300 text-purple-700 px-4 py-2 rounded-lg"
            >
              <FaMicrophone />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
