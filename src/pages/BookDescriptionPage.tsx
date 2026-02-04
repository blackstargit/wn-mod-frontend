import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  StarHalf,
  BookOpen,
  Eye,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { novelApi } from "@/api/client";
import type { NovelDescription } from "@/types";
import ScrapingLoader from "@/components/BookDescription/ScrapingLoader";

interface BookDescriptionPageProps {}

const BookDescriptionPage: React.FC<BookDescriptionPageProps> = () => {
  const { book_id } = useParams<{ book_id: string }>();
  const [expandedVolumes, setExpandedVolumes] = useState<
    Record<number, boolean>
  >({});
  const [isTocExpanded, setIsTocExpanded] = useState(true);

  // Helper to parse chapter title
  const parseChapterTitle = (rawTitle: string) => {
    // Expected format matches: "1 Character sheet 1 years ago"
    // Regex: Start with number (index), End with date (time ago)
    const indexMatch = rawTitle.match(/^(\d+)\s+/);
    if (!indexMatch) return { index: "", title: rawTitle, date: "" };

    const index = indexMatch[1];
    let rest = rawTitle.substring(indexMatch[0].length);

    // Match date at the end (e.g., "1 years ago", "2 months ago", "just now")
    // Note: Webnovel dates are usually "X Y ago"
    const dateMatch = rest.match(
      /\s+(\d+\s+[a-zA-Z]+\s+ago|just now|yesterday|today)$/i,
    );

    let date = "";
    let title = rest;

    if (dateMatch) {
      date = dateMatch[1];
      title = rest.substring(0, rest.length - dateMatch[0].length).trim();
    }

    return { index, title, date };
  };
  const [bookData, setBookData] = useState<NovelDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingChapters, setScrapingChapters] = useState(false);
  const [chaptersScraped, setChaptersScraped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  // Poll for scraping status
  const pollScrapingStatus = async () => {
    if (!book_id) return;

    try {
      const statusResponse = await novelApi.getDescriptionStatus(book_id);
      const status = statusResponse.data.status;

      if (status === "ready") {
        // Scraping complete, fetch the data
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setScraping(false);
        fetchDescription();
      } else if (status === "failed") {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setScraping(false);
        setError("Failed to scrape description");
        setLoading(false);
      }
      // If status is "scraping" or "not_started", keep polling
    } catch (err) {
      console.error("Error polling status:", err);
    }
  };

  const fetchDescription = async () => {
    if (!book_id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await novelApi.getNovelDescription(book_id);

      // Check response status
      if (
        response.data.status === "scraping_started" ||
        response.data.status === "scraping"
      ) {
        // Start polling
        setScraping(true);
        setLoading(false);

        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(pollScrapingStatus, 3000); // Poll every 3 seconds
        }
      } else if (response.data.status === "ready") {
        // Data is ready
        setBookData(response.data.data);

        // Initialize expanded volumes (open first one by default)
        const initialExpanded: Record<number, boolean> = {};
        if (response.data.data.toc) {
          response.data.data.toc.forEach((_: any, idx: number) => {
            initialExpanded[idx] = idx === 0;
          });
        }
        setExpandedVolumes(initialExpanded);

        setScraping(false);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching description:", err);
      setError(err.response?.data?.detail || "Failed to load book description");
      setLoading(false);
      setScraping(false);
    }
  };

  // Check if chapters have been scraped
  const checkChaptersScraped = async () => {
    if (!book_id) return;
    try {
      const response = await novelApi.getChapters(book_id);
      setChaptersScraped(response.data && response.data.length > 0);
    } catch (err) {
      setChaptersScraped(false);
    }
  };

  // Handle chapter scraping
  const handleScrapeChapters = async () => {
    if (!book_id) return;
    setScrapingChapters(true);
    try {
      await novelApi.scrapeNovel(book_id);
      // Wait a bit then check if chapters were scraped
      setTimeout(() => {
        checkChaptersScraped();
        setScrapingChapters(false);
      }, 3000);
    } catch (err) {
      console.error("Error scraping chapters:", err);
      setScrapingChapters(false);
    }
  };

  useEffect(() => {
    fetchDescription();
    checkChaptersScraped();

    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [book_id]);

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />,
      );
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-slate-600" />,
      );
    }
    return stars;
  };

  // Helper to parse Webnovel specific emoji tags [img=code]
  const parseWebnovelEmojis = (text: string) => {
    if (!text) return "";

    const emojiMap: Record<string, string> = {
      // Common Webnovel Emojis
      smile: "🙂",
      joy: "😂",
      laugh: "😆",
      funny: "🤣",
      neutral: "😐",
      exp: "😑", // Expressionless
      disgusted: "🤮",
      angry: "😡",
      sad: "😢",
      cry: "😭",
      shocked: "😱",
      surprised: "😲",
      cool: "😎",
      proud: "😤",
      thinking: "🤔",
      love: "😍",
      kiss: "😘",
      sleepy: "😪",
      roll: "🙄",
      speechless: "😶",
      drool: "🤤",
      terrified: "😨",
      doubt: "🤨",
    };

    return text.replace(/\[img=([a-zA-Z0-9]+)\]/g, (match, code) => {
      return emojiMap[code.toLowerCase()] || match;
    });
  };

  // Show scraping loader
  if (scraping) {
    return <ScrapingLoader message="Fetching book details from Webnovel..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">
            {error || "Book not found"}
          </p>
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6 shadow-xl">
          {/* Title */}
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {bookData.title}
          </h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Rating */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {bookData.metadata.rating}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {bookData.metadata.rating_count} ratings
              </p>
            </div>

            {/* Views */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {bookData.metadata.views}
                </span>
              </div>
              <p className="text-sm text-slate-400">Views</p>
            </div>

            {/* Chapters */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {bookData.metadata.chapters}
                </span>
              </div>
              <p className="text-sm text-slate-400">Chapters</p>
            </div>

            {/* Tag */}
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-semibold text-white">
                  {bookData.metadata.tag}
                </span>
              </div>
              <p className="text-sm text-slate-400">Genre</p>
            </div>
          </div>

          {/* Status */}
          {bookData.metadata.status && bookData.metadata.status !== "0" && (
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4" />
              <span>{bookData.metadata.status} chs/week</span>
            </div>
          )}
        </div>

        {/* Content Section: Synopsis & TOC */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl mb-6">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                {bookData.synopsis}
              </p>
            </div>

            {/* Collapsible TOC */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden">
              <button
                onClick={() => setIsTocExpanded(!isTocExpanded)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-700/50 transition-colors"
              >
                <h2 className="text-xl font-bold text-white">
                  Table of Contents
                </h2>
                {isTocExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isTocExpanded && (
                <div className="p-4 bg-slate-900/20">
                  <div className="space-y-4">
                    {bookData.toc.map((volume, volumeIndex) => (
                      <div
                        key={volumeIndex}
                        className="border border-slate-700/30 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setExpandedVolumes((prev) => ({
                              ...prev,
                              [volumeIndex]: !prev[volumeIndex],
                            }));
                          }}
                          className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                        >
                          <h3 className="font-semibold text-purple-400">
                            {volume.volume}
                          </h3>
                          {expandedVolumes[volumeIndex] ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        {expandedVolumes[volumeIndex] && (
                          <div className="p-2 space-y-2 bg-slate-900/40">
                            {volume.chapters.map((chapter, chapterIndex) => {
                              const { index, title, date } = parseChapterTitle(
                                chapter.title,
                              );
                              return (
                                <a
                                  key={chapterIndex}
                                  href={chapter.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
                                    chapter.is_locked
                                      ? "bg-slate-900/30 text-slate-500 cursor-not-allowed"
                                      : "bg-slate-900/30 hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700/30 hover:border-purple-500/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    {index && (
                                      <span className="text-slate-500 font-mono text-sm min-w-[2rem]">
                                        {index}
                                      </span>
                                    )}
                                    <span
                                      className={`truncate ${chapter.is_locked ? "" : "group-hover:text-white"}`}
                                    >
                                      {title || chapter.title}
                                    </span>
                                  </div>
                                  {date && (
                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                                      {date}
                                    </span>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Reviews ({bookData.reviews.length})
          </h2>
          <div className="space-y-6">
            {bookData.reviews.length === 0 ? (
              <p className="text-center text-slate-400 py-12">No reviews yet</p>
            ) : (
              bookData.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 rounded-lg p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">
                        {review.user}
                      </h4>
                      {review.rating && (
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-slate-400">
                            {review.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {parseWebnovelEmojis(review.content)}
                  </p>

                  {/* Review Figure */}
                  {review.figure && (
                    <img
                      src={`http://127.0.0.1:8000/api/proxy-image?url=${encodeURIComponent(review.figure)}`}
                      alt="Review attachment"
                      className="rounded-lg max-w-md border border-slate-700/50"
                      onError={(e) => {
                        // Fallback: hide image if proxy fails
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center gap-4">
          {chaptersScraped ? (
            <Link
              to={`/read/${book_id}`}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              Start Reading
            </Link>
          ) : (
            <button
              onClick={handleScrapeChapters}
              disabled={scrapingChapters}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
            >
              {scrapingChapters ? (
                <>
                  <div className="w-5 h-5 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scraping Chapters...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 inline mr-2" />
                  Scrape Chapters
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDescriptionPage;
