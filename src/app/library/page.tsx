"use client";

import PageMountSignaler from "@/components/PageMountSignaler";
import BookCard from "@/features/library/components/BookCard";
import DeleteBookDialog from "@/features/library/components/DeleteBookDialog";
import EditBookDialog from "@/features/library/components/EditBookDialog";
import LibraryBookSection from "@/features/library/components/LibraryBookSection";
import LibraryHeader from "@/features/library/components/LibraryHeader";
import { useLibraryData } from "@/features/library/hooks/useLibraryData";
import { useLibraryMutations } from "@/features/library/hooks/useLibraryMutations";
import type { Book, EditBookForm } from "@/features/library/types";
import PinVerifyModal from "@/features/read/[bookId]/components/PinVerifyModal";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { BOOK_GRID_STYLE, SECTION_TITLE_STYLE } from "@/features/library/const";
import { useTranslation } from "@/lib/i18n";


export default function LibraryPage() {
  const {
    books,
    continueBooks,
    favoriteIds,
    lastPages,
    isProcessing,
    loading,
    isBooksError,
    session,
    isAdmin,
  } = useLibraryData();

  const { t } = useTranslation();
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [pendingDeleteTarget, setPendingDeleteTarget] = useState<Book | null>(null);
  const [deletePinVerified, setDeletePinVerified] = useState(false);
  const [verifiedDeletePin, setVerifiedDeletePin] = useState("");

  const [editTarget, setEditTarget] = useState<Book | null>(null);
  const [pendingEditTarget, setPendingEditTarget] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState<EditBookForm>({
    bookId: "",
    title: "",
    author: "",
    description: "",
    coverUrl: "",
  });
  const [editPinVerified, setEditPinVerified] = useState(false);
  const [verifiedEditPin, setVerifiedEditPin] = useState("");

  const [pinModalPurpose, setPinModalPurpose] = useState<"edit" | "delete">("edit");
  const [showPinModal, setShowPinModal] = useState(false);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const { toggleFavMutation, deleteMutation, editMutation } = useLibraryMutations({
    onDeleteAuthError: (book: Book) => {
      setDeletePinVerified(false);
      setVerifiedDeletePin("");
      setPendingDeleteTarget(book);
      setPinModalPurpose("delete");
      setShowPinModal(true);
    },
    onEditAuthError: (bookId: string) => {
      const book = books.find((b) => b.id === bookId);
      if (book) {
        setEditPinVerified(false);
        setVerifiedEditPin("");
        setPendingEditTarget(book);
        setPinModalPurpose("edit");
        setShowPinModal(true);
      }
    },
  });

  const copyLink = useCallback((book: Book) => {
    const url = `${window.location.origin}/read/${book.id}?page=1`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }, []);

  const copyTitle = useCallback((book: Book) => {
    navigator.clipboard.writeText(`${book.title} — ${book.author}`);
    toast.success("Title copied to clipboard!");
  }, []);

  const handleToggleFavorite = useCallback(
    (book: Book) => {
      if (!session?.user) {
        toast.error("Sign in to favorite books.");
        return;
      }
      toggleFavMutation.mutate(book.id);
    },
    [session?.user, toggleFavMutation],
  );

  const openEditDialog = useCallback(
    (book: Book) => {
      if (!editPinVerified || !verifiedEditPin) {
        setPendingEditTarget(book);
        setPinModalPurpose("edit");
        setShowPinModal(true);
        return;
      }

      setEditTarget(book);
      setEditForm({
        bookId: book.id,
        title: book.title,
        author: book.author,
        description: book.description || "",
        coverUrl: book.coverUrl || "",
      });
    },
    [editPinVerified, verifiedEditPin],
  );

  const openDeleteDialog = useCallback(
    (book: Book) => {
      if (!deletePinVerified || !verifiedDeletePin) {
        setPendingDeleteTarget(book);
        setPinModalPurpose("delete");
        setShowPinModal(true);
        return;
      }

      setDeleteTarget(book);
    },
    [deletePinVerified, verifiedDeletePin],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    if (!deletePinVerified || !verifiedDeletePin) {
      setPendingDeleteTarget(deleteTarget);
      setPinModalPurpose("delete");
      setShowPinModal(true);
      return;
    }

    deleteMutation.mutate({
      bookId: deleteTarget.id,
      pin: verifiedDeletePin,
    });
    setDeleteTarget(null);
  }, [deleteMutation, deletePinVerified, deleteTarget, verifiedDeletePin]);

  const handleEditFieldChange = useCallback((field: keyof EditBookForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCoverFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setEditForm((prev) => ({ ...prev, coverUrl: data.url }));
      toast.success("Cover uploaded.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editTarget) return;
    if (!editPinVerified || !verifiedEditPin) {
      setPinModalPurpose("edit");
      setShowPinModal(true);
      return;
    }
    if (!editForm.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!editForm.author.trim()) {
      toast.error("Author is required.");
      return;
    }

    editMutation.mutate({
      bookId: editTarget.id,
      newBookId: editForm.bookId.trim() !== editTarget.id ? editForm.bookId.trim() : undefined,
      title: editForm.title.trim(),
      author: editForm.author.trim(),
      description: editForm.description.trim(),
      coverUrl: editForm.coverUrl.trim() || null,
      pin: verifiedEditPin,
    });
    setEditTarget(null);
  }, [editForm, editMutation, editPinVerified, editTarget, verifiedEditPin]);

  const handlePinVerified = useCallback(
    (pin: string) => {
      if (pinModalPurpose === "delete") {
        setDeletePinVerified(true);
        setVerifiedDeletePin(pin);
        if (pendingDeleteTarget) {
          setDeleteTarget(pendingDeleteTarget);
          setPendingDeleteTarget(null);
        }
      } else {
        setEditPinVerified(true);
        setVerifiedEditPin(pin);
        if (pendingEditTarget) {
          setEditTarget(pendingEditTarget);
          setEditForm({
            bookId: pendingEditTarget.id,
            title: pendingEditTarget.title,
            author: pendingEditTarget.author,
            description: pendingEditTarget.description || "",
            coverUrl: pendingEditTarget.coverUrl || "",
          });
          setPendingEditTarget(null);
        }
      }

      setShowPinModal(false);
    },
    [pendingDeleteTarget, pendingEditTarget, pinModalPurpose],
  );

  const renderCard = useCallback(
    (book: Book, index: number, isContinue: boolean) => {
      const href = isContinue ? `/read/${book.id}?page=${lastPages[book.id]}` : `/read/${book.id}?page=1`;

      return (
        <BookCard
          key={isContinue ? `continue-${book.id}` : book.id}
          book={book}
          index={index}
          isContinue={isContinue}
          continuePage={isContinue ? lastPages[book.id] : undefined}
          href={href}
          isFavorite={favoriteIds.has(book.id)}
          isProcessing={isProcessing(book)}
          isAdmin={isAdmin}
          hoveredCardId={hoveredBook}
          onHoverChange={setHoveredBook}
          onToggleFavorite={handleToggleFavorite}
          onCopyLink={copyLink}
          onCopyTitle={copyTitle}
          onOpenEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      );
    },
    [
      copyLink,
      copyTitle,
      favoriteIds,
      handleToggleFavorite,
      hoveredBook,
      isAdmin,
      isProcessing,
      lastPages,
      openDeleteDialog,
      openEditDialog,
    ],
  );

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          padding: "100px 32px 80px",
          maxWidth: 1300,
          margin: "0 auto",
          background: "var(--bg-primary)",
        }}
      >
        <LibraryHeader bookCount={books.length} isAdmin={isAdmin} />

        {loading ? (
          <div style={BOOK_GRID_STYLE}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="shimmer"
                style={{
                  height: 380,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-card)",
                }}
              />
            ))}
          </div>
        ) : isBooksError ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-tertiary)",
            }}
          >
            {`${t("library.errorLoadingBooks")} ${t("library.errorLoadingBooksDescription")}`}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            <LibraryBookSection
              title={t("library.continueReading")}
              books={continueBooks}
              wrapperStyle={{ marginTop: -16 }}
              renderCard={(book, index) => renderCard(book, index, true)}
            />

            <div>
              {continueBooks.length > 0 && (
                <h2 style={SECTION_TITLE_STYLE}>{t("library.library")}</h2>
              )}
              <div style={BOOK_GRID_STYLE}>
                {books.map((book, index) => renderCard(book, index, false))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteBookDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <EditBookDialog
        open={!!editTarget}
        form={editForm}
        isUploadingCover={isUploadingCover}
        isSaving={editMutation.isPending}
        coverFileInputRef={coverFileInputRef}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onFieldChange={handleEditFieldChange}
        onUploadClick={() => coverFileInputRef.current?.click()}
        onRemoveCover={() => setEditForm((prev) => ({ ...prev, coverUrl: "" }))}
        onFileChange={handleCoverFileChange}
        onSave={handleSaveEdit}
      />

      <PinVerifyModal
        isOpen={showPinModal}
        purpose={pinModalPurpose}
        onClose={() => {
          setShowPinModal(false);
          if (pinModalPurpose === "delete") {
            setPendingDeleteTarget(null);
          } else {
            setPendingEditTarget(null);
          }
        }}
        onVerified={handlePinVerified}
      />

      <PageMountSignaler />
    </>
  );
}
