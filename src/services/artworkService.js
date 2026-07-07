// ============================================================
// artworkService.js
// Service layer for Artwork Master module
// Location: src/services/artworkService.js
// Bucket: artwork-files (create in Supabase Storage)
// ============================================================

import supabase from "../lib/supabase";

const BUCKET = "artwork-files";

export const APPROVAL_STATUSES = ["Pending", "Approved", "Rejected"];

// ─── FETCH ───────────────────────────────────────────────────

export async function fetchArtworks() {
  const { data, error } = await supabase
    .from("artworks")
    .select("id, product_id, version, file_url, file_name, approval_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchArtworks error:", error);
    throw new Error(error.message);
  }

  const artworks = data || [];

  // Enrich with product names manually
  if (artworks.length === 0) return artworks;

  const productIds = [...new Set(artworks.map(a => a.product_id).filter(Boolean))];
  const { data: products } = await supabase
    .from("products")
    .select("id, product_name, product_code")
    .in("id", productIds);

  const productMap = Object.fromEntries((products || []).map(p => [p.id, p]));

  return artworks.map(a => ({
    ...a,
    products: productMap[a.product_id] ?? null,
  }));
}

export async function fetchArtworksByProduct(productId) {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── PRODUCTS for dropdown ────────────────────────────────────

export async function fetchProductsForSelect() {
  const { data, error } = await supabase
    .from("products")
    .select("id, product_name, product_code")
    .eq("is_active", true)
    .order("product_name");

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── UPLOAD ──────────────────────────────────────────────────

export async function uploadArtwork({ productId, version, file, approvalStatus = "Pending" }) {
  // 1. Upload file to storage
  const ext       = file.name.split(".").pop();
  const uuid      = crypto.randomUUID();
  const storagePath = `${productId}/${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("uploadArtwork storage error:", uploadError);
    throw new Error(uploadError.message);
  }

  // 2. Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const fileUrl = urlData?.publicUrl ?? storagePath;

  // 3. Insert metadata row
  const { data, error: dbError } = await supabase
    .from("artworks")
    .insert([{
      product_id:      productId,
      version:         version?.trim() || "1.0",
      file_name:       file.name,
      file_url:        fileUrl,
      approval_status: approvalStatus,
    }])
    .select()
    .single();

  if (dbError) {
    // rollback storage
    await supabase.storage.from(BUCKET).remove([storagePath]);
    console.error("uploadArtwork db error:", dbError);
    throw new Error(dbError.message);
  }

  return data;
}

// ─── UPDATE approval status ───────────────────────────────────

export async function updateArtworkStatus(id, approvalStatus) {
  const { data, error } = await supabase
    .from("artworks")
    .update({ approval_status: approvalStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── DELETE ──────────────────────────────────────────────────

export async function deleteArtwork(id, fileUrl) {
  // Extract storage path from URL if possible
  if (fileUrl) {
    try {
      const url  = new URL(fileUrl);
      const path = url.pathname.split(`/${BUCKET}/`)[1];
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    } catch (_e) {
      // non-fatal: file may already be gone
    }
  }

  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ─── SIGNED download URL (60 min) ────────────────────────────

export async function getArtworkDownloadUrl(fileUrl) {
  try {
    const url  = new URL(fileUrl);
    const path = url.pathname.split(`/${BUCKET}/`)[1];
    if (!path) return fileUrl; // fallback to direct URL

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);

    if (error) throw new Error(error.message);
    return data.signedUrl;
  } catch (_e) {
    return fileUrl; // fallback
  }
}

// ─── Helpers ─────────────────────────────────────────────────

export function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(fileName) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName ?? "");
}

export const MAX_FILE_SIZE   = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_MIMES   = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
  "application/postscript",          // .ai / .eps
  "application/illustrator",
];