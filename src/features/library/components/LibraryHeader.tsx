import { useTranslation } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useLibraryUpload } from "../hooks/useLibraryUpload";

type LibraryHeaderProps = {
  bookCount: number;
  isAdmin: boolean;
};

export default function LibraryHeader({ bookCount, isAdmin }: LibraryHeaderProps) {
  const { t } = useTranslation();
  const {
    uploadFile,
    uploadTitle,
    setUploadTitle,
    uploadBookId,
    setUploadBookId,
    isUploadingBook,
    handleUploadFileChange,
    handleConfirmUpload,
    uploadFileInputRef,
    openUploadDialog,
  } = useLibraryUpload(isAdmin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginBottom: 56,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          {t("library.title")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 0 }}>
          {bookCount} {t("library.bookCount")}
        </p>
      </div>

      {isAdmin && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
            minWidth: 280,
          }}
        >
          <input
            ref={uploadFileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleUploadFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={openUploadDialog}
            disabled={isUploadingBook}
            style={{
              borderRadius: 10,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              padding: "10px 14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {uploadFile ? `${t("library.selected")} ${uploadFile.name}` : t("library.uploadPdf")}
          </button>

          {uploadFile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <input
                type="text"
                value={uploadBookId}
                onChange={(e) => setUploadBookId(e.target.value)}
                placeholder={t("library.bookIdPlaceholder")}
                disabled={isUploadingBook}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  padding: "10px 12px",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={t("library.bookTitlePlaceholder")}
                  disabled={isUploadingBook}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    padding: "10px 12px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={isUploadingBook || !uploadTitle.trim()}
                  style={{
                    borderRadius: 10,
                    border: "none",
                    background: "var(--accent-primary)",
                    color: "white",
                    padding: "10px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isUploadingBook ? t("library.uploading") : t("common.confirm")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
