import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { novelApi } from "../api/client";
import type { Chapter } from "../types";

const Reader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const synth = window.speechSynthesis;

  useEffect(() => {
    if (id) loadChapters(parseInt(id));
    return () => {
      synth.cancel();
    };
  }, [id]);

  const loadChapters = async (novelId: number) => {
    try {
      const response = await novelApi.getChapters(novelId);
      setChapters(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTTS = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      const chapter = chapters[currentChapterIndex];
      if (!chapter) return;

      const utterance = new SpeechSynthesisUtterance(chapter.content);
      utterance.onend = () => setIsPlaying(false);
      synth.speak(utterance);
      setIsPlaying(true);
    }
  };

  const currentChapter = chapters[currentChapterIndex];

  if (!currentChapter) return <div>Loading or No Chapters...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 border-b">
        <button
          disabled={currentChapterIndex <= 0}
          onClick={() => setCurrentChapterIndex((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <h1 className="text-xl font-bold truncate max-w-md">
          {currentChapter.title}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleTTS}
            className={`px-4 py-2 text-white rounded ${isPlaying ? "bg-red-500" : "bg-blue-500"}`}
          >
            {isPlaying ? "Stop TTS" : "Play TTS"}
          </button>
          <button
            disabled={currentChapterIndex >= chapters.length - 1}
            onClick={() => setCurrentChapterIndex((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="prose lg:prose-xl mx-auto whitespace-pre-wrap font-serif leading-loose">
        {currentChapter.content}
      </div>
    </div>
  );
};

export default Reader;
