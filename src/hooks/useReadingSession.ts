import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { novelApi } from "@/api/client";

interface UseReadingSessionResult {
  sessionId: string | null;
  loadingSession: boolean;
}

export function useReadingSession(bookId: string): UseReadingSessionResult {
  const { session_id: urlSessionId } = useParams<{ session_id?: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(
    urlSessionId || null,
  );
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  useEffect(() => {
    if (!bookId) return;

    const initializeSession = async () => {
      // 1. If URL has valid session, trust it (and save it)
      if (urlSessionId) {
        setSessionId(urlSessionId);
        localStorage.setItem(`novel_session_${bookId}`, urlSessionId);
        setLoadingSession(false);
        return;
      }

      // 2. Check Local Storage for cached session
      const cachedSession = localStorage.getItem(`novel_session_${bookId}`);
      if (cachedSession) {
        // Redirect to cached session
        navigate(`/read/${bookId}/${cachedSession}`, { replace: true });
        return;
      }

      // 3. Check Backend
      try {
        const response = await novelApi.getNovel(bookId);
        const lastRead = response.data.last_read_chapter;
        const isUuid =
          typeof lastRead === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            lastRead,
          );

        if (isUuid) {
          // Found in backend -> Redirect
          localStorage.setItem(`novel_session_${bookId}`, lastRead);
          navigate(`/read/${bookId}/${lastRead}`, { replace: true });
          return;
        }
      } catch (e) {
        console.warn("Failed to fetch novel metadata for session init", e);
      }

      // 4. Generate New
      const newSession = uuidv4();
      localStorage.setItem(`novel_session_${bookId}`, newSession);
      // We also update backend immediately to claim this session?
      // Or wait for progress update? Better wait for progress.
      navigate(`/read/${bookId}/${newSession}`, { replace: true });
    };

    initializeSession();
  }, [bookId, urlSessionId, navigate]);

  return { sessionId, loadingSession };
}
