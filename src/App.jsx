import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_KEY = "DAph77eiWgW6u2lkvSc9rG8fGu6QStN0LWBi8o7C";

function App() {
  const [sound, setSound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favoriteSounds");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  const getPreviewUrl = (item) => {
    if (!item || !item.previews) return "";
    return (
      item.previews["preview-hq-mp3"] ||
      item.previews["preview-lq-mp3"] ||
      ""
    );
  };

  const fetchSound = async () => {
    try {
      setLoading(true);
      setError("");
      setIsPlaying(false);

      const url =
        `https://freesound.org/apiv2/search/text/` +
        `?query=ambient` +
        `&fields=id,name,username,previews` +
        `&page_size=20` +
        `&token=${API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No sounds found.");
      }

      const playableSounds = data.results.filter((item) => getPreviewUrl(item));

      if (playableSounds.length === 0) {
        throw new Error("No playable sound previews found.");
      }

      const randomIndex = Math.floor(Math.random() * playableSounds.length);
      const randomSound = playableSounds[randomIndex];

      setSound(randomSound);
    } catch (err) {
      setSound(null);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const saveFavorite = () => {
    if (!sound) return;

    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === sound.id);
      if (exists) return prev;

      const updated = [...prev, sound];
      localStorage.setItem("favoriteSounds", JSON.stringify(updated));
      return updated;
    });
  };

  const playFavorite = (favorite) => {
    setSound(favorite);
    setIsPlaying(false);
    setError("");

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          setError("Click play to start audio.");
        });
      }
    }, 100);
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("favoriteSounds", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetchSound();
  }, []);

  const previewUrl = getPreviewUrl(sound);

  return (
    <div className="app">
      <div className="card">
        <h1>Random Sound Player</h1>
        <p className="subtitle">Discover random audio clips</p>

        {loading && <p className="status">Loading sound...</p>}
        {error && !loading && <p className="error">{error}</p>}

        {!loading && !error && sound && (
          <div className="sound-box">
            <h2>{sound.name}</h2>
            <p>By: {sound.username}</p>

            <div className={`visualizer ${isPlaying ? "playing" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            {previewUrl ? (
              <audio
                ref={audioRef}
                controls
                src={previewUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support audio.
              </audio>
            ) : (
              <p className="error">No preview available for this sound.</p>
            )}

            <div className="button-row">
              <button onClick={fetchSound} disabled={loading}>
                {loading ? "Loading..." : "New Sound"}
              </button>
              <button
                onClick={saveFavorite}
                className="secondary-btn"
                disabled={!sound}
              >
                Save Favorite
              </button>
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="favorites-box">
            <h2>Saved Favorites</h2>

            {favorites.map((item) => (
              <div key={item.id} className="favorite-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>By: {item.username}</p>
                </div>

                <div className="favorite-actions">
                  <button onClick={() => playFavorite(item)}>Replay</button>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="delete-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;