import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { novelApi } from "@/api/client";
import type { Chapter, Novel } from "@/types";

const ReaderPage: React.FC = () => {
  const { book_id, chapter } = useParams<{
    book_id: string;
    chapter?: string;
  }>();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book_id) {
      loadNovelAndChapters();
    }
  }, [book_id]);

  // Update URL when chapter changes
  useEffect(() => {
    if (book_id && chapters.length > 0) {
      const chapterNumber = currentChapterIndex + 1;
      navigate(`/read/${book_id}/${chapterNumber}`, { replace: true });
      updateReadProgress();
    }
  }, [currentChapterIndex, book_id, chapters.length, navigate]);

  const loadNovelAndChapters = async () => {
    try {
      setLoading(true);

      // Load novel metadata
      const novelResponse = await novelApi.getNovel(book_id!);
      setNovel(novelResponse.data);

      // Load chapters
      const chaptersResponse = await novelApi.getChapters(book_id!);
      setChapters(chaptersResponse.data);

      // Determine initial chapter
      let initialChapterIndex = 0;

      if (chapter) {
        // If chapter is in URL, use that (1-indexed)
        initialChapterIndex = parseInt(chapter) - 1;
      } else if (novelResponse.data.last_read_chapter > 0) {
        // Otherwise, use last_read_chapter from backend (1-indexed)
        initialChapterIndex = novelResponse.data.last_read_chapter - 1;
      }

      // Ensure index is valid
      if (initialChapterIndex >= chaptersResponse.data.length) {
        initialChapterIndex = chaptersResponse.data.length - 1;
      }
      if (initialChapterIndex < 0) {
        initialChapterIndex = 0;
      }

      setCurrentChapterIndex(initialChapterIndex);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateReadProgress = async () => {
    try {
      await novelApi.updateMetadata(book_id!, {
        last_read_chapter: currentChapterIndex + 1, // 1-indexed
        last_accessed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update read progress:", error);
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleTTS = () => {
    if (currentChapter) {
      const utterance = new SpeechSynthesisUtterance(currentChapter.content);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">
          No chapters available. Please scrape the novel first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Back to Library
        </button>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-xl border border-slate-700/50">
        {/* Chapter Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white">
            {currentChapter.title}
          </h1>
          <div className="flex items-center gap-4 text-slate-400">
            <p>
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </p>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Progress Saved
            </span>
            {novel?.title && (
              <p className="text-sm text-slate-500">({novel.title})</p>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        <div className="prose prose-invert max-w-none mb-8">
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed text-lg">
            {currentChapter.content}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-4 justify-between items-center border-t border-slate-700 pt-6">
          <button
            onClick={handlePrevious}
            disabled={currentChapterIndex === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
          >
            ← Previous
          </button>

          <button
            onClick={handleTTS}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
          >
            🔊 TTS
          </button>

          <button
            onClick={handleNext}
            disabled={currentChapterIndex === chapters.length - 1}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReaderPage;
