import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { novelApi } from "../api/client";
import type { Chapter } from "../types";

const Reader: React.FC = () => {
  const { book_id } = useParams<{ book_id: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book_id) {
      loadChapters();
    }
  }, [book_id]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const response = await novelApi.getChapters(book_id!);
      setChapters(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-xl border border-slate-700/50">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {currentChapter.title}
        </h1>
        <p className="text-slate-400 mb-6">
          Chapter {currentChapterIndex + 1} of {chapters.length}
        </p>

        <div className="prose prose-invert max-w-none mb-8">
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
            {currentChapter.content}
          </div>
        </div>

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
            🔊 Text-to-Speech
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

export default Reader;
