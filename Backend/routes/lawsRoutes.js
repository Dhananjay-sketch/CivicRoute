import express from "express";
import { db } from "../firebaseAdmin.js";

const router = express.Router();

// GET /api/laws
// Returns all civic law/process documents from Firestore.
router.get("/laws", async (_req, res) => {
  try {
    const snapshot = await db.collection("laws").get();
    const laws = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(laws);
  } catch (error) {
    console.error("Error fetching laws:", error);
    return res.status(500).json({ message: "Failed to fetch laws." });
  }
});

// GET /api/laws/:id
// Returns one law/process document, including its processSteps array.
router.get("/laws/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lawRef = db.collection("laws").doc(id);
    const lawDoc = await lawRef.get();

    if (!lawDoc.exists) {
      return res.status(404).json({ message: "Law not found." });
    }

    const lawData = lawDoc.data();

    return res.status(200).json({
      id: lawDoc.id,
      ...lawData,
      processSteps: lawData?.processSteps || [],
    });
  } catch (error) {
    console.error("Error fetching law by id:", error);
    return res.status(500).json({ message: "Failed to fetch law." });
  }
});

// GET /api/search?q=query
// Performs a basic case-insensitive title filter for MVP search.
router.get("/search", async (req, res) => {
  try {
    const { q = "" } = req.query;
    const keyword = String(q).trim().toLowerCase();

    if (!keyword) {
      return res.status(400).json({ message: "Query parameter 'q' is required." });
    }

    const snapshot = await db.collection("laws").get();
    const matchingLaws = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((law) => String(law.title || "").toLowerCase().includes(keyword));

    return res.status(200).json(matchingLaws);
  } catch (error) {
    console.error("Error searching laws:", error);
    return res.status(500).json({ message: "Failed to search laws." });
  }
});

export default router;
