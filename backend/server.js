
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();  // Çevre değişkenlerini yükle
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Bağlantısı
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ Hata: MONGO_URI tanımlanmamış!");
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB'ye başarıyla bağlandı"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

// Task Model (MongoDB Şeması)
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model("Task", taskSchema);

// API Rotaları
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Görevler alınamadı" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    console.log("📥 Gelen istek verisi:", req.body);  // Hata ayıklama için eklendi
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("❌ Görev ekleme hatası:", error);
    res.status(500).json({ error: "Görev eklenemedi" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Görev silindi" });
  } catch (error) {
    res.status(500).json({ error: "Silme işlemi başarısız" });
  }
});

// Sunucu Başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
