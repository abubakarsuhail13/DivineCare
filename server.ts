import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

// API Handlers
import productsHandler from "./api/products.js";
import categoriesHandler from "./api/categories.js";
import ordersHandler from "./api/orders.js";
import deliveryChargesHandler from "./api/delivery-charges.js";
import sendEmailHandler from "./api/send-email.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.all("/api/products", productsHandler);
  app.all("/api/categories", categoriesHandler);
  app.all("/api/orders", ordersHandler);
  app.all("/api/delivery-charges", deliveryChargesHandler);
  app.all("/api/send-email", sendEmailHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
