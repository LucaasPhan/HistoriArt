import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function useLibraryUpload(isAdmin: boolean) {
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadBookId, setUploadBookId] = useState("");
  const [isUploadingBook, setIsUploadingBook] = useState(false);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Please upload a valid PDF file.");
      if (e.target) e.target.value = "";
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.pdf$/i, ""));
    if (e.target) e.target.value = "";
  }, []);

  const handleConfirmUpload = useCallback(async () => {
    if (!isAdmin) {
      toast.error("Admin access required.");
      return;
    }
    if (!uploadFile) {
      toast.error("Please select a PDF file.");
      return;
    }

    const title = uploadTitle.trim();
    if (!title) {
      toast.error("Please enter a title.");
      return;
    }

    try {
      setIsUploadingBook(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", title);
      if (uploadBookId.trim()) {
        formData.append("book_id", uploadBookId.trim());
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Book uploaded.");
      setUploadFile(null);
      setUploadTitle("");
      setUploadBookId("");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploadingBook(false);
    }
  }, [isAdmin, queryClient, uploadFile, uploadTitle, uploadBookId]);

  const openUploadDialog = useCallback(() => {
    uploadFileInputRef.current?.click();
  }, []);

  return {
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
  };
}
